import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: uploads } = await supabase
    .from('uploads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('created_at', { ascending: false })

  const activeSeason = seasons?.find(s => s.is_active) ?? seasons?.[0] ?? null

  // 최신 업로드의 아이템 데이터 조회
  const latestUpload = uploads?.[0] ?? null
  const prevUpload = uploads?.[1] ?? null

  const { data: items } = latestUpload
    ? await supabase.from('items').select('*').eq('upload_id', latestUpload.id)
    : { data: [] }

  const { data: prevItems } = prevUpload
    ? await supabase.from('items').select('*').eq('upload_id', prevUpload.id)
    : { data: [] }

  return (
    <DashboardClient
      items={items ?? []}
      prevItems={prevItems ?? []}
      uploads={uploads ?? []}
      activeSeason={activeSeason}
    />
  )
}
