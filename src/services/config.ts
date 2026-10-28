// 환경변수 읽기. 실제 값은 .env(로컬) 또는 Netlify 환경변수에서 들어온다.
const env = import.meta.env

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.VITE_FIREBASE_APP_ID ?? '',
}

export const adminEmail = (env.VITE_ADMIN_EMAIL ?? '').trim().toLowerCase()

/** API 키가 없으면 데모 모드 */
export const isDemoMode = !firebaseConfig.apiKey

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!adminEmail && !!email && email.trim().toLowerCase() === adminEmail
}
