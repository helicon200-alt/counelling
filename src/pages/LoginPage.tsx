import { Navigate } from 'react-router-dom'
import LoginPanel from '../components/LoginPanel'
import { Loading } from '../components/StatusMessage'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (user) return <Navigate to={user.role === 'pending' ? '/pending' : '/materials'} replace />
  return <LoginPanel title="구성원 로그인" />
}
