import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="py-16 text-center">
      <p className="font-serif text-5xl font-bold text-navy-200">404</p>
      <h1 className="mt-4 font-serif text-xl font-bold text-navy-900">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-sm text-slate-600">주소가 잘못되었거나 삭제된 페이지입니다.</p>
      <Link to="/" className="btn btn-primary mt-6">
        홈으로 돌아가기
      </Link>
    </section>
  )
}
