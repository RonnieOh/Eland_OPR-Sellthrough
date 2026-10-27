'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { Season } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { calculateItem, type RawRow } from '@/lib/calculate'
import ColumnMapper from './ColumnMapper'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  seasons: Season[]
}

export interface ParsedData {
  headers: string[]
  rows: Record<string, string>[]
  filename: string
}

export type ColumnMapping = {
  brand_name: string
  item_name: string
  item_code: string
  purchase_amount: string
  sales_cost: string
  purchase_qty: string
  sales_qty: string
  reference_date: string
}

export default function UploadClient({ seasons }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [dragging, setDragging] = useState(false)
  const [parsed, setParsed] = useState<ParsedData | null>(null)
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({})
  const [selectedSeasonId, setSelectedSeasonId] = useState(seasons.find(s => s.is_active)?.id ?? seasons[0]?.id ?? '')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const activeSeason = seasons.find(s => s.id === selectedSeasonId)

  function parseFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setParsed({
            headers: result.meta.fields ?? [],
            rows: result.data as Record<string, string>[],
            filename: file.name,
          })
        },
      })
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
        const headers = json.length > 0 ? Object.keys(json[0]) : []
        setParsed({ headers, rows: json, filename: file.name })
      }
      reader.readAsBinaryString(file)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }, [])

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  async function handleUpload() {
    if (!parsed || !activeSeason) return
    const m = mapping as ColumnMapping

    if (!m.brand_name || !m.item_name || !m.purchase_amount || !m.sales_cost || !m.reference_date) {
      setStatus({ type: 'error', msg: '필수 컬럼(브랜드명, 아이템명, 매입액, 판매원가, 기준일자)을 모두 매핑해주세요.' })
      return
    }

    setUploading(true)
    setStatus(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const refDate = parsed.rows[0]?.[m.reference_date] ?? ''

      // 업로드 레코드 생성
      const { data: upload, error: uploadError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          filename: parsed.filename,
          upload_date: new Date().toISOString().split('T')[0],
          reference_date: refDate,
          season_id: selectedSeasonId || null,
          row_count: parsed.rows.length,
        })
        .select()
        .single()

      if (uploadError) throw uploadError

      // 행 변환 및 계산
      const rawRows: RawRow[] = parsed.rows.map(row => ({
        brand_name: row[m.brand_name] ?? '',
        item_name: row[m.item_name] ?? '',
        item_code: m.item_code ? row[m.item_code] : undefined,
        purchase_amount: parseFloat(String(row[m.purchase_amount]).replace(/,/g, '')) || 0,
        sales_cost: parseFloat(String(row[m.sales_cost]).replace(/,/g, '')) || 0,
        purchase_qty: m.purchase_qty ? parseFloat(String(row[m.purchase_qty]).replace(/,/g, '')) || undefined : undefined,
        sales_qty: m.sales_qty ? parseFloat(String(row[m.sales_qty]).replace(/,/g, '')) || undefined : undefined,
        reference_date: row[m.reference_date] ?? refDate,
      })).filter(r => r.brand_name && r.item_name)

      const calculatedItems = rawRows.map(r => calculateItem(r, activeSeason.end_date, upload.id, activeSeason.start_date))

      // 배치 삽입 (청크 단위)
      const CHUNK = 500
      for (let i = 0; i < calculatedItems.length; i += CHUNK) {
        const { error } = await supabase.from('items').insert(calculatedItems.slice(i, i + CHUNK))
        if (error) throw error
      }

      setStatus({ type: 'success', msg: `${calculatedItems.length}개 아이템이 업로드되었습니다.` })
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: unknown) {
      setStatus({ type: 'error', msg: err instanceof Error ? err.message : '업로드 실패' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">파일 업로드</h1>
        <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>CSV 또는 XLSX 파일을 업로드하여 판매율을 계산합니다</p>
      </div>

      {/* 시즌 선택 */}
      {seasons.length > 0 && (
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>시즌 선택</label>
          <select
            value={selectedSeasonId}
            onChange={e => setSelectedSeasonId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#F1F5F9' }}
          >
            {seasons.map(s => (
              <option key={s.id} value={s.id}>
                {s.season_name} (종료: {s.end_date}){s.is_active ? ' ★ 활성' : ''}
              </option>
            ))}
          </select>
          {!activeSeason && (
            <p className="text-xs mt-1" style={{ color: '#EF4444' }}>활성 시즌이 없습니다. 시즌 설정 페이지에서 등록해주세요.</p>
          )}
        </div>
      )}

      {seasons.length === 0 && (
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-sm" style={{ color: '#EF4444' }}>
            시즌이 등록되지 않았습니다. 관리자에게 <a href="/settings" className="underline">시즌 설정</a>을 요청하세요.
          </p>
        </div>
      )}

      {/* 드래그 드롭 영역 */}
      {!parsed && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="rounded-xl border-2 border-dashed p-16 flex flex-col items-center justify-center cursor-pointer transition"
          style={{
            borderColor: dragging ? '#6366F1' : '#2D3147',
            backgroundColor: dragging ? 'rgba(99,102,241,0.05)' : '#1A1D2E',
          }}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload size={36} style={{ color: dragging ? '#6366F1' : '#94A3B8' }} className="mb-3" />
          <p className="text-white font-medium">파일을 드래그하거나 클릭하여 선택</p>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>CSV, XLSX, XLS 지원 · 최대 10만 행</p>
          <input id="file-input" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onFileInput} />
        </div>
      )}

      {/* 컬럼 매핑 */}
      {parsed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{parsed.filename}</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>{parsed.rows.length}행 감지됨</p>
            </div>
            <button
              onClick={() => { setParsed(null); setMapping({}) }}
              className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80"
              style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#94A3B8' }}
            >
              다시 선택
            </button>
          </div>

          <ColumnMapper
            headers={parsed.headers}
            mapping={mapping}
            onChange={setMapping}
          />

          {status && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: status.type === 'success' ? '#22C55E' : '#EF4444',
                border: `1px solid ${status.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
              {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {status.msg}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !activeSeason}
            className="w-full py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50"
            style={{ backgroundColor: '#6366F1', color: '#fff' }}
          >
            {uploading ? '업로드 중...' : '업로드 및 계산 실행'}
          </button>
        </div>
      )}
    </div>
  )
}
