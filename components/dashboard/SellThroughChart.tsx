'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { Upload, Metric } from '@/lib/types/database'
import { format, parseISO } from 'date-fns'

interface Props {
  uploads: Upload[]
  metric: Metric
}

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#8B5CF6']

export default function SellThroughChart({ uploads, metric }: Props) {
  // 실제로는 각 업로드별 브랜드 합산 판매율을 차트에 표시
  // 여기서는 업로드 이력을 날짜별로 표시 (서버에서 집계 데이터 필요)
  if (uploads.length === 0) {
    return <EmptyChart title="판매율 추이" />
  }

  const data = uploads
    .slice()
    .reverse()
    .map(u => ({
      date: format(parseISO(u.reference_date), 'MM/dd'),
      '전체': null as number | null,
    }))

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147' }}>
      <h3 className="text-sm font-semibold text-white mb-4">주차별 판매율 추이</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3147" />
          <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147', borderRadius: '8px' }}
            labelStyle={{ color: '#F1F5F9' }}
            itemStyle={{ color: '#94A3B8' }}
            formatter={(v: number) => [`${v?.toFixed(1)}%`]}
          />
          <ReferenceLine y={70} stroke="#22C55E" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.5} />
          {COLORS.map((color, i) => (
            <Line key={i} type="monotone" dataKey="전체" stroke={color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs mt-2 text-center" style={{ color: '#94A3B8' }}>
        업로드가 2회 이상 누적되면 추이가 표시됩니다
      </p>
    </div>
  )
}

function EmptyChart({ title }: { title: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147', minHeight: '260px' }}>
      <p className="text-sm font-semibold text-white mb-1">{title}</p>
      <p className="text-xs" style={{ color: '#94A3B8' }}>데이터를 업로드하면 차트가 표시됩니다</p>
    </div>
  )
}
