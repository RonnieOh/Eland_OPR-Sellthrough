'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Season } from '@/lib/types/database'
import { Plus, Check } from 'lucide-react'

interface Props {
  seasons: Season[]
}

export default function SettingsClient({ seasons: initial }: Props) {
  const supabase = createClient()
  const [seasons, setSeasons] = useState(initial)
  const [form, setForm] = useState({
    season_name: '', start_date: '', end_date: '',
    target_rate_amount: 80, target_rate_qty: 80,
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await supabase
      .from('seasons')
      .insert({ ...form, is_active: false })
      .select()
      .single()
    if (!error && data) {
      setSeasons(prev => [data, ...prev])
      setForm({ season_name: '', start_date: '', end_date: '', target_rate_amount: 80, target_rate_qty: 80 })
      setMsg('시즌이 등록되었습니다.')
    }
    setSaving(false)
  }

  async function setActive(id: string) {
    await supabase.from('seasons').update({ is_active: false }).neq('id', id)
    await supabase.from('seasons').update({ is_active: true }).eq('id', id)
    setSeasons(prev => prev.map(s => ({ ...s, is_active: s.id === id })))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">시즌 설정</h1>
        <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>시즌 종료일과 목표 판매율을 관리합니다</p>
      </div>

      {/* 시즌 생성 폼 */}
      <form onSubmit={handleCreate} className="rounded-xl p-5 space-y-4" style={{ backgroundColor: '#1A1D2E', border: '1px solid #2D3147' }}>
        <h2 className="text-sm font-semibold text-white">새 시즌 등록</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="시즌명 *" value={form.season_name} onChange={v => setForm(f => ({ ...f, season_name: v }))} placeholder="예: 26SS" required />
          <Field label="시작일" value={form.start_date} onChange={v => setForm(f => ({ ...f, start_date: v }))} type="date" />
          <Field label="종료일 *" value={form.end_date} onChange={v => setForm(f => ({ ...f, end_date: v }))} type="date" required />
          <div />
          <NumField label="목표 판매율 — 금액 (%)" value={form.target_rate_amount} onChange={v => setForm(f => ({ ...f, target_rate_amount: v }))} />
          <NumField label="목표 판매율 — 수량 (%)" value={form.target_rate_qty} onChange={v => setForm(f => ({ ...f, target_rate_qty: v }))} />
        </div>
        {msg && <p className="text-xs" style={{ color: '#22C55E' }}>{msg}</p>}
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50" style={{ backgroundColor: '#6366F1', color: '#fff' }}>
          <Plus size={14} /> {saving ? '저장 중...' : '시즌 등록'}
        </button>
      </form>

      {/* 시즌 목록 */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2D3147' }}>
        <div className="px-4 py-3" style={{ backgroundColor: '#1A1D2E' }}>
          <h2 className="text-sm font-semibold text-white">등록된 시즌</h2>
        </div>
        {seasons.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm" style={{ color: '#94A3B8', backgroundColor: '#161926' }}>
            등록된 시즌이 없습니다
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#161926' }}>
              <tr>
                {['시즌명', '시작일', '종료일', '목표(금액)', '목표(수량)', '상태'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: '#94A3B8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seasons.map((s, i) => (
                <tr key={s.id} style={{ backgroundColor: i % 2 === 0 ? '#1A1D2E' : '#161926' }}>
                  <td className="px-4 py-3 font-medium text-white">{s.season_name}</td>
                  <td className="px-4 py-3" style={{ color: '#94A3B8' }}>{s.start_date ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: '#94A3B8' }}>{s.end_date}</td>
                  <td className="px-4 py-3" style={{ color: '#94A3B8' }}>{s.target_rate_amount}%</td>
                  <td className="px-4 py-3" style={{ color: '#94A3B8' }}>{s.target_rate_qty}%</td>
                  <td className="px-4 py-3">
                    {s.is_active ? (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#22C55E' }}>
                        <Check size={12} /> 활성
                      </span>
                    ) : (
                      <button onClick={() => setActive(s.id)} className="text-xs px-2 py-1 rounded transition hover:opacity-80" style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#94A3B8' }}>
                        활성화
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#F1F5F9' }}
      />
    </div>
  )
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>{label}</label>
      <input
        type="number" min={0} max={200} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ backgroundColor: '#0F1117', border: '1px solid #2D3147', color: '#F1F5F9' }}
      />
    </div>
  )
}
