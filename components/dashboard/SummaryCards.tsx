'use client'

import type { Item, Season, Metric } from '@/lib/types/database'
import { fmtPct, fmtNumber, rateColor } from '@/lib/utils'
import { differenceInCalendarDays, parseISO } from 'date-fns'

interface Props {
  items: Item[]
  prevItems: Item[]
  metric: Metric
  activeSeason: Season | null
}

export default function SummaryCards({ items, prevItems, metric, activeSeason }: Props) {
  const totalPurchaseAmount = items.reduce((s, i) => s + i.purchase_amount, 0)
  const totalSalesCost = items.reduce((s, i) => s + i.sales_cost, 0)
  const totalPurchaseQty = items.reduce((s, i) => s + (i.purchase_qty ?? 0), 0)
  const totalSalesQty = items.reduce((s, i) => s + (i.sales_qty ?? 0), 0)

  const currentRate = metric === 'amount'
    ? (totalPurchaseAmount > 0 ? (totalSalesCost / totalPurchaseAmount) * 100 : null)
    : (totalPurchaseQty > 0 ? (totalSalesQty / totalPurchaseQty) * 100 : null)

  // 전체 일평균 속도
  const refDate = items[0]?.reference_date
  const elapsedDays = refDate ? Math.max(1, differenceInCalendarDays(parseISO(refDate), parseISO('2020-01-01'))) : 1
  const remainingDays = activeSeason?.end_date && refDate
    ? Math.max(0, differenceInCalendarDays(parseISO(activeSeason.end_date), parseISO(refDate)))
    : 0

  const dailySpeedAmount = items.reduce((s, i) => s + (i.daily_speed_amount ?? 0), 0)
  const dailySpeedQty = items.reduce((s, i) => s + (i.daily_speed_qty ?? 0), 0)

  const expectedEod = metric === 'amount' && totalPurchaseAmount > 0
    ? ((totalSalesCost + dailySpeedAmount * remainingDays) / totalPurchaseAmount) * 100
    : metric === 'qty' && totalPurchaseQty > 0
    ? ((totalSalesQty + dailySpeedQty * remainingDays) / totalPurchaseQty) * 100
    : null

  const remainingAmount = totalPurchaseAmount - totalSalesCost
  const remainingQty = totalPurchaseQty - totalSalesQty
  const daysToClear = metric === 'amount' && dailySpeedAmount > 0
    ? remainingAmount / dailySpeedAmount
    : metric === 'qty' && dailySpeedQty > 0
    ? remainingQty / dailySpeedQty
    : null

  // 이전 대비 변화
  const prevTotal = metric === 'amount'
    ? prevItems.reduce((s, i) => s + i.purchase_amount, 0)
    : prevItems.reduce((s, i) => s + (i.purchase_qty ?? 0), 0)
  const prevSales = metric === 'amount'
    ? prevItems.reduce((s, i) => s + i.sales_cost, 0)
    : prevItems.reduce((s, i) => s + (i.sales_qty ?? 0), 0)
  const prevRate = prevTotal > 0 ? (prevSales / prevTotal) * 100 : null
  const delta = currentRate != null && prevRate != null ? currentRate - prevRate : null

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card
        label="현재 판매율"
        value={fmtPct(currentRate)}
        valueColor={rateColor(currentRate)}
        sub={metric === 'amount'
          ? `매입 ${(totalPurchaseAmount / 1e8).toFixed(1)}억`
          : `매입 ${fmtNumber(totalPurchaseQty)}개`}
      />
      <Card
        label="시즌말 예상 판매율"
        value={fmtPct(expectedEod)}
        valueColor={rateColor(expectedEod)}
        sub={activeSeason ? `시즌 종료: ${activeSeason.end_date}` : '시즌 미설정'}
      />
      <Card
        label="전체 소진 예상"
        value={daysToClear != null ? `D+${Math.round(daysToClear)}일` : '—'}
        valueColor="#F1F5F9"
        sub={`잔여일 ${remainingDays}일`}
      />
      <Card
        label="이전 대비 판매율"
        value={delta != null ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%` : '—'}
        valueColor={delta == null ? '#94A3B8' : delta >= 0 ? '#22C55E' : '#EF4444'}
        sub={prevRate != null ? `직전: ${fmtPct(prevRate)}` : '이전 데이터 없음'}
      />
    </div>
  )
}

function Card({ label, value, valueColor, sub }: {
  label: string; value: string; valueColor: string; sub: string
}) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147' }}>
      <p className="text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>{label}</p>
      <p className="text-3xl font-bold mb-1" style={{ color: valueColor }}>{value}</p>
      <p className="text-xs" style={{ color: '#94A3B8' }}>{sub}</p>
    </div>
  )
}
