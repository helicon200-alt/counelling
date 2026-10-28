// Firestore 문서 구조와 동일한 앱 타입. 날짜는 앱 안에서 Date로 다룬다.

export type UserRole = 'admin' | 'member' | 'pending'

/** users/{uid} */
export interface AppUser {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  role: UserRole
  createdAt: Date
}

export type MaterialType = 'research' | 'lecture'

/** materials/{id} */
export interface Material {
  id: string
  title: string
  summary: string
  body: string
  type: MaterialType
  tags: string[]
  linkUrl?: string
  authorUid: string
  createdAt: Date
  updatedAt: Date
}

/** 자료 작성·수정 폼에서 넘기는 값 */
export type MaterialInput = Pick<Material, 'title' | 'summary' | 'body' | 'type' | 'tags' | 'linkUrl'>

/** materials/{id}/comments/{commentId} */
export interface Comment {
  id: string
  body: string
  authorUid: string
  authorName: string
  createdAt: Date
  updatedAt: Date
}

export const MATERIAL_TYPE_LABEL: Record<MaterialType, string> = {
  research: '연구',
  lecture: '수업',
}

export const COMMENT_MAX_LENGTH = 2000
