import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types'
import LoginPanel from './LoginPanel'
import { Loading } from './StatusMessage'

/** 역할에 따라 하위 페이지 접근을 막는 보호 라우트 */
export default function RequireRole({ allow }: { allow: UserRole[] }) {
  const { user, loading } = useAuth()

  if (loading) return <Loading label="로그인 상태 확인 중…" />
  if (!user) return <LoginPanel />
  if (user.role === 'pending') return <Navigate to="/pending" replace />
  if (!allow.includes(user.role)) {
    return (
      <section className="card mx-auto max-w-md p-8 text-center">
        <h1 className="font-serif text-xl font-bold text-navy-900">접근 권한이 없습니다</h1>
        <p className="mt-2 text-sm text-slate-600">이 화면은 관리자만 이용할 수 있습니다.</p>
      </section>
    )
  }
  return <Outlet />
}
