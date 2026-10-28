import { site } from '../content/site'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-xs leading-relaxed text-slate-500 sm:px-6">
        <p>
          <strong className="font-semibold text-slate-600">이용 안내</strong> · 이 공간은 연구실 구성원 전용입니다. 내담자 이름·학번·사례 등
          개인을 식별할 수 있는 정보는 게시하거나 댓글로 남기지 마세요.
        </p>
        <p>
          © {new Date().getFullYear()} {site.affiliation} {site.labName}
        </p>
      </div>
    </footer>
  )
}
