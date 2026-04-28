'use client'

import type { Metric } from '@/lib/types/database'

interface Props {
  metric: Metric
  onChange: (m: Metric) => void
}

export default function MetricToggle({ metric, onChange }: Props) {
  return (
    <div className="flex items-center rounded-lg p-1 gap-1" style={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147' }}>
      {(['amount', 'qty'] as Metric[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="px-4 py-1.5 rounded-md text-sm font-medium transition"
          style={metric === m
            ? { backgroundColor: '#6366F1', color: '#fff' }
            : { color: '#94A3B8' }
          }
        >
          {m === 'amount' ? '금액 기준' : '수량 기준'}
        </button>
      ))}
    </div>
  )
}
