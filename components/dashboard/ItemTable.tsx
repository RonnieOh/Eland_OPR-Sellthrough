'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Item, Season, Metric } from '@/lib/types/database'
import { fmtPct, fmtCurrency, fmtNumber, rateColor, rateBg } from '@/lib/utils'

interface Props {
  items: Item[]
  metric: Metric
  brandName: string
  activeSeason: Season | null
}

export default function ItemTable({ items, metric, brandName }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 20,
  })


  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2D3147' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#1A1D2E' }}>
        <h2 className="text-sm font-semibold text-white">{brandName} — 아이템 상세</h2>
        <span className="text-xs" style={{ color: '#94A3B8' }}>{items.length}개 아이템</span>
      </div>

      {/* 헤더 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed" style={{ minWidth: '900px' }}>
          <thead style={{ backgroundColor: '#161926' }}>
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-medium w-24" style={{ color: '#94A3B8' }}>코드</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium" style={{ color: '#94A3B8' }}>아이템명</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium w-32" style={{ color: '#94A3B8' }}>매입액</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium w-32" style={{ color: '#94A3B8' }}>판매원가</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium w-28" style={{ color: '#94A3B8' }}>현재 판매율</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium w-28" style={{ color: '#94A3B8' }}>시즌말 예상</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium w-28" style={{ color: '#94A3B8' }}>소진 예상</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium w-28" style={{ color: '#94A3B8' }}>일 판매속도</th>
            </tr>
          </thead>
        </table>

        {/* 가상화 바디 */}
        <div ref={parentRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative', minWidth: '900px' }}>
            {rowVirtualizer.getVirtualItems().map(vRow => {
              const item = items[vRow.index]
              const rate = metric === 'amount' ? item.sales_rate_amount : item.sales_rate_qty
              const eodRate = metric === 'amount' ? item.expected_eod_rate_amount : item.expected_eod_rate_qty
              const daysClear = metric === 'amount' ? item.days_to_clearance_amount : item.days_to_clearance_qty
              const speed = metric === 'amount' ? item.daily_speed_amount : item.daily_speed_qty

              return (
                <table
                  key={vRow.key}
                  className="w-full text-sm table-fixed absolute top-0 left-0"
                  style={{ minWidth: '900px', transform: `translateY(${vRow.start}px)`, height: `${vRow.size}px` }}
                >
                  <tbody>
                    <tr style={{ backgroundColor: vRow.index % 2 === 0 ? '#1A1D2E' : '#161926' }}>
                      <td className="px-3 py-3 text-xs w-24" style={{ color: '#94A3B8' }}>{item.item_code ?? '—'}</td>
                      <td className="px-3 py-3 font-medium text-white truncate">{item.item_name}</td>
                      <td className="px-3 py-3 text-right text-xs w-32" style={{ color: '#94A3B8' }}>{fmtCurrency(item.purchase_amount)}</td>
                      <td className="px-3 py-3 text-right text-xs w-32" style={{ color: '#94A3B8' }}>{fmtCurrency(item.sales_cost)}</td>
                      <td className="px-3 py-3 w-28">
                        <span className="text-xs px-2 py-0.5 rounded font-semibold"
                          style={{ backgroundColor: rateBg(rate), color: rateColor(rate) }}>
                          {fmtPct(rate)}
                        </span>
                      </td>
                      <td className="px-3 py-3 w-28">
                        <span className="text-xs px-2 py-0.5 rounded font-semibold"
                          style={{ backgroundColor: rateBg(eodRate), color: rateColor(eodRate) }}>
                          {fmtPct(eodRate)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-xs w-28" style={{ color: '#F1F5F9' }}>
                        {daysClear != null ? `D+${Math.round(daysClear)}일` : '—'}
                      </td>
                      <td className="px-3 py-3 text-right text-xs w-28" style={{ color: '#94A3B8' }}>
                        {metric === 'amount' ? fmtCurrency(speed) : fmtNumber(speed)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
