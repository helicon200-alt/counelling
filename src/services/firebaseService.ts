import { initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore'
import type { AppUser, Comment, Material, MaterialInput, UserRole } from '../types'
import { firebaseConfig, isAdminEmail } from './config'
import { PAGE_SIZE, type DataService, type MaterialPage } from './types'

// 서버 타임스탬프가 아직 확정되지 않은 경우(방금 쓴 댓글 등) 추정값을 사용
const SNAPSHOT_OPTIONS = { serverTimestamps: 'estimate' } as const

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date()
}

function toUser(uid: string, data: DocumentData): AppUser {
  return {
    uid,
    displayName: data.displayName ?? '',
    email: data.email ?? '',
    photoURL: data.photoURL ?? null,
    role: data.role as UserRole,
    createdAt: toDate(data.createdAt),
  }
}

function toMaterial(snap: DocumentSnapshot): Material {
  const data = snap.data(SNAPSHOT_OPTIONS) ?? {}
  return {
    id: snap.id,
    title: data.title ?? '',
    summary: data.summary ?? '',
    body: data.body ?? '',
    type: data.type,
    tags: Array.isArray(data.tags) ? data.tags : [],
    linkUrl: data.linkUrl || undefined,
    authorUid: data.authorUid ?? '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

function toComment(snap: DocumentSnapshot): Comment {
  const data = snap.data(SNAPSHOT_OPTIONS) ?? {}
  return {
    id: snap.id,
    body: data.body ?? '',
    authorUid: data.authorUid ?? '',
    authorName: data.authorName ?? '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

export function createFirebaseService(): DataService {
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  const isAdminAccount = (user: FirebaseUser) => user.emailVerified && isAdminEmail(user.email)

  /** 로그인한 사용자의 users/{uid} 문서를 읽고, 없으면 새로 만든다. */
  async function loadOrCreateUser(user: FirebaseUser): Promise<AppUser> {
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    const admin = isAdminAccount(user)

    if (!snap.exists()) {
      // 첫 로그인: 관리자 이메일이면 admin, 아니면 승인 대기
      const role: UserRole = admin ? 'admin' : 'pending'
      await setDoc(ref, {
        displayName: user.displayName ?? '',
        email: user.email ?? '',
        photoURL: user.photoURL ?? null,
        role,
        createdAt: serverTimestamp(),
      })
      return {
        uid: user.uid,
        displayName: user.displayName ?? '',
        email: user.email ?? '',
        photoURL: user.photoURL ?? null,
        role,
        createdAt: new Date(),
      }
    }

    const appUser = toUser(user.uid, snap.data())
    // 보안 규칙도 이메일로 관리자를 판별하므로 화면도 같은 기준을 따른다
    return admin ? { ...appUser, role: 'admin' } : appUser
  }

  return {
    isDemo: false,

    onAuthChange(callback) {
      return onAuthStateChanged(auth, async (user) => {
        if (!user) {
          callback(null)
          return
        }
        try {
          callback(await loadOrCreateUser(user))
        } catch (error) {
          console.error('사용자 정보를 불러오지 못했습니다.', error)
          callback(null)
        }
      })
    },

    async signInWithGoogle() {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
    },

    async signInDemo() {
      throw new Error('데모 체험 로그인은 Firebase 연결 시 사용할 수 없습니다.')
    },

    async signOut() {
      await firebaseSignOut(auth)
    },

    async reloadCurrentUser() {
      const user = auth.currentUser
      return user ? loadOrCreateUser(user) : null
    },

    // 목록은 실시간 리스너 없이 한 번만 읽는다(읽기 횟수 절약)
    async listMaterials({ type, cursor, pageSize = PAGE_SIZE } = {}): Promise<MaterialPage> {
      const constraints: QueryConstraint[] = []
      if (type) constraints.push(where('type', '==', type))
      constraints.push(orderBy('createdAt', 'desc'))
      if (cursor) constraints.push(startAfter(cursor as DocumentSnapshot))
      constraints.push(limit(pageSize))

      const snap = await getDocs(query(collection(db, 'materials'), ...constraints))
      const docs = snap.docs
      return {
        items: docs.map(toMaterial),
        nextCursor: docs.length === pageSize ? docs[docs.length - 1] : null,
      }
    },

    async getMaterial(id) {
      const snap = await getDoc(doc(db, 'materials', id))
      return snap.exists() ? toMaterial(snap) : null
    },

    async createMaterial(input, authorUid) {
      const { linkUrl, ...rest } = input
      const ref = await addDoc(collection(db, 'materials'), {
        ...rest,
        ...(linkUrl ? { linkUrl } : {}),
        authorUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return ref.id
    },

    async updateMaterial(id, input: MaterialInput) {
      const { linkUrl, ...rest } = input
      await updateDoc(doc(db, 'materials', id), {
        ...rest,
        linkUrl: linkUrl ? linkUrl : deleteField(),
        updatedAt: serverTimestamp(),
      })
    },

    async deleteMaterial(id) {
      // 하위 댓글도 함께 지운다(관리자는 모든 댓글 삭제 가능)
      const commentSnap = await getDocs(collection(db, 'materials', id, 'comments'))
      await Promise.all(commentSnap.docs.map((d) => deleteDoc(d.ref)))
      await deleteDoc(doc(db, 'materials', id))
    },

    // 실시간 리스너는 열려 있는 자료의 댓글에만 사용. 반환된 함수로 반드시 해제한다.
    subscribeComments(materialId, onChange, onError) {
      const q = query(collection(db, 'materials', materialId, 'comments'), orderBy('createdAt', 'asc'), limit(300))
      return onSnapshot(
        q,
        (snap) => onChange(snap.docs.map(toComment)),
        (error) => onError(error),
      )
    },

    async addComment(materialId, { body, authorUid, authorName }) {
      await addDoc(collection(db, 'materials', materialId, 'comments'), {
        body,
        authorUid,
        authorName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    },

    async updateComment(materialId, commentId, body) {
      await updateDoc(doc(db, 'materials', materialId, 'comments', commentId), {
        body,
        updatedAt: serverTimestamp(),
      })
    },

    async deleteComment(materialId, commentId) {
      await deleteDoc(doc(db, 'materials', materialId, 'comments', commentId))
    },

    async listPendingUsers() {
      // 복합 색인이 필요 없도록 정렬은 화면에서 한다
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'pending'), limit(100)))
      return snap.docs
        .map((d) => toUser(d.id, d.data()))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    },

    async approveUser(uid) {
      await updateDoc(doc(db, 'users', uid), { role: 'member' })
    },

    async rejectUser(uid) {
      await deleteDoc(doc(db, 'users', uid))
    },
  }
}
