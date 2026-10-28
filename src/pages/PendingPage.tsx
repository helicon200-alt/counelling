import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import LoginPanel from '../components/LoginPanel'
import { Loading } from '../components/StatusMessage'
import { useAuth } from '../contexts/AuthContext'

export default function PendingPage() {
  const { user, loading, refreshUser } = useAuth()
  const [checking, setChecking] = useState(false)
  const [checked, setChecked] = useState(false)

  if (loading) return <Loading />
  if (!user) return <LoginPanel />
  if (user.role !== 'pending') return <Navigate to="/materials" replace />

  const handleCheck = async () => {
    setChecking(true)
    try {
      await refreshUser()
      setChecked(true)
    } finally {
      setChecking(false)
    }
  }

  return (
    <section aria-labelledby="pending-title" className="card mx-auto max-w-lg p-6 text-center sm:p-8">
      <h1 id="pending-title" className="font-serif text-xl font-bold text-navy-900">
        승인 대기 중입니다
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        <strong className="text-slate-800">{user.displayName || user.email}</strong> 님, 가입 신청이 접수되었습니다.
        <br />
        교수님(관리자)이 승인하면 연구실 자료와 토론을 이용할 수 있습니다.
      </p>
      <button type="button" className="btn btn-secondary mt-6" onClick={handleCheck} disabled={checking} aria-describedby="pending-result">
        {checking ? '확인 중…' : '승인 상태 다시 확인'}
      </button>
      <p id="pending-result" aria-live="polite" className="mt-3 text-xs text-slate-500">
        {checked && !checking ? '아직 승인되지 않았습니다.' : ''}
      </p>
    </section>
  )
}
