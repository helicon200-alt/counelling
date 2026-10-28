import type { AppUser, Comment, Material, MaterialInput } from '../types'
import { adminEmail } from './config'
import { PAGE_SIZE, type DataService, type MaterialPage, type Unsubscribe } from './types'

// 데모 모드용 메모리 저장소. 새로고침하면 처음 상태로 돌아간다.

const DEMO_SESSION_KEY = 'demoRole'

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

const demoAdmin: AppUser = {
  uid: 'demo-admin',
  displayName: '연구실 교수(체험)',
  email: adminEmail || 'admin@demo.local',
  photoURL: null,
  role: 'admin',
  createdAt: daysAgo(120),
}

const demoMember: AppUser = {
  uid: 'demo-member',
  displayName: '대학원생(체험)',
  email: 'member@demo.local',
  photoURL: null,
  role: 'member',
  createdAt: daysAgo(60),
}

function createSampleUsers(): AppUser[] {
  return [
    demoAdmin,
    demoMember,
    { uid: 'demo-pending-1', displayName: '신규 대학원생 A', email: 'student-a@demo.local', photoURL: null, role: 'pending', createdAt: daysAgo(2) },
    { uid: 'demo-pending-2', displayName: '신규 대학원생 B', email: 'student-b@demo.local', photoURL: null, role: 'pending', createdAt: daysAgo(1) },
  ]
}

function createSampleMaterials(): Material[] {
  const base = { authorUid: demoAdmin.uid }
  return [
    {
      ...base,
      id: 'm1',
      title: '대학생 정서조절 프로그램 효과 연구 계획',
      summary: '정서조절 집단상담 프로그램의 효과를 검증하기 위한 연구 설계 초안입니다.',
      body: '1. 연구 목적\n대학생의 정서조절 곤란을 낮추기 위한 8회기 집단 프로그램의 효과를 검증한다.\n\n2. 연구 설계\n- 사전·사후·추후 검사를 포함한 준실험 설계\n- 측정 도구: 정서조절곤란척도(DERS), 우울·불안 척도\n\n3. 논의할 점\n통제집단 구성 방식과 탈락률 관리 방안을 의견 부탁드립니다.',
      type: 'research',
      tags: ['정서조절', '집단상담', '연구설계'],
      linkUrl: 'https://drive.google.com/',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      ...base,
      id: 'm2',
      title: '상담이론 3주차: 인간중심 상담',
      summary: '로저스의 인간중심 접근과 핵심 조건(공감, 무조건적 존중, 진실성)을 다룹니다.',
      body: '이번 주 읽기 자료와 토론 질문입니다.\n\n읽기: 교재 5장\n\n토론 질문\n1. 무조건적 긍정적 존중은 실제 상담 장면에서 어떻게 드러나는가?\n2. 대학상담 환경에서 인간중심 접근의 장점과 한계는?',
      type: 'lecture',
      tags: ['상담이론', '인간중심'],
      linkUrl: 'https://drive.google.com/',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      ...base,
      id: 'm3',
      title: '위기상담 개입 매뉴얼 검토',
      summary: '학생상담센터 위기 개입 절차를 최신 지침에 맞게 정리한 검토 자료입니다.',
      body: '위기 평가 단계, 안전 계획 수립, 의뢰 절차를 단계별로 정리했습니다.\n\n각 단계에서 보완이 필요한 부분을 댓글로 남겨 주세요.',
      type: 'research',
      tags: ['위기개입', '매뉴얼'],
      createdAt: daysAgo(7),
      updatedAt: daysAgo(5),
    },
    {
      ...base,
      id: 'm4',
      title: '상담연구방법론: 질적 연구 코딩 실습',
      summary: '근거이론 방식의 개방코딩·축코딩 실습 안내입니다.',
      body: '실습 순서\n1. 제공된 가상 인터뷰 전사본 읽기\n2. 개방코딩 30개 이상 도출\n3. 범주화 후 축코딩 패러다임 작성\n\n※ 실습 자료는 모두 가상으로 만든 것입니다.',
      type: 'lecture',
      tags: ['질적연구', '근거이론', '실습'],
      linkUrl: 'https://docs.google.com/',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(10),
    },
    {
      ...base,
      id: 'm5',
      title: '학술대회 발표 준비: 포스터 초안',
      summary: '하반기 학술대회 포스터 발표 초안과 일정입니다.',
      body: '포스터 초안을 공유합니다.\n\n마감: 다음 달 말\n역할 분담은 다음 연구실 회의에서 정하겠습니다.',
      type: 'research',
      tags: ['학술대회', '발표'],
      createdAt: daysAgo(14),
      updatedAt: daysAgo(14),
    },
  ]
}

function createSampleComments(): Record<string, Comment[]> {
  return {
    m1: [
      { id: 'c1', body: '통제집단은 대기자 통제집단으로 구성하면 윤리적 부담이 줄 것 같습니다.', authorUid: demoMember.uid, authorName: demoMember.displayName, createdAt: daysAgo(0.8), updatedAt: daysAgo(0.8) },
      { id: 'c2', body: '좋은 의견입니다. 다음 회의 때 함께 논의합시다.', authorUid: demoAdmin.uid, authorName: demoAdmin.displayName, createdAt: daysAgo(0.5), updatedAt: daysAgo(0.5) },
    ],
    m2: [
      { id: 'c3', body: '2번 질문에 대해, 단기상담 구조에서는 시간 제약이 한계가 될 수 있을 것 같습니다.', authorUid: demoMember.uid, authorName: demoMember.displayName, createdAt: daysAgo(2), updatedAt: daysAgo(2) },
    ],
  }
}

const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))
const newId = () => Math.random().toString(36).slice(2, 10)

export function createMockService(): DataService {
  const users = createSampleUsers()
  let materials = createSampleMaterials()
  const comments = createSampleComments()

  let currentUser: AppUser | null = null
  const authListeners = new Set<(user: AppUser | null) => void>()
  const commentListeners = new Map<string, Set<(comments: Comment[]) => void>>()

  // 새로고침해도 체험 역할은 유지한다(데이터는 초기화됨)
  try {
    const saved = sessionStorage.getItem(DEMO_SESSION_KEY)
    if (saved === 'admin') currentUser = demoAdmin
    if (saved === 'member') currentUser = demoMember
  } catch {
    // 저장소 접근 불가 시 무시
  }

  const emitAuth = () => authListeners.forEach((cb) => cb(currentUser))

  const sortedComments = (materialId: string) =>
    [...(comments[materialId] ?? [])].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  const emitComments = (materialId: string) => {
    const list = sortedComments(materialId)
    commentListeners.get(materialId)?.forEach((cb) => cb(list))
  }

  const findComment = (materialId: string, commentId: string) => {
    const found = comments[materialId]?.find((c) => c.id === commentId)
    if (!found) throw new Error('댓글을 찾을 수 없습니다.')
    return found
  }

  const requireUser = () => {
    if (!currentUser) throw new Error('로그인이 필요합니다.')
    return currentUser
  }

  const requireAdmin = () => {
    if (requireUser().role !== 'admin') throw new Error('관리자 권한이 필요합니다.')
  }

  return {
    isDemo: true,

    onAuthChange(callback) {
      authListeners.add(callback)
      setTimeout(() => callback(currentUser), 0)
      return () => {
        authListeners.delete(callback)
      }
    },

    async signInWithGoogle() {
      throw new Error('데모 모드에서는 Google 로그인을 사용할 수 없습니다. 체험 버튼을 이용하세요.')
    },

    async signInDemo(role) {
      await wait()
      currentUser = role === 'admin' ? demoAdmin : demoMember
      try {
        sessionStorage.setItem(DEMO_SESSION_KEY, role)
      } catch {
        // 무시
      }
      emitAuth()
    },

    async signOut() {
      currentUser = null
      try {
        sessionStorage.removeItem(DEMO_SESSION_KEY)
      } catch {
        // 무시
      }
      emitAuth()
    },

    async reloadCurrentUser() {
      await wait()
      return currentUser
    },

    async listMaterials({ type, cursor, pageSize = PAGE_SIZE } = {}): Promise<MaterialPage> {
      await wait()
      requireUser()
      const filtered = materials
        .filter((m) => !type || m.type === type)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      // 데모에서는 커서를 "다음 시작 위치" 숫자로 사용
      const start = typeof cursor === 'number' ? cursor : 0
      const items = filtered.slice(start, start + pageSize)
      const next = start + pageSize
      return { items: items.map((m) => ({ ...m })), nextCursor: next < filtered.length ? next : null }
    },

    async getMaterial(id) {
      await wait()
      requireUser()
      const found = materials.find((m) => m.id === id)
      return found ? { ...found } : null
    },

    async createMaterial(input, authorUid) {
      await wait()
      requireAdmin()
      const now = new Date()
      const id = newId()
      materials.push({ ...input, id, authorUid, createdAt: now, updatedAt: now })
      return id
    },

    async updateMaterial(id, input: MaterialInput) {
      await wait()
      requireAdmin()
      materials = materials.map((m) => (m.id === id ? { ...m, ...input, updatedAt: new Date() } : m))
    },

    async deleteMaterial(id) {
      await wait()
      requireAdmin()
      materials = materials.filter((m) => m.id !== id)
      delete comments[id]
      emitComments(id)
    },

    subscribeComments(materialId, onChange): Unsubscribe {
      const set = commentListeners.get(materialId) ?? new Set()
      set.add(onChange)
      commentListeners.set(materialId, set)
      setTimeout(() => onChange(sortedComments(materialId)), 0)
      return () => {
        set.delete(onChange)
      }
    },

    async addComment(materialId, { body, authorUid, authorName }) {
      await wait()
      const user = requireUser()
      if (user.uid !== authorUid) throw new Error('본인 이름으로만 댓글을 작성할 수 있습니다.')
      const now = new Date()
      comments[materialId] = [...(comments[materialId] ?? []), { id: newId(), body, authorUid, authorName, createdAt: now, updatedAt: now }]
      emitComments(materialId)
    },

    async updateComment(materialId, commentId, body) {
      await wait()
      const user = requireUser()
      const target = findComment(materialId, commentId)
      if (target.authorUid !== user.uid) throw new Error('본인 댓글만 수정할 수 있습니다.')
      target.body = body
      target.updatedAt = new Date()
      emitComments(materialId)
    },

    async deleteComment(materialId, commentId) {
      await wait()
      const user = requireUser()
      const target = findComment(materialId, commentId)
      if (target.authorUid !== user.uid && user.role !== 'admin') throw new Error('삭제 권한이 없습니다.')
      comments[materialId] = comments[materialId].filter((c) => c.id !== commentId)
      emitComments(materialId)
    },

    async listPendingUsers() {
      await wait()
      requireAdmin()
      return users.filter((u) => u.role === 'pending').map((u) => ({ ...u }))
    },

    async approveUser(uid) {
      await wait()
      requireAdmin()
      const target = users.find((u) => u.uid === uid)
      if (target) target.role = 'member'
    },

    async rejectUser(uid) {
      await wait()
      requireAdmin()
      const index = users.findIndex((u) => u.uid === uid)
      if (index >= 0) users.splice(index, 1)
    },
  }
}
