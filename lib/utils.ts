import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number | null | undefined, decimals = 1): string {
  if (n == null || isNaN(n)) return '—'
  return n.toFixed(decimals)
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  return `${n.toFixed(1)}%`
}

export function fmtCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(n)
}

export function fmtNumber(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('ko-KR').format(Math.round(n))
}

export function rateColor(rate: number | null | undefined): string {
  if (rate == null) return '#94A3B8'
  if (rate >= 70) return '#22C55E'
  if (rate >= 50) return '#F59E0B'
  return '#EF4444'
}

export function rateBg(rate: number | null | undefined): string {
  if (rate == null) return 'rgba(148,163,184,0.1)'
  if (rate >= 70) return 'rgba(34,197,94,0.1)'
  if (rate >= 50) return 'rgba(245,158,11,0.1)'
  return 'rgba(239,68,68,0.1)'
}
