import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dataService } from '../services'
import type { AppUser } from '../types'

interface AuthContextValue {
  user: AppUser | null
  /** 첫 로그인 상태 확인이 끝나기 전에는 true */
  loading: boolean
  isDemo: boolean
  signInWithGoogle: () => Promise<void>
  signInDemo: (role: 'admin' | 'member') => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // 로그인 상태 변화를 구독 (Firebase에서는 onAuthStateChanged)
  useEffect(() => {
    return dataService.onAuthChange((nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const refreshUser = useCallback(async () => {
    setUser(await dataService.reloadCurrentUser())
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isDemo: dataService.isDemo,
      signInWithGoogle: () => dataService.signInWithGoogle(),
      signInDemo: (role) => dataService.signInDemo(role),
      signOut: () => dataService.signOut(),
      refreshUser,
    }),
    [user, loading, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.')
  return context
}
