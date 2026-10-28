import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { formatDate } from '../components/formatDate'
import MaterialForm from '../components/MaterialForm'
import { ErrorMessage, Loading, toErrorMessage } from '../components/StatusMessage'
import { useAuth } from '../contexts/AuthContext'
import { dataService, type PageCursor } from '../services'
import { MATERIAL_TYPE_LABEL, type AppUser, type Material, type MaterialInput } from '../types'

export default function AdminPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy-900">관리자</h1>
        <p className="mt-1 text-sm text-slate-600">자료를 관리하고 가입 신청을 승인합니다.</p>
      </div>
      <MaterialEditor />
      <MaterialManager />
      <PendingUsers />
    </div>
  )
}

/** 자료 작성·수정 폼. 주소에 ?edit=자료ID 가 있으면 수정 모드 */
function MaterialEditor() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const [editing, setEditing] = useState<Material | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editId) {
      setEditing(null)
      return
    }
    let active = true
    setLoading(true)
    setError('')
    dataService
      .getMaterial(editId)
      .then((result) => {
        if (!active) return
        if (!result) setError('수정할 자료를 찾을 수 없습니다.')
        setEditing(result)
      })
      .catch((err) => active && setError(toErrorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [editId])

  const handleSubmit = async (input: MaterialInput) => {
    if (!user) return
    setSubmitting(true)
    setError('')
    try {
      const id = editing ? editing.id : await dataService.createMaterial(input, user.uid)
      if (editing) await dataService.updateMaterial(editing.id, input)
      navigate(`/materials/${id}`)
    } catch (err) {
      setError(toErrorMessage(err, '자료를 저장하지 못했습니다.'))
      setSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="editor-title" className="card p-5 sm:p-6">
      <h2 id="editor-title" className="font-serif text-lg font-bold text-navy-900">
        {editId ? '자료 수정' : '새 자료 작성'}
      </h2>
      <div className="mt-4">
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}
        {loading ? (
          <Loading />
        ) : (
          <MaterialForm
            key={editing?.id ?? 'new'}
            initial={editing}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={editId ? () => setSearchParams({}) : undefined}
          />
        )}
      </div>
    </section>
  )
}

function MaterialManager() {
  const [items, setItems] = useState<Material[]>([])
  const [cursor, setCursor] = useState<PageCursor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [, setSearchParams] = useSearchParams()

  const load = useCallback(async (from: PageCursor | null) => {
    setLoading(true)
    setError('')
    try {
      const page = await dataService.listMaterials({ cursor: from })
      setItems((prev) => (from ? [...prev, ...page.items] : page.items))
      setCursor(page.nextCursor)
    } catch (err) {
      setError(toErrorMessage(err, '자료 목록을 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(null)
  }, [load])

  const handleDelete = async (material: Material) => {
    if (!window.confirm(`"${material.title}" 자료와 댓글을 모두 삭제할까요? 되돌릴 수 없습니다.`)) return
    setBusyId(material.id)
    try {
      await dataService.deleteMaterial(material.id)
      setItems((prev) => prev.filter((m) => m.id !== material.id))
    } catch (err) {
      setError(toErrorMessage(err, '자료를 삭제하지 못했습니다.'))
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (id: string) => {
    setSearchParams({ edit: id })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section aria-labelledby="manage-title">
      <h2 id="manage-title" className="font-serif text-lg font-bold text-navy-900">
        등록된 자료
      </h2>
      {error && (
        <div className="mt-3">
          <ErrorMessage message={error} />
        </div>
      )}
      {items.length === 0 && !loading ? (
        <p className="py-6 text-sm text-slate-500">등록된 자료가 없습니다.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
          {items.map((material) => (
            <li key={material.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  {MATERIAL_TYPE_LABEL[material.type]} · {formatDate(material.createdAt)}
                </p>
                <Link to={`/materials/${material.id}`} className="block truncate font-medium text-navy-900 hover:underline">
                  {material.title}
                </Link>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(material.id)} aria-label={`${material.title} 수정`}>
                  수정
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(material)}
                  disabled={busyId === material.id}
                  aria-label={`${material.title} 삭제`}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {loading && <Loading />}
      {!loading && cursor !== null && (
        <div className="mt-4 text-center">
          <button type="button" className="btn btn-secondary" onClick={() => load(cursor)}>
            더 보기
          </button>
        </div>
      )}
    </section>
  )
}

function PendingUsers() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyUid, setBusyUid] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await dataService.listPendingUsers())
    } catch (err) {
      setError(toErrorMessage(err, '승인 대기 목록을 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const act = async (target: AppUser, approve: boolean) => {
    if (!approve && !window.confirm(`${target.displayName || target.email} 님의 신청을 거절할까요?`)) return
    setBusyUid(target.uid)
    try {
      if (approve) await dataService.approveUser(target.uid)
      else await dataService.rejectUser(target.uid)
      setUsers((prev) => prev.filter((u) => u.uid !== target.uid))
    } catch (err) {
      setError(toErrorMessage(err, '처리하지 못했습니다.'))
    } finally {
      setBusyUid(null)
    }
  }

  return (
    <section aria-labelledby="pending-users-title">
      <div className="flex items-center justify-between gap-2">
        <h2 id="pending-users-title" className="font-serif text-lg font-bold text-navy-900">
          승인 대기 회원 <span className="text-sm font-normal text-slate-500">({users.length})</span>
        </h2>
        <button type="button" className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
          새로고침
        </button>
      </div>
      {error && (
        <div className="mt-3">
          <ErrorMessage message={error} />
        </div>
      )}
      {loading ? (
        <Loading />
      ) : users.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">승인 대기 중인 회원이 없습니다.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
          {users.map((target) => {
            const name = target.displayName || target.email
            return (
              <li key={target.uid} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{target.displayName || '(이름 없음)'}</p>
                  <p className="truncate text-sm text-slate-500">
                    {target.email} · 신청 {formatDate(target.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => act(target, true)} disabled={busyUid === target.uid} aria-label={`${name} 승인`}>
                    승인
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => act(target, false)} disabled={busyUid === target.uid} aria-label={`${name} 거절`}>
                    거절
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
