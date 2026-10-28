import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ErrorMessage, toErrorMessage } from './StatusMessage'

interface Props {
  title?: string
  description?: string
}

export default function LoginPanel({
  title = '로그인이 필요합니다',
  description = '연구실 자료와 토론은 승인된 구성원만 볼 수 있습니다.',
}: Props) {
  const { isDemo, signInWithGoogle, signInDemo } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(toErrorMessage(err, '로그인하지 못했습니다.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="login-title" className="card mx-auto max-w-md p-6 text-center sm:p-8">
      <h1 id="login-title" className="font-serif text-xl font-bold text-navy-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>

      <div className="mt-6 flex flex-col gap-3">
        {isDemo ? (
          <>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => signInDemo('admin'))}>
              관리자로 체험
            </button>
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => run(() => signInDemo('member'))}>
              회원으로 체험
            </button>
            <p className="text-xs text-slate-500">데모 모드에서는 실제 로그인 대신 체험 계정을 사용합니다.</p>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(signInWithGoogle)}>
              Google 계정으로 로그인
            </button>
            <p className="text-xs text-slate-500">처음 로그인하면 관리자 승인 후 이용할 수 있습니다.</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 text-left">
          <ErrorMessage message={error} />
        </div>
      )}
    </section>
  )
}
