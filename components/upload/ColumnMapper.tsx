'use client'

import type { ColumnMapping } from './UploadClient'

interface Props {
  headers: string[]
  mapping: Partial<ColumnMapping>
  onChange: (m: Partial<ColumnMapping>) => void
}

const FIELDS: { key: keyof ColumnMapping; label: string; required: boolean; desc: string }[] = [
  { key: 'brand_name', label: '브랜드명', required: true, desc: '브랜드 이름' },
  { key: 'item_name', label: '아이템명', required: true, desc: '상품명' },
  { key: 'item_code', label: '아이템코드', required: false, desc: '상품 코드 (옵션)' },
  { key: 'purchase_amount', label: '매입액', required: true, desc: '매입 총액 (원가)' },
  { key: 'sales_cost', label: '판매원가', required: true, desc: '판매된 상품의 원가 합계' },
  { key: 'purchase_qty', label: '매입수량', required: false, desc: '매입 총 수량 (옵션)' },
  { key: 'sales_qty', label: '판매수량', required: false, desc: '판매된 수량 (옵션)' },
  { key: 'reference_date', label: '기준일자', required: true, desc: '데이터 기준일 (YYYY-MM-DD)' },
]

export default function ColumnMapper({ headers, mapping, onChange }: Props) {
  function setField(key: keyof ColumnMapping, value: string) {
    onChange({ ...mapping, [key]: value || undefined })
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2D3147' }}>
      <div className="px-4 py-3" style={{ backgroundColor: '#1A1D2E' }}>
        <p className="text-sm font-semibold text-white">컬럼 매핑</p>
        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>파일의 컬럼을 각 지표에 매핑해주세요</p>
      </div>
      <div className="divide-y" style={{ divideColor: '#2D3147' }}>
        {FIELDS.map(field => (
          <div key={field.key} className="flex items-center px-4 py-3 gap-4" style={{ backgroundColor: '#161926' }}>
            <div className="w-32 shrink-0">
              <span className="text-sm font-medium text-white">{field.label}</span>
              {field.required && <span className="ml-1 text-xs" style={{ color: '#EF4444' }}>*</span>}
            </div>
            <div className="flex-1">
              <p className="text-xs mb-1.5" style={{ color: '#94A3B8' }}>{field.desc}</p>
              <select
                value={mapping[field.key] ?? ''}
                onChange={e => setField(field.key, e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#F1F5F9' }}
              >
                <option value="">{field.required ? '— 선택하세요 —' : '— 없음 —'}</option>
                {headers.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
