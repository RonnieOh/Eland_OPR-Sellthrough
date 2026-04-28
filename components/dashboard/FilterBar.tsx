'use client'

import { Search, X } from 'lucide-react'

interface Props {
  brands: string[]
  selectedBrands: string[]
  onBrandsChange: (b: string[]) => void
  searchText: string
  onSearchChange: (s: string) => void
  rateRange: [number, number]
  onRateRangeChange: (r: [number, number]) => void
}

export default function FilterBar({
  brands, selectedBrands, onBrandsChange,
  searchText, onSearchChange,
  rateRange, onRateRangeChange,
}: Props) {
  function toggleBrand(b: string) {
    onBrandsChange(
      selectedBrands.includes(b)
        ? selectedBrands.filter(x => x !== b)
        : [...selectedBrands, b]
    )
  }

  function clearAll() {
    onBrandsChange([])
    onSearchChange('')
    onRateRangeChange([0, 150])
  }

  const hasFilter = selectedBrands.length > 0 || searchText || rateRange[0] > 0 || rateRange[1] < 150

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147' }}>
      <div className="flex items-center gap-3 flex-wrap">
        {/* 텍스트 검색 */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
          <input
            type="text"
            value={searchText}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="아이템명 / 코드 검색"
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#F1F5F9' }}
          />
        </div>

        {/* 판매율 범위 슬라이더 */}
        <div className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
          <span className="text-xs">판매율</span>
          <input
            type="number" min={0} max={150} value={rateRange[0]}
            onChange={e => onRateRangeChange([Number(e.target.value), rateRange[1]])}
            className="w-16 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
            style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#F1F5F9' }}
          />
          <span>~</span>
          <input
            type="number" min={0} max={150} value={rateRange[1]}
            onChange={e => onRateRangeChange([rateRange[0], Number(e.target.value)])}
            className="w-16 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
            style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#F1F5F9' }}
          />
          <span className="text-xs">%</span>
        </div>

        {hasFilter && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs transition hover:opacity-80" style={{ color: '#94A3B8' }}>
            <X size={12} /> 초기화
          </button>
        )}
      </div>

      {/* 브랜드 다중 선택 */}
      <div className="flex flex-wrap gap-2">
        {brands.map(b => (
          <button
            key={b}
            onClick={() => toggleBrand(b)}
            className="px-3 py-1 rounded-full text-xs font-medium transition"
            style={selectedBrands.includes(b)
              ? { backgroundColor: '#6366F1', color: '#fff' }
              : { backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#94A3B8' }
            }
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  )
}
