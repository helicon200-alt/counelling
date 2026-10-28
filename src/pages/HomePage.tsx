import { Link } from 'react-router-dom'
import { site } from '../content/site'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { user } = useAuth()
  const canRead = user?.role === 'member' || user?.role === 'admin'

  return (
    <div className="space-y-12">
      <section aria-labelledby="intro-title" className="border-l-4 border-navy-700 pl-5 sm:pl-6">
        <p className="text-sm font-medium text-navy-600">
          {site.affiliation} · {site.professor}
        </p>
        <h1 id="intro-title" className="mt-1 font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
          {site.labName}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-700">{site.intro}</p>
        <div className="mt-6">
          {canRead ? (
            <Link to="/materials" className="btn btn-primary">
              자료 보러 가기
            </Link>
          ) : user?.role === 'pending' ? (
            <Link to="/pending" className="btn btn-secondary">
              승인 상태 확인
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              구성원 로그인
            </Link>
          )}
        </div>
      </section>

      <section aria-labelledby="areas-title">
        <h2 id="areas-title" className="font-serif text-xl font-bold text-navy-900">
          연구 분야
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {site.researchAreas.map((area) => (
            <li key={area.title} className="card p-5">
              <h3 className="font-semibold text-navy-800">{area.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{area.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contact-title">
        <h2 id="contact-title" className="font-serif text-xl font-bold text-navy-900">
          연락처
        </h2>
        <dl className="card mt-4 grid gap-3 p-5 text-sm sm:grid-cols-[6rem_1fr]">
          <dt className="font-medium text-slate-500">연구실</dt>
          <dd className="text-slate-800">{site.contact.office}</dd>
          <dt className="font-medium text-slate-500">이메일</dt>
          <dd>
            <a href={`mailto:${site.contact.email}`} className="text-navy-700 underline underline-offset-2 hover:text-navy-900">
              {site.contact.email}
            </a>
          </dd>
          <dt className="font-medium text-slate-500">운영 시간</dt>
          <dd className="text-slate-800">{site.contact.hours}</dd>
        </dl>
      </section>
    </div>
  )
}
