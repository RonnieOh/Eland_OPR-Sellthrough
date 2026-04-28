'use client'

import { useState } from 'react'
import type { Season, Metric } from '@/lib/types/database'
import type { BrandSummary } from '@/lib/calculate'
import { fmtPct, fmtCurrency, fmtNumber, fmt, rateColor, rateBg } from '@/lib/utils'
import { ChevronUp, ChevronDown } from 'lucide-react'

type SortKey = 'brand_name' | 'sales_rate_amount' | 'sales_rate_qty' | 'expected_eod_rate_amount' | 'days_to_clearance_amount' | 'purchase_amount'
type SortDir = 'asc' | 'desc'

interface Props {
  summaries: BrandSummary[]
  prevSummaries: BrandSummary[]
  metric: Metric
  selectedBrand: string | null
  onSelectBrand: (b: string | null) => void
  activeSeason: Season | null
}

export default function BrandTable({ summaries, prevSummaries, metric, selectedBrand, onSelectBrand, activeSeason }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('sales_rate_amount')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...summaries].sort((a, b) => {
    const av = a[sortKey] as number | string | null
    const bv = b[sortKey] as number | string | null
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const prevMap = new Map(prevSummaries.map(s => [s.brand_name, s]))
  const targetRate = metric === 'amount' ? activeSeason?.target_rate_amount : activeSeason?.target_rate_qty

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="opacity-30">↕</span>
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  function Th({ label, k }: { label: string; k: SortKey }) {
    return (
      <th
        className="px-3 py-2.5 text-left text-xs font-medium cursor-pointer select-none whitespace-nowrap"
        style={{ color: '#94A3B8' }}
        onClick={() => handleSort(k)}
      >
        <div className="flex items-center gap-1">{label}<SortIcon k={k} /></div>
      </th>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2D3147' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#1A1D2E' }}>
        <h2 className="text-sm font-semibold text-white">브랜드별 현황</h2>
        <span className="text-xs" style={{ color: '#94A3B8' }}>{summaries.length}개 브랜드</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: '#161926' }}>
            <tr>
              <Th label="브랜드" k="brand_name" />
              <Th label="매입액" k="purchase_amount" />
              <th className="px-3 py-2.5 text-left text-xs font-medium whitespace-nowrap" style={{ color: '#94A3B8' }}>판매원가</th>
              <Th label="현재 판매율(금)" k="sales_rate_amount" />
              {metric === 'qty' && <Th label="현재 판매율(수)" k="sales_rate_qty" />}
              <Th label="시즌말 예상" k="expected_eod_rate_amount" />
              <Th label="소진 예상" k="days_to_clearance_amount" />
              <th className="px-3 py-2.5 text-left text-xs font-medium whitespace-nowrap" style={{ color: '#94A3B8' }}>아이템 수</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium whitespace-nowrap" style={{ color: '#94A3B8' }}>목표 달성</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const prev = prevMap.get(s.brand_name)
              const currentRate = metric === 'amount' ? s.sales_rate_amount : s.sales_rate_qty
              const prevRate = metric === 'amount' ? prev?.sales_rate_amount : prev?.sales_rate_qty
              const delta = currentRate != null && prevRate != null ? currentRate - prevRate : null
              const isSelected = selectedBrand === s.brand_name
              const targetMet = targetRate != null && currentRate != null && currentRate >= targetRate

              return (
                <tr
                  key={s.brand_name}
                  onClick={() => onSelectBrand(isSelected ? null : s.brand_name)}
                  className="cursor-pointer transition"
                  style={{
                    backgroundColor: isSelected ? 'rgba(99,102,241,0.08)' : i % 2 === 0 ? '#1A1D2E' : '#161926',
                    borderLeft: isSelected ? '2px solid #6366F1' : '2px solid transparent',
                  }}
                >
                  <td className="px-3 py-3 font-medium text-white">{s.brand_name}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap" style={{ color: '#94A3B8' }}>{fmtCurrency(s.purchase_amount)}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap" style={{ color: '#94A3B8' }}>{fmtCurrency(s.sales_cost)}</td>
                  <td className="px-3 py-3">
                    <RateCell rate={s.sales_rate_amount} delta={metric === 'amount' ? delta : null} />
                  </td>
                  {metric === 'qty' && (
                    <td className="px-3 py-3">
                      <RateCell rate={s.sales_rate_qty} delta={delta} />
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <RateCell rate={metric === 'amount' ? s.expected_eod_rate_amount : s.expected_eod_rate_qty} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap" style={{ color: '#F1F5F9' }}>
                    {s.days_to_clearance_amount != null ? `D+${Math.round(s.days_to_clearance_amount)}일` : '—'}
                  </td>
                  <td className="px-3 py-3 text-right" style={{ color: '#94A3B8' }}>{s.item_count}</td>
                  <td className="px-3 py-3">
                    {targetRate != null && currentRate != null ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: targetMet ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: targetMet ? '#22C55E' : '#EF4444' }}>
                        {targetMet ? '달성' : `${(targetRate - currentRate).toFixed(1)}% 부족`}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RateCell({ rate, delta }: { rate: number | null | undefined; delta?: number | null }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs px-2 py-0.5 rounded font-semibold"
        style={{ backgroundColor: rateBg(rate), color: rateColor(rate) }}>
        {fmtPct(rate)}
      </span>
      {delta != null && (
        <span className="text-xs" style={{ color: delta >= 0 ? '#22C55E' : '#EF4444' }}>
          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
        </span>
      )}
    </div>
  )
}
