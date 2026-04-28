import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleRow?.role !== 'admin') redirect('/dashboard')

  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('created_at', { ascending: false })

  return <SettingsClient seasons={seasons ?? []} />
}
