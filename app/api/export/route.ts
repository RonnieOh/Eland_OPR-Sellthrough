import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { uploadId } = await req.json()

  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .eq('upload_id', uploadId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (items ?? []).map(item => ({
    브랜드명: item.brand_name,
    아이템코드: item.item_code ?? '',
    아이템명: item.item_name,
    매입액: item.purchase_amount,
    판매원가: item.sales_cost,
    잔여재고액: item.remaining_amount ?? '',
    '현재판매율(금액)%': item.sales_rate_amount?.toFixed(1) ?? '',
    '시즌말예상(금액)%': item.expected_eod_rate_amount?.toFixed(1) ?? '',
    '소진예상(금액)일': item.days_to_clearance_amount?.toFixed(0) ?? '',
    매입수량: item.purchase_qty ?? '',
    판매수량: item.sales_qty ?? '',
    잔여수량: item.remaining_qty ?? '',
    '현재판매율(수량)%': item.sales_rate_qty?.toFixed(1) ?? '',
    '시즌말예상(수량)%': item.expected_eod_rate_qty?.toFixed(1) ?? '',
    '소진예상(수량)일': item.days_to_clearance_qty?.toFixed(0) ?? '',
    기준일자: item.reference_date,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '판매율')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="sellthrough_export.xlsx"`,
    },
  })
}
