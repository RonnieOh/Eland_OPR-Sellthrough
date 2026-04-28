import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UploadClient from '@/components/upload/UploadClient'

export default async function UploadPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('created_at', { ascending: false })

  return <UploadClient seasons={seasons ?? []} />
}
