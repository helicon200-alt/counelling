import { useState, type FormEvent } from 'react'
import { MATERIAL_TYPE_LABEL, type Material, type MaterialInput, type MaterialType } from '../types'
import { isSafeUrl } from './formatDate'
import PrivacyNotice from './PrivacyNotice'
import { ErrorMessage } from './StatusMessage'

export const MATERIAL_LIMITS = { title: 200, summary: 500, body: 20000, tags: 10, tag: 30, linkUrl: 2000 }

interface Props {
  initial?: Material | null
  submitting: boolean
  onSubmit: (input: MaterialInput) => Promise<void>
  onCancel?: () => void
}

/** 쉼표로 구분한 태그 문자열을 배열로 */
function parseTags(text: string): string[] {
  const tags = text
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean)
  return [...new Set(tags)]
}

export default function MaterialForm({ initial, submitting, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [type, setType] = useState<MaterialType>(initial?.type ?? 'research')
  const [tagsText, setTagsText] = useState(initial?.tags.join(', ') ?? '')
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? '')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const tags = parseTags(tagsText)
    const url = linkUrl.trim()

    if (!title.trim()) return setError('제목을 입력해 주세요.')
    if (tags.length > MATERIAL_LIMITS.tags) return setError(`태그는 최대 ${MATERIAL_LIMITS.tags}개까지 입력할 수 있습니다.`)
    if (tags.some((tag) => tag.length > MATERIAL_LIMITS.tag)) return setError(`태그 하나는 ${MATERIAL_LIMITS.tag}자 이하로 입력해 주세요.`)
    if (url && !isSafeUrl(url)) return setError('외부 링크는 https:// 로 시작하는 주소를 입력해 주세요.')

    setError('')
    await onSubmit({
      title: title.trim(),
      summary: summary.trim(),
      body: body.trim(),
      type,
      tags,
      linkUrl: url || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label={initial ? '자료 수정' : '새 자료 작성'}>
      <PrivacyNotice />

      <fieldset>
        <legend className="label">자료 종류</legend>
        <div className="flex gap-4">
          {(Object.keys(MATERIAL_TYPE_LABEL) as MaterialType[]).map((value) => (
            <label key={value} className="flex items-center gap-1.5 text-sm text-slate-700">
              <input type="radio" name="material-type" value={value} checked={type === value} onChange={() => setType(value)} className="accent-navy-700" />
              {MATERIAL_TYPE_LABEL[value]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="material-title" className="label">
          제목 <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input id="material-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={MATERIAL_LIMITS.title} required aria-required="true" />
      </div>

      <div>
        <label htmlFor="material-summary" className="label">
          요약
        </label>
        <input id="material-summary" className="input" value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={MATERIAL_LIMITS.summary} placeholder="목록에 보일 한두 문장" />
      </div>

      <div>
        <label htmlFor="material-body" className="label">
          본문
        </label>
        <textarea id="material-body" className="input min-h-48 resize-y" value={body} onChange={(e) => setBody(e.target.value)} maxLength={MATERIAL_LIMITS.body} placeholder="일반 텍스트로 입력합니다. 줄바꿈은 그대로 표시됩니다." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="material-tags" className="label">
            태그
          </label>
          <input id="material-tags" className="input" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="예: 집단상담, 연구설계" aria-describedby="material-tags-help" />
          <p id="material-tags-help" className="mt-1 text-xs text-slate-500">
            쉼표(,)로 구분, 최대 {MATERIAL_LIMITS.tags}개
          </p>
        </div>
        <div>
          <label htmlFor="material-link" className="label">
            외부 링크 (선택)
          </label>
          <input id="material-link" type="url" className="input" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} maxLength={MATERIAL_LIMITS.linkUrl} placeholder="https://drive.google.com/..." aria-describedby="material-link-help" />
          <p id="material-link-help" className="mt-1 text-xs text-slate-500">
            파일은 Google Drive 등에 올린 뒤 공유 링크를 붙여 넣으세요.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
            취소
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '저장 중…' : initial ? '수정 저장' : '자료 등록'}
        </button>
      </div>
    </form>
  )
}
