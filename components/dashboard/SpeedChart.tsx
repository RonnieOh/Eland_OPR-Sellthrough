'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Metric } from '@/lib/types/database'
import type { BrandSummary } from '@/lib/calculate'
import { rateColor } from '@/lib/utils'

interface Props {
  brandSummaries: BrandSummary[]
  metric: Metric
}

export default function SpeedChart({ brandSummaries, metric }: Props) {
  if (brandSummaries.length === 0) {
    return (
      <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147', minHeight: '260px' }}>
        <p className="text-sm font-semibold text-white mb-1">브랜드별 일 판매속도</p>
        <p className="text-xs" style={{ color: '#94A3B8' }}>데이터를 업로드하면 차트가 표시됩니다</p>
      </div>
    )
  }

  const data = brandSummaries
    .map(s => ({
      name: s.brand_name,
      speed: metric === 'amount'
        ? Math.round((s.daily_speed_amount ?? 0) / 10000)
        : Math.round(s.daily_speed_qty ?? 0),
      rate: metric === 'amount' ? s.sales_rate_amount : s.sales_rate_qty,
    }))
    .sort((a, b) => b.speed - a.speed)

  const unit = metric === 'amount' ? '만원' : '개'

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147' }}>
      <h3 className="text-sm font-semibold text-white mb-4">
        브랜드별 일 평균 판매속도 ({unit}/일)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3147" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147', borderRadius: '8px' }}
            labelStyle={{ color: '#F1F5F9' }}
            itemStyle={{ color: '#94A3B8' }}
            formatter={(v: number) => [`${v.toLocaleString()} ${unit}/일`, '일 판매속도']}
          />
          <Bar dataKey="speed" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={rateColor(d.rate)} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
