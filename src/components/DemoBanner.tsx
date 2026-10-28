import { useAuth } from '../contexts/AuthContext'

export default function DemoBanner() {
  const { isDemo } = useAuth()
  if (!isDemo) return null
  return (
    <div role="status" className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 border-b border-amber-200">
      <strong className="font-semibold">데모 모드: Firebase 미연결</strong>
      <span className="hidden sm:inline"> · 샘플 데이터로 동작하며, 새로고침하면 작성한 내용이 초기화됩니다.</span>
    </div>
  )
}
