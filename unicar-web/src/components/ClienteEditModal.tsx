import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { clientesService } from '../services/clientes'
import { supabase } from '../lib/supabase'
import { Icon } from './ui/Icon'
import type { Cliente, Veiculo } from '../types'

// ─── Local helpers ────────────────────────────────────────────────────────────

function formatCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}
function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}
function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}
function formatCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length <= 5 ? d : `${d.slice(0,5)}-${d.slice(5)}`
}
function normalizePlate(v: string) {
  return v.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7)
}
function displayPlate(raw: string) {
  return raw.length >= 7 ? `${raw.slice(0,3)}-${raw.slice(3)}` : raw
}

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  tipo: 'PF' | 'PJ'
  nome: string
  documento: string
  nomeFantasia: string
  inscricaoEstadual: string
  responsavel: string
  telefone: string
  telefone2: string
  email: string
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  veiculos: Veiculo[]
}

function clienteToForm(c: Cliente): FormData {
  return {
    tipo: c.tipo,
    nome: c.nome,
    documento: c.documento,
    nomeFantasia: c.nomeFantasia ?? '',
    inscricaoEstadual: c.inscricaoEstadual ?? '',
    responsavel: c.responsavel ?? '',
    telefone: c.telefone,
    telefone2: c.telefone2 ?? '',
    email: c.email ?? '',
    cep: c.cep ?? '',
    rua: c.rua ?? '',
    numero: c.numero ?? '',
    complemento: c.complemento ?? '',
    bairro: c.bairro ?? '',
    cidade: c.cidade ?? '',
    estado: c.estado ?? '',
    veiculos: c.veiculos,
  }
}

// ─── Inline field styles ──────────────────────────────────────────────────────

const fieldInput: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid #CFCCC6', borderRadius: 5,
  padding: '7px 10px', fontSize: 12.5, color: '#1A1A1A',
  outline: 'none', background: '#fff', fontFamily: 'inherit',
}

function fLabel(text: string) {
  return <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: '#6A6864', marginBottom: 4 }}>{text}</label>
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 10px' }}>
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: '#6A6864', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: '#EBE8E2' }} />
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClienteEditModalProps {
  clienteId: string
  onClose: () => void
  onSaved: (updated: Cliente) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClienteEditModal({ clienteId, onClose, onSaved }: ClienteEditModalProps) {
  const [form,       setForm]       = useState<FormData | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ placa: '', modelo: '', ano: '', km: '' })

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*, veiculos(*)')
      .eq('id', clienteId)
      .single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data, error }: any) => {
        if (error || !data) { setError('Erro ao carregar cliente'); setLoading(false); return }
        const c: Cliente = {
          id: data.id, tipo: data.tipo, nome: data.nome, documento: data.documento,
          nomeFantasia: data.nome_fantasia ?? undefined,
          inscricaoEstadual: data.inscricao_estadual ?? undefined,
          responsavel: data.responsavel ?? undefined,
          telefone: data.telefone, telefone2: data.telefone2 ?? undefined,
          email: data.email ?? undefined, cep: data.cep ?? undefined,
          rua: data.rua ?? undefined, numero: data.numero ?? undefined,
          complemento: data.complemento ?? undefined, bairro: data.bairro ?? undefined,
          cidade: data.cidade ?? undefined, estado: data.estado ?? undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          veiculos: (data.veiculos ?? []).map((v: any) => ({ id: v.id, placa: v.placa, modelo: v.modelo, ano: v.ano ?? '', km: v.km ?? '' })),
        }
        setForm(clienteToForm(c))
        setLoading(false)
      })
  }, [clienteId])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  function patch(p: Partial<FormData>) {
    setForm(prev => prev ? { ...prev, ...p } : prev)
  }

  async function handleCepBlur(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        patch({ rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf })
      }
    } catch { /* ignore */ }
    setCepLoading(false)
  }

  function addVehicle() {
    if (!newVehicle.placa || !newVehicle.modelo) return
    patch({ veiculos: [...(form?.veiculos ?? []), { id: crypto.randomUUID(), ...newVehicle, placa: normalizePlate(newVehicle.placa) }] })
    setNewVehicle({ placa: '', modelo: '', ano: '', km: '' })
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setError('')
    try {
      const updated = await clientesService.update({
        id: clienteId,
        tipo: form.tipo,
        nome: form.nome,
        documento: form.documento.replace(/\D/g, ''),
        nomeFantasia: form.nomeFantasia || undefined,
        inscricaoEstadual: form.inscricaoEstadual || undefined,
        responsavel: form.responsavel || undefined,
        telefone: form.telefone.replace(/\D/g, ''),
        telefone2: form.telefone2 ? form.telefone2.replace(/\D/g, '') : undefined,
        email: form.email || undefined,
        cep: form.cep ? form.cep.replace(/\D/g, '') : undefined,
        rua: form.rua || undefined,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        bairro: form.bairro || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        veiculos: form.veiculos,
      })
      onSaved(updated)
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Erro ao salvar')
    }
    setSaving(false)
  }

  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#E31E2D'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
  }
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#CFCCC6'
    e.currentTarget.style.boxShadow = 'none'
  }

  const isPF = form?.tipo === 'PF'

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 540,
        background: '#fff', zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        animation: 'cem-slide-in 0.22s cubic-bezier(0.32,0.72,0,1) forwards',
      }}>
        <style>{`
          @keyframes cem-slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }
        `}</style>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E3E0D9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Editar cliente</div>
            <div style={{ fontSize: 11.5, color: '#8A8A8A', marginTop: 2 }}>Edite os dados do cliente</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A6864', display: 'grid', placeItems: 'center', padding: 6, borderRadius: 6 }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#8A8A8A', fontSize: 13 }}>
              Carregando...
            </div>
          ) : error && !form ? (
            <div style={{ color: '#dc2626', fontSize: 13, padding: 16 }}>{error}</div>
          ) : form ? (
            <>
              <SectionHeader title="Dados pessoais" />

              {/* Tipo */}
              <div style={{ marginBottom: 12 }}>
                {fLabel('Tipo')}
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['PF', 'PJ'] as const).map(t => (
                    <button key={t} type="button" onClick={() => patch({ tipo: t })}
                      style={{ padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: form.tipo === t ? '1.5px solid #E31E2D' : '1px solid #CFCCC6', background: form.tipo === t ? 'rgba(227,30,45,0.07)' : '#fff', color: form.tipo === t ? '#E31E2D' : '#6A6864', fontFamily: 'inherit' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome + Doc */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  {fLabel(isPF ? 'Nome completo' : 'Razão social')}
                  <input value={form.nome} onChange={e => patch({ nome: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} />
                </div>
                <div>
                  {fLabel(isPF ? 'CPF' : 'CNPJ')}
                  <input
                    value={isPF ? formatCPF(form.documento) : formatCNPJ(form.documento)}
                    onChange={e => patch({ documento: e.target.value.replace(/\D/g, '') })}
                    onFocus={inputFocus} onBlur={inputBlur}
                    style={{ ...fieldInput, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
              </div>

              {!isPF && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    {fLabel('Nome fantasia')}
                    <input value={form.nomeFantasia} onChange={e => patch({ nomeFantasia: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} />
                  </div>
                  <div>
                    {fLabel('Inscrição estadual')}
                    <input value={form.inscricaoEstadual} onChange={e => patch({ inscricaoEstadual: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} />
                  </div>
                </div>
              )}

              {!isPF && (
                <div style={{ marginBottom: 12 }}>
                  {fLabel('Responsável')}
                  <input value={form.responsavel} onChange={e => patch({ responsavel: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} />
                </div>
              )}

              <SectionHeader title="Contato" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  {fLabel('Telefone')}
                  <input value={formatPhone(form.telefone)} onChange={e => patch({ telefone: e.target.value.replace(/\D/g, '') })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} />
                </div>
                <div>
                  {fLabel('Telefone 2')}
                  <input value={formatPhone(form.telefone2)} onChange={e => patch({ telefone2: e.target.value.replace(/\D/g, '') })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} placeholder="Opcional" />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                {fLabel('E-mail')}
                <input type="email" value={form.email} onChange={e => patch({ email: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} placeholder="Opcional" />
              </div>

              <SectionHeader title="Endereço" />

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  {fLabel('CEP')}
                  <input
                    value={formatCEP(form.cep)}
                    onChange={e => patch({ cep: e.target.value.replace(/\D/g, '') })}
                    onBlur={e => { inputBlur(e); handleCepBlur(form.cep) }}
                    onFocus={inputFocus}
                    style={{ ...fieldInput, fontFamily: "'JetBrains Mono', monospace" }}
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  {fLabel('Rua')}
                  <div style={{ position: 'relative' }}>
                    <input value={form.rua} onChange={e => patch({ rua: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} />
                    {cepLoading && <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#9ca3af' }}>buscando…</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  {fLabel('Número')}
                  <input value={form.numero} onChange={e => patch({ numero: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} />
                </div>
                <div>
                  {fLabel('Complemento')}
                  <input value={form.complemento} onChange={e => patch({ complemento: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} placeholder="Apto, sala…" />
                </div>
                <div>
                  {fLabel('Bairro')}
                  <input value={form.bairro} onChange={e => patch({ bairro: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px', gap: 10, marginBottom: 12 }}>
                <div>
                  {fLabel('Cidade')}
                  <input value={form.cidade} onChange={e => patch({ cidade: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} />
                </div>
                <div>
                  {fLabel('UF')}
                  <select value={form.estado} onChange={e => patch({ estado: e.target.value })} onFocus={inputFocus} onBlur={inputBlur}
                    style={{ ...fieldInput, cursor: 'pointer' }}>
                    <option value="">—</option>
                    {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>

              <SectionHeader title="Veículos" />

              {form.veiculos.map((v, i) => (
                <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 68px 90px 28px', gap: 6, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #EBE8E2' }}>
                  <input value={displayPlate(v.placa)} onChange={e => { const vs = [...form.veiculos]; vs[i] = { ...v, placa: normalizePlate(e.target.value) }; patch({ veiculos: vs }) }} onFocus={inputFocus} onBlur={inputBlur} style={{ ...fieldInput, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }} placeholder="ABC-1234" />
                  <input value={v.modelo} onChange={e => { const vs = [...form.veiculos]; vs[i] = { ...v, modelo: e.target.value }; patch({ veiculos: vs }) }} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} placeholder="Modelo" />
                  <input value={v.ano} onChange={e => { const vs = [...form.veiculos]; vs[i] = { ...v, ano: e.target.value.replace(/\D/g,'').slice(0,4) }; patch({ veiculos: vs }) }} onFocus={inputFocus} onBlur={inputBlur} style={{ ...fieldInput, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }} placeholder="Ano" />
                  <input value={v.km} onChange={e => { const vs = [...form.veiculos]; vs[i] = { ...v, km: e.target.value.replace(/\D/g,'') }; patch({ veiculos: vs }) }} onFocus={inputFocus} onBlur={inputBlur} style={{ ...fieldInput, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }} placeholder="Km" />
                  <button type="button" onClick={() => patch({ veiculos: form.veiculos.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', display: 'grid', placeItems: 'center', padding: 4 }}>
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              ))}

              {/* Add vehicle row */}
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 68px 90px 28px', gap: 6, alignItems: 'center', paddingTop: 8 }}>
                <input value={newVehicle.placa.toUpperCase()} onChange={e => setNewVehicle(v => ({ ...v, placa: e.target.value }))} onFocus={inputFocus} onBlur={inputBlur} style={{ ...fieldInput, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }} placeholder="ABC-1234" />
                <input value={newVehicle.modelo} onChange={e => setNewVehicle(v => ({ ...v, modelo: e.target.value }))} onFocus={inputFocus} onBlur={inputBlur} style={fieldInput} placeholder="Modelo" />
                <input value={newVehicle.ano} onChange={e => setNewVehicle(v => ({ ...v, ano: e.target.value.replace(/\D/g,'').slice(0,4) }))} onFocus={inputFocus} onBlur={inputBlur} style={{ ...fieldInput, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }} placeholder="Ano" />
                <input value={newVehicle.km} onChange={e => setNewVehicle(v => ({ ...v, km: e.target.value.replace(/\D/g,'') }))} onFocus={inputFocus} onBlur={inputBlur} style={{ ...fieldInput, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }} placeholder="Km" />
                <button type="button" onClick={addVehicle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', display: 'grid', placeItems: 'center', padding: 4 }}>
                  <Icon name="plus" size={16} />
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E3E0D9', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: '#fff' }}>
          {error && form && <span style={{ flex: 1, fontSize: 12, color: '#dc2626' }}>{error}</span>}
          {(!error || !form) && <div style={{ flex: 1 }} />}
          <button type="button" onClick={onClose} disabled={saving}
            style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #CFCCC6', background: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', color: '#1A1A1A', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving || loading}
            style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#E31E2D', fontSize: 13, fontWeight: 600, cursor: (saving || loading) ? 'not-allowed' : 'pointer', color: '#fff', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.8 : 1 }}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
