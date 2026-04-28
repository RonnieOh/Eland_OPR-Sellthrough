'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F1117' }}>
      <div className="w-full max-w-md px-8 py-10 rounded-2xl border" style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3147' }}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">OPR NC PICKS</h1>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>상품 판매율 대시보드</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94A3B8' }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 transition"
              style={{
                backgroundColor: '#0F1117',
                border: '1px solid #2D3147',
                color: '#F1F5F9',
              }}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94A3B8' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 transition"
              style={{
                backgroundColor: '#0F1117',
                border: '1px solid #2D3147',
                color: '#F1F5F9',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#2D1A1A', color: '#EF4444' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50"
            style={{ backgroundColor: '#6366F1', color: '#fff' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
