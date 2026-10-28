export default function PrivacyNotice({ id }: { id?: string }) {
  return (
    <p id={id} role="note" className="mb-3 flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      <span aria-hidden="true">⚠</span>
      <span>내담자 이름·학번·사례 등 개인을 식별할 수 있는 정보는 절대 입력하지 마세요.</span>
    </p>
  )
}
