export function Loading({ label = '불러오는 중…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-navy-700" aria-hidden="true" />
      {label}
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      {message}
    </p>
  )
}

/** 오류 객체를 화면용 한국어 문장으로 바꾼다 */
export function toErrorMessage(error: unknown, fallback = '문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'): string {
  const code = (error as { code?: string } | null)?.code
  if (code === 'permission-denied') return '권한이 없습니다. 관리자 승인 상태를 확인해 주세요.'
  if (code === 'failed-precondition') return '데이터베이스 색인이 필요합니다. README의 "색인 만들기" 안내를 확인해 주세요.'
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return '로그인 창이 닫혔습니다.'
  if (code === 'auth/popup-blocked') return '브라우저가 팝업을 차단했습니다. 팝업을 허용한 뒤 다시 시도해 주세요.'
  if (code === 'auth/unauthorized-domain') return '이 주소는 Firebase 승인된 도메인에 등록되어 있지 않습니다.'
  if (error instanceof Error && !code && error.message) return error.message
  return fallback
}
