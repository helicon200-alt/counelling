import { isDemoMode } from './config'
import { createFirebaseService } from './firebaseService'
import { createMockService } from './mockService'
import type { DataService } from './types'

// VITE_FIREBASE_API_KEY 유무로 구현체를 자동 선택한다.
export const dataService: DataService = isDemoMode ? createMockService() : createFirebaseService()

export { isDemoMode }
export { PAGE_SIZE } from './types'
export type { DataService, PageCursor } from './types'
