'use client'

import { useState, useMemo } from 'react'
import type { Item, Season, Upload, Metric } from '@/lib/types/database'
import { aggregateBrands } from '@/lib/calculate'
import SummaryCards from './SummaryCards'
import MetricToggle from './MetricToggle'
import FilterBar from './FilterBar'
import BrandTable from './BrandTable'
import ItemTable from './ItemTable'
import SellThroughChart from './SellThroughChart'
import SpeedChart from './SpeedChart'

interface Props {
  items: Item[]
  prevItems: Item[]
  uploads: Upload[]
  activeSeason: Season | null
}

export default function DashboardClient({ items, prevItems, uploads, activeSeason }: Props) {
  const [metric, setMetric] = useState<Metric>('amount')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')
  const [rateRange, setRateRange] = useState<[number, number]>([0, 150])
  const [selectedBrandForItems, setSelectedBrandForItems] = useState<string | null>(null)

  const brands = useMemo(() => Array.from(new Set(items.map(i => i.brand_name))).sort(), [items])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(item.brand_name)) return false
      if (searchText && !item.item_name.toLowerCase().includes(searchText.toLowerCase()) &&
          !item.item_code?.toLowerCase().includes(searchText.toLowerCase())) return false
      const rate = metric === 'amount' ? item.sales_rate_amount : item.sales_rate_qty
      if (rate != null && (rate < rateRange[0] || rate > rateRange[1])) return false
      return true
    })
  }, [items, selectedBrands, searchText, rateRange, metric])

  const brandSummaries = useMemo(() => aggregateBrands(filteredItems), [filteredItems])
  const prevBrandSummaries = useMemo(() => aggregateBrands(prevItems), [prevItems])

  const selectedItems = useMemo(() =>
    selectedBrandForItems
      ? filteredItems.filter(i => i.brand_name === selectedBrandForItems)
      : [],
    [filteredItems, selectedBrandForItems]
  )

  const hasData = items.length > 0

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-white mb-2">데이터가 없습니다</h2>
        <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
          CSV 또는 엑셀 파일을 업로드하여 판매율 분석을 시작하세요
        </p>
        <a
          href="/upload"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-80"
          style={{ backgroundColor: '#6366F1', color: '#fff' }}
        >
          파일 업로드
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 상단: 토글 + 업로드 정보 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">
            {activeSeason?.season_name ?? '시즌 미설정'} 판매율 현황
          </h1>
          {uploads[0] && (
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
              기준일: {uploads[0].reference_date} · {uploads[0].filename}
            </p>
          )}
        </div>
        <MetricToggle metric={metric} onChange={setMetric} />
      </div>

      {/* 요약 카드 */}
      <SummaryCards
        items={filteredItems}
        prevItems={prevItems}
        metric={metric}
        activeSeason={activeSeason}
      />

      {/* 차트 영역 */}
      <div className="grid grid-cols-2 gap-4">
        <SellThroughChart uploads={uploads} metric={metric} />
        <SpeedChart brandSummaries={brandSummaries} metric={metric} />
      </div>

      {/* 필터 */}
      <FilterBar
        brands={brands}
        selectedBrands={selectedBrands}
        onBrandsChange={setSelectedBrands}
        searchText={searchText}
        onSearchChange={setSearchText}
        rateRange={rateRange}
        onRateRangeChange={setRateRange}
      />

      {/* 브랜드 테이블 */}
      <BrandTable
        summaries={brandSummaries}
        prevSummaries={prevBrandSummaries}
        metric={metric}
        selectedBrand={selectedBrandForItems}
        onSelectBrand={setSelectedBrandForItems}
        activeSeason={activeSeason}
      />

      {/* 아이템 테이블 */}
      {selectedBrandForItems && (
        <ItemTable
          items={selectedItems}
          metric={metric}
          brandName={selectedBrandForItems}
          activeSeason={activeSeason}
        />
      )}
    </div>
  )
}
