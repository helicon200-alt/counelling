import { Link, NavLink, useNavigate } from 'react-router-dom'
import { site } from '../content/site'
import { useAuth } from '../contexts/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2 py-1 text-sm transition-colors ${isActive ? 'font-semibold text-navy-800 bg-navy-50' : 'text-slate-600 hover:text-navy-800'}`

const ROLE_LABEL = { admin: '관리자', member: '회원', pending: '승인 대기' } as const

export default function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const canRead = user?.role === 'member' || user?.role === 'admin'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link to="/" className="group flex flex-col leading-tight">
          <span className="font-serif text-lg font-bold text-navy-900 group-hover:text-navy-700">{site.shortName}</span>
          <span className="text-xs text-slate-500">{site.affiliation}</span>
        </Link>

        <nav aria-label="주 메뉴" className="flex flex-wrap items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={navClass}>
            홈
          </NavLink>
          {canRead && (
            <NavLink to="/materials" className={navClass}>
              자료
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navClass}>
              관리자
            </NavLink>
          )}
          {user?.role === 'pending' && (
            <NavLink to="/pending" className={navClass}>
              승인 대기
            </NavLink>
          )}

          <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[10rem] truncate text-sm text-slate-700" title={user.email}>
                {user.displayName || user.email}
                <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{ROLE_LABEL[user.role]}</span>
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleSignOut}>
                로그아웃
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
