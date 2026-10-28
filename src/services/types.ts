import type { AppUser, Comment, Material, MaterialInput, MaterialType } from '../types'

export type Unsubscribe = () => void

/** 페이지네이션 커서. 구현체마다 내용이 다르므로 UI는 그대로 돌려주기만 한다. */
export type PageCursor = unknown

export interface MaterialPage {
  items: Material[]
  nextCursor: PageCursor | null
}

export interface ListMaterialsOptions {
  type?: MaterialType
  cursor?: PageCursor | null
  pageSize?: number
}

/**
 * UI가 사용하는 유일한 데이터 접근 창구.
 * mockService(데모)와 firebaseService(실제)가 같은 인터페이스를 구현한다.
 */
export interface DataService {
  readonly isDemo: boolean

  // ── 인증 ──
  onAuthChange(callback: (user: AppUser | null) => void): Unsubscribe
  signInWithGoogle(): Promise<void>
  /** 데모 모드 전용 체험 로그인 */
  signInDemo(role: 'admin' | 'member'): Promise<void>
  signOut(): Promise<void>
  /** 승인 여부를 다시 확인할 때 사용 */
  reloadCurrentUser(): Promise<AppUser | null>

  // ── 자료 ──
  listMaterials(options?: ListMaterialsOptions): Promise<MaterialPage>
  getMaterial(id: string): Promise<Material | null>
  createMaterial(input: MaterialInput, authorUid: string): Promise<string>
  updateMaterial(id: string, input: MaterialInput): Promise<void>
  deleteMaterial(id: string): Promise<void>

  // ── 댓글 (실시간) ──
  subscribeComments(
    materialId: string,
    onChange: (comments: Comment[]) => void,
    onError: (error: Error) => void,
  ): Unsubscribe
  addComment(materialId: string, comment: Pick<Comment, 'body' | 'authorUid' | 'authorName'>): Promise<void>
  updateComment(materialId: string, commentId: string, body: string): Promise<void>
  deleteComment(materialId: string, commentId: string): Promise<void>

  // ── 회원 관리 (관리자) ──
  listPendingUsers(): Promise<AppUser[]>
  approveUser(uid: string): Promise<void>
  /** 거절: 사용자 문서를 삭제한다. 다시 로그인하면 새로 승인 대기 상태가 된다. */
  rejectUser(uid: string): Promise<void>
}

export const PAGE_SIZE = 20
