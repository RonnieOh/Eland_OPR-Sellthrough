'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, Upload, Settings, LogOut } from 'lucide-react'

interface NavbarProps {
  userEmail: string
  role: string
}

export default function Navbar({ userEmail, role }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header style={{ backgroundColor: '#1A1D2E', borderBottom: '1px solid #2D3147' }}>
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white tracking-tight">
            <BarChart3 size={20} style={{ color: '#6366F1' }} />
            OPR NC PICKS
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard">대시보드</NavLink>
            <NavLink href="/upload">업로드</NavLink>
            {role === 'admin' && <NavLink href="/settings">시즌 설정</NavLink>}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: '#94A3B8' }}>{userEmail}</span>
          {role === 'admin' && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: '#6366F1' }}>
              관리자
            </span>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition hover:opacity-80"
            style={{ color: '#94A3B8' }}
            title="로그아웃"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition hover:opacity-80"
      style={{ color: '#94A3B8' }}
    >
      {children}
    </Link>
  )
}
