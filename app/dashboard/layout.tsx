import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = roleRow?.role ?? 'viewer'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F1117' }}>
      <Navbar userEmail={user.email ?? ''} role={role} />
      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  )
}
