import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CommentSection from '../components/CommentSection'
import { formatDate, isSafeUrl } from '../components/formatDate'
import { ErrorMessage, Loading, toErrorMessage } from '../components/StatusMessage'
import TagList from '../components/TagList'
import { useAuth } from '../contexts/AuthContext'
import { dataService } from '../services'
import { MATERIAL_TYPE_LABEL, type Material } from '../types'
import NotFoundPage from './NotFoundPage'

export default function MaterialDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    dataService
      .getMaterial(id)
      .then((result) => active && setMaterial(result))
      .catch((err) => active && setError(toErrorMessage(err, '자료를 불러오지 못했습니다.')))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} />
  if (!material) return <NotFoundPage />

  const edited = material.updatedAt.getTime() > material.createdAt.getTime()

  return (
    <article>
      <Link to="/materials" className="text-sm text-navy-700 hover:underline">
        ← 자료 목록
      </Link>

      <header className="mt-4 border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded bg-navy-700 px-1.5 py-0.5 font-medium text-white">{MATERIAL_TYPE_LABEL[material.type]}</span>
          <time dateTime={material.createdAt.toISOString()}>{formatDate(material.createdAt)}</time>
          {edited && <span>(수정 {formatDate(material.updatedAt)})</span>}
        </div>
        <h1 className="mt-2 font-serif text-2xl font-bold leading-snug text-navy-900 sm:text-3xl">{material.title}</h1>
        {material.summary && <p className="mt-3 leading-relaxed text-slate-600">{material.summary}</p>}
        <div className="mt-4">
          <TagList tags={material.tags} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {isSafeUrl(material.linkUrl) && (
            <a href={material.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              자료 열기 (외부 링크)
              <span aria-hidden="true">↗</span>
              <span className="sr-only">새 창에서 열림</span>
            </a>
          )}
          {user?.role === 'admin' && (
            <Link to={`/admin?edit=${material.id}`} className="btn btn-secondary">
              수정하기
            </Link>
          )}
        </div>
      </header>

      {material.body && (
        <div className="mt-6 whitespace-pre-wrap break-words leading-relaxed text-slate-800">{material.body}</div>
      )}

      <CommentSection materialId={material.id} />
    </article>
  )
}
