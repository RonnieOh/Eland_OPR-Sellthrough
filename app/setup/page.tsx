export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F1117' }}>
      <div className="max-w-lg w-full px-8 py-10 rounded-2xl border" style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3147' }}>
        <h1 className="text-xl font-bold text-white mb-2">초기 설정 필요</h1>
        <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
          Supabase 환경 변수가 설정되지 않았습니다. <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: '#0F1117', color: '#F1F5F9' }}>.env.local</code> 파일에 아래 값을 입력해주세요.
        </p>

        <div className="rounded-lg p-4 mb-6 font-mono text-sm" style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#22C55E' }}>
          <p>NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...</p>
        </div>

        <ol className="space-y-2 text-sm" style={{ color: '#94A3B8' }}>
          <li>1. Supabase 대시보드 → <strong className="text-white">Settings → API</strong> 에서 확인</li>
          <li>2. <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: '#0F1117', color: '#F1F5F9' }}>.env.local</code> 파일에 붙여넣기</li>
          <li>3. <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: '#0F1117', color: '#F1F5F9' }}>supabase/schema.sql</code>을 Supabase SQL Editor에서 실행</li>
          <li>4. 개발 서버 재시작 후 새로고침</li>
        </ol>
      </div>
    </div>
  )
}
