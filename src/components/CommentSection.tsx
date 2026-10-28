import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dataService } from '../services'
import { COMMENT_MAX_LENGTH, type Comment } from '../types'
import { formatDateTime } from './formatDate'
import PrivacyNotice from './PrivacyNotice'
import { ErrorMessage, Loading, toErrorMessage } from './StatusMessage'

export default function CommentSection({ materialId }: { materialId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 이 자료의 댓글만 실시간 구독하고, 화면을 벗어나면 구독을 해제한다
  useEffect(() => {
    setLoading(true)
    const unsubscribe = dataService.subscribeComments(
      materialId,
      (list) => {
        setComments(list)
        setLoading(false)
      },
      (err) => {
        setError(toErrorMessage(err, '댓글을 불러오지 못했습니다.'))
        setLoading(false)
      },
    )
    return unsubscribe
  }, [materialId])

  if (!user) return null

  const trimmed = draft.trim()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!trimmed || trimmed.length > COMMENT_MAX_LENGTH) return
    setSubmitting(true)
    setError('')
    try {
      await dataService.addComment(materialId, {
        body: trimmed,
        authorUid: user.uid,
        authorName: user.displayName || user.email,
      })
      setDraft('')
    } catch (err) {
      setError(toErrorMessage(err, '댓글을 등록하지 못했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="comments-title" className="mt-10 border-t border-slate-200 pt-8">
      <h2 id="comments-title" className="font-serif text-lg font-bold text-navy-900">
        토론 <span className="text-sm font-normal text-slate-500">({comments.length})</span>
      </h2>

      {error && (
        <div className="mt-3">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading ? (
        <Loading label="댓글 불러오는 중…" />
      ) : comments.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">아직 댓글이 없습니다. 첫 의견을 남겨 보세요.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              materialId={materialId}
              canEdit={comment.authorUid === user.uid}
              canDelete={comment.authorUid === user.uid || user.role === 'admin'}
              onError={setError}
            />
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-6" aria-label="댓글 작성">
        <label htmlFor="new-comment" className="label">
          댓글 작성
        </label>
        <PrivacyNotice id="comment-privacy" />
        <textarea
          id="new-comment"
          className="input min-h-24 resize-y"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="의견을 남겨 주세요."
          aria-describedby="comment-privacy comment-count"
          required
        />
        <div className="mt-2 flex items-center justify-between">
          <span id="comment-count" className="text-xs text-slate-500">
            {draft.length} / {COMMENT_MAX_LENGTH}자
          </span>
          <button type="submit" className="btn btn-primary" disabled={submitting || !trimmed}>
            {submitting ? '등록 중…' : '댓글 등록'}
          </button>
        </div>
      </form>
    </section>
  )
}

interface ItemProps {
  comment: Comment
  materialId: string
  canEdit: boolean
  canDelete: boolean
  onError: (message: string) => void
}

function CommentItem({ comment, materialId, canEdit, canDelete, onError }: ItemProps) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(comment.body)
  const [busy, setBusy] = useState(false)
  const edited = comment.updatedAt.getTime() > comment.createdAt.getTime()
  const editId = `edit-${comment.id}`

  const save = async () => {
    const trimmed = text.trim()
    if (!trimmed || trimmed.length > COMMENT_MAX_LENGTH) return
    setBusy(true)
    try {
      await dataService.updateComment(materialId, comment.id, trimmed)
      setEditing(false)
    } catch (err) {
      onError(toErrorMessage(err, '댓글을 수정하지 못했습니다.'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('이 댓글을 삭제할까요?')) return
    setBusy(true)
    try {
      await dataService.deleteComment(materialId, comment.id)
    } catch (err) {
      onError(toErrorMessage(err, '댓글을 삭제하지 못했습니다.'))
      setBusy(false)
    }
  }

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{comment.authorName}</p>
        <p className="text-xs text-slate-500">
          <time dateTime={comment.createdAt.toISOString()}>{formatDateTime(comment.createdAt)}</time>
          {edited && ' (수정됨)'}
        </p>
      </div>

      {editing ? (
        <div className="mt-2">
          <label htmlFor={editId} className="sr-only">
            댓글 수정
          </label>
          <PrivacyNotice />
          <textarea
            id={editId}
            className="input min-h-20 resize-y"
            value={text}
            maxLength={COMMENT_MAX_LENGTH}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setText(comment.body)
                setEditing(false)
              }}
              disabled={busy}
            >
              취소
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy || !text.trim()}>
              저장
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{comment.body}</p>
      )}

      {!editing && (canEdit || canDelete) && (
        <div className="mt-3 flex justify-end gap-2">
          {canEdit && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setText(comment.body)
                setEditing(true)
              }}
              disabled={busy}
              aria-label={`${comment.authorName}의 댓글 수정`}
            >
              수정
            </button>
          )}
          {canDelete && (
            <button type="button" className="btn btn-danger btn-sm" onClick={remove} disabled={busy} aria-label={`${comment.authorName}의 댓글 삭제`}>
              삭제
            </button>
          )}
        </div>
      )}
    </li>
  )
}
