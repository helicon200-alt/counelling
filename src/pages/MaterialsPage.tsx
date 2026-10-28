import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatDate } from '../components/formatDate'
import { ErrorMessage, Loading, toErrorMessage } from '../components/StatusMessage'
import TagList from '../components/TagList'
import { dataService, type PageCursor } from '../services'
import { MATERIAL_TYPE_LABEL, type Material, type MaterialType } from '../types'

const TABS: { value: MaterialType | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'research', label: '연구' },
  { value: 'lecture', label: '수업' },
]

export default function MaterialsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const type: MaterialType | undefined = typeParam === 'research' || typeParam === 'lecture' ? typeParam : undefined

  const [items, setItems] = useState<Material[]>([])
  const [cursor, setCursor] = useState<PageCursor | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  // 탭을 빠르게 바꿀 때 이전 요청 결과가 덮어쓰지 않도록 요청 번호를 기록
  const requestId = useRef(0)

  const loadPage = useCallback(
    async (from: PageCursor | null) => {
      const id = ++requestId.current
      setError('')
      if (from) setLoadingMore(true)
      else setLoading(true)
      try {
        const page = await dataService.listMaterials({ type, cursor: from })
        if (id !== requestId.current) return
        setItems((prev) => (from ? [...prev, ...page.items] : page.items))
        setCursor(page.nextCursor)
      } catch (err) {
        if (id === requestId.current) setError(toErrorMessage(err, '자료 목록을 불러오지 못했습니다.'))
      } finally {
        if (id === requestId.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [type],
  )

  useEffect(() => {
    void loadPage(null)
  }, [loadPage])

  const selectTab = (value: MaterialType | 'all') => {
    setSearchParams(value === 'all' ? {} : { type: value })
  }

  const activeTab = type ?? 'all'

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-navy-900">자료</h1>
      <p className="mt-1 text-sm text-slate-600">연구·수업 자료를 확인하고 자료별로 토론하세요.</p>

      <div role="tablist" aria-label="자료 종류" className="mt-6 flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => {
          const selected = activeTab === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              id={`tab-${tab.value}`}
              aria-selected={selected}
              aria-controls="materials-panel"
              onClick={() => selectTab(tab.value)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
                selected ? 'border-navy-700 font-semibold text-navy-800' : 'border-transparent text-slate-500 hover:text-navy-700'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div id="materials-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="mt-6">
        {error && <ErrorMessage message={error} />}
        {loading ? (
          <Loading />
        ) : items.length === 0 && !error ? (
          <p className="py-12 text-center text-sm text-slate-500">등록된 자료가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((material) => (
              <li key={material.id}>
                <Link
                  to={`/materials/${material.id}`}
                  className="card block p-5 transition-colors hover:border-navy-200 hover:bg-navy-50/40 focus-visible:outline-2 focus-visible:outline-navy-600"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-navy-700 px-1.5 py-0.5 font-medium text-white">{MATERIAL_TYPE_LABEL[material.type]}</span>
                    <time dateTime={material.createdAt.toISOString()}>{formatDate(material.createdAt)}</time>
                  </div>
                  <h2 className="mt-2 font-semibold text-navy-900">{material.title}</h2>
                  {material.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{material.summary}</p>}
                  <div className="mt-3">
                    <TagList tags={material.tags} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!loading && cursor !== null && (
          <div className="mt-6 text-center">
            <button type="button" className="btn btn-secondary" onClick={() => loadPage(cursor)} disabled={loadingMore}>
              {loadingMore ? '불러오는 중…' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
