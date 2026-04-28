import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { Item } from '@/lib/types/database'

export interface RawRow {
  brand_name: string
  item_code?: string
  item_name: string
  purchase_amount: number
  sales_cost: number
  purchase_qty?: number
  sales_qty?: number
  reference_date: string
}

export function calculateItem(
  raw: RawRow,
  seasonEndDate: string,
  uploadId: string
): Omit<Item, 'id' | 'created_at'> {
  const refDate = parseISO(raw.reference_date)
  const endDate = parseISO(seasonEndDate)
  const elapsedDays = Math.max(
    differenceInCalendarDays(refDate, parseISO('2020-01-01')),
    1
  )
  const remainingDays = Math.max(differenceInCalendarDays(endDate, refDate), 0)

  // 금액 기준
  const salesRateAmount = raw.purchase_amount > 0
    ? (raw.sales_cost / raw.purchase_amount) * 100
    : null

  const dailySpeedAmount = raw.sales_cost / elapsedDays

  const expectedEodRateAmount = raw.purchase_amount > 0
    ? ((raw.sales_cost + dailySpeedAmount * remainingDays) / raw.purchase_amount) * 100
    : null

  const remainingAmount = raw.purchase_amount - raw.sales_cost
  const daysToClearanceAmount = dailySpeedAmount > 0
    ? remainingAmount / dailySpeedAmount
    : null

  // 수량 기준
  const hasQty = raw.purchase_qty != null && raw.sales_qty != null
  const salesRateQty = hasQty && raw.purchase_qty! > 0
    ? (raw.sales_qty! / raw.purchase_qty!) * 100
    : null

  const dailySpeedQty = hasQty ? raw.sales_qty! / elapsedDays : null

  const expectedEodRateQty = hasQty && raw.purchase_qty! > 0 && dailySpeedQty != null
    ? ((raw.sales_qty! + dailySpeedQty * remainingDays) / raw.purchase_qty!) * 100
    : null

  const remainingQty = hasQty ? raw.purchase_qty! - raw.sales_qty! : null

  const daysToClearanceQty = hasQty && dailySpeedQty != null && dailySpeedQty > 0
    ? remainingQty! / dailySpeedQty
    : null

  const avgSellingPrice = hasQty && raw.sales_qty! > 0
    ? raw.sales_cost / raw.sales_qty!
    : null

  return {
    upload_id: uploadId,
    brand_name: raw.brand_name,
    item_code: raw.item_code ?? null,
    item_name: raw.item_name,
    purchase_amount: raw.purchase_amount,
    sales_cost: raw.sales_cost,
    sales_rate_amount: salesRateAmount,
    expected_eod_rate_amount: expectedEodRateAmount,
    days_to_clearance_amount: daysToClearanceAmount,
    daily_speed_amount: dailySpeedAmount,
    purchase_qty: raw.purchase_qty ?? null,
    sales_qty: raw.sales_qty ?? null,
    sales_rate_qty: salesRateQty,
    expected_eod_rate_qty: expectedEodRateQty,
    days_to_clearance_qty: daysToClearanceQty,
    daily_speed_qty: dailySpeedQty,
    avg_selling_price: avgSellingPrice,
    remaining_qty: remainingQty,
    remaining_amount: remainingAmount,
    reference_date: raw.reference_date,
  }
}

export interface BrandSummary {
  brand_name: string
  purchase_amount: number
  sales_cost: number
  purchase_qty: number | null
  sales_qty: number | null
  sales_rate_amount: number | null
  sales_rate_qty: number | null
  expected_eod_rate_amount: number | null
  expected_eod_rate_qty: number | null
  days_to_clearance_amount: number | null
  days_to_clearance_qty: number | null
  daily_speed_amount: number
  daily_speed_qty: number | null
  item_count: number
}

export function aggregateBrands(items: Item[]): BrandSummary[] {
  const map = new Map<string, Item[]>()
  for (const item of items) {
    if (!map.has(item.brand_name)) map.set(item.brand_name, [])
    map.get(item.brand_name)!.push(item)
  }

  return Array.from(map.entries()).map(([brand_name, rows]) => {
    const purchase_amount = rows.reduce((s, r) => s + r.purchase_amount, 0)
    const sales_cost = rows.reduce((s, r) => s + r.sales_cost, 0)

    const hasQty = rows.some(r => r.purchase_qty != null)
    const purchase_qty = hasQty ? rows.reduce((s, r) => s + (r.purchase_qty ?? 0), 0) : null
    const sales_qty = hasQty ? rows.reduce((s, r) => s + (r.sales_qty ?? 0), 0) : null

    const daily_speed_amount = rows.reduce((s, r) => s + (r.daily_speed_amount ?? 0), 0)
    const daily_speed_qty = hasQty ? rows.reduce((s, r) => s + (r.daily_speed_qty ?? 0), 0) : null

    const remainingAmount = purchase_amount - sales_cost
    const days_to_clearance_amount = daily_speed_amount > 0 ? remainingAmount / daily_speed_amount : null
    const days_to_clearance_qty = hasQty && daily_speed_qty != null && daily_speed_qty > 0
      ? ((purchase_qty! - sales_qty!) / daily_speed_qty)
      : null

    return {
      brand_name,
      purchase_amount,
      sales_cost,
      purchase_qty,
      sales_qty,
      sales_rate_amount: purchase_amount > 0 ? (sales_cost / purchase_amount) * 100 : null,
      sales_rate_qty: hasQty && purchase_qty! > 0 ? (sales_qty! / purchase_qty!) * 100 : null,
      expected_eod_rate_amount: rows[0]?.expected_eod_rate_amount != null
        ? purchase_amount > 0
          ? ((sales_cost + daily_speed_amount * (rows[0].expected_eod_rate_amount > 0 ? 1 : 0)) / purchase_amount) * 100
          : null
        : null,
      expected_eod_rate_qty: null,
      days_to_clearance_amount,
      days_to_clearance_qty,
      daily_speed_amount,
      daily_speed_qty,
      item_count: rows.length,
    }
  })
}
