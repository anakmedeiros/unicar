import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Topbar } from '../components/layout/Topbar'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/Icon'
import { Field, Input, Select } from '../components/ui/Field'
import { clientesService } from '../services/clientes'
import type { Cliente, Veiculo } from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDoc(tipo: 'PF' | 'PJ', doc: string) {
  return tipo === 'PF' ? formatCPF(doc) : formatCNPJ(doc)
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
  if (d.length <= 5) return d
  return `${d.slice(0,5)}-${d.slice(5)}`
}

function normalizePlate(v: string) {
  return v.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7)
}

function displayPlate(raw: string) {
  if (raw.length >= 7) return `${raw.slice(0,3)}-${raw.slice(3)}`
  return raw
}

// ─── Form state type ──────────────────────────────────────────────────────────

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

const EMPTY_FORM: FormData = {
  tipo: 'PF',
  nome: '',
  documento: '',
  nomeFantasia: '',
  inscricaoEstadual: '',
  responsavel: '',
  telefone: '',
  telefone2: '',
  email: '',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  veiculos: [],
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

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
      <span style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '0.12em',
        color: '#6A6864',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: '#EBE8E2' }} />
    </div>
  )
}

// ─── Tipo badge ───────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: 'PF' | 'PJ' }) {
  const isPF = tipo === 'PF'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.03em',
      background: isPF ? 'rgba(99,102,241,0.10)' : 'rgba(245,158,11,0.12)',
      color: isPF ? '#4F46D6' : '#B25E09',
    }}>
      {tipo}
    </span>
  )
}

// ─── Plate badge ─────────────────────────────────────────────────────────────

function PlateBadge({ placa }: { placa: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 7px',
      border: '1.5px solid #CFCCC6',
      borderRadius: 3,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      fontWeight: 600,
      color: '#1A1A1A',
      letterSpacing: '0.06em',
      background: '#F4F2ED',
      whiteSpace: 'nowrap',
    }}>
      {displayPlate(placa)}
    </span>
  )
}

// ─── Vehicle row component ────────────────────────────────────────────────────

interface VehicleRowProps {
  veiculo: Veiculo
  onRemove: () => void
  onChange: (updated: Veiculo) => void
}

function VehicleRow({ veiculo, onRemove, onChange }: VehicleRowProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '110px 1fr 72px 100px 28px',
      gap: 6,
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid #EBE8E2',
    }}>
      <input
        value={displayPlate(veiculo.placa)}
        onChange={e => onChange({ ...veiculo, placa: normalizePlate(e.target.value) })}
        style={{
          border: '1px solid #CFCCC6',
          borderRadius: 5,
          padding: '5px 8px',
          fontSize: 11.5,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#1A1A1A',
          outline: 'none',
          background: '#fff',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#E31E2D'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#CFCCC6'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      <input
        value={veiculo.modelo}
        onChange={e => onChange({ ...veiculo, modelo: e.target.value })}
        placeholder="Modelo"
        style={{
          border: '1px solid #CFCCC6',
          borderRadius: 5,
          padding: '5px 8px',
          fontSize: 12,
          color: '#1A1A1A',
          outline: 'none',
          background: '#fff',
          fontFamily: 'inherit',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#E31E2D'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#CFCCC6'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      <input
        value={veiculo.ano}
        onChange={e => onChange({ ...veiculo, ano: e.target.value.replace(/\D/g, '').slice(0, 4) })}
        placeholder="Ano"
        style={{
          border: '1px solid #CFCCC6',
          borderRadius: 5,
          padding: '5px 8px',
          fontSize: 12,
          color: '#1A1A1A',
          outline: 'none',
          background: '#fff',
          fontFamily: 'inherit',
          textAlign: 'center',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#E31E2D'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#CFCCC6'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      <div style={{ position: 'relative' }}>
        <input
          value={veiculo.km}
          onChange={e => onChange({ ...veiculo, km: e.target.value.replace(/\D/g, '') })}
          placeholder="0"
          style={{
            width: '100%',
            border: '1px solid #CFCCC6',
            borderRadius: 5,
            padding: '5px 32px 5px 8px',
            fontSize: 12,
            color: '#1A1A1A',
            outline: 'none',
            background: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#E31E2D'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#CFCCC6'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <span style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 10.5,
          color: '#8A8A8A',
          pointerEvents: 'none',
        }}>km</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remover veículo"
        style={{
          width: 24,
          height: 24,
          display: 'grid',
          placeItems: 'center',
          background: 'transparent',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          color: '#8A8A8A',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(227,30,45,0.08)'
          e.currentTarget.style.color = '#E31E2D'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#8A8A8A'
        }}
      >
        <Icon name="trash" size={13} />
      </button>
    </div>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface DrawerProps {
  open: boolean
  mode: 'new' | 'edit'
  form: FormData
  errors: Partial<Record<string, string>>
  cepLoading: boolean
  newVehicle: { placa: string; modelo: string; ano: string; km: string }
  onFormChange: (patch: Partial<FormData>) => void
  onNewVehicleChange: (patch: Partial<{ placa: string; modelo: string; ano: string; km: string }>) => void
  onAddVehicle: () => void
  onClose: () => void
  onSave: () => void
  onDelete: () => void
  onCepBlur: (cep: string) => void
}

function ClienteDrawer({
  open,
  mode,
  form,
  errors,
  cepLoading,
  newVehicle,
  onFormChange,
  onNewVehicleChange,
  onAddVehicle,
  onClose,
  onSave,
  onDelete,
  onCepBlur,
}: DrawerProps) {
  const isPF = form.tipo === 'PF'
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Reset confirm state when drawer opens/closes
  useEffect(() => {
    if (!open) setConfirmDelete(false)
  }, [open])

  // Trap focus and close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDelete) setConfirmDelete(false)
        else onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose, confirmDelete])

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20,20,20,0.45)',
          zIndex: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'new' ? 'Novo cliente' : 'Editar cliente'}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 560,
          background: '#fff',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E3E0D9',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
              {mode === 'new' ? 'Novo cliente' : 'Editar cliente'}
            </div>
            <div style={{ fontSize: 11.5, color: '#8A8A8A', marginTop: 2 }}>
              {mode === 'new'
                ? 'Cadastre um novo cliente e seus veículos'
                : 'Edite os dados do cliente'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: 28,
              height: 28,
              display: 'grid',
              placeItems: 'center',
              background: 'transparent',
              border: '1px solid #CFCCC6',
              borderRadius: 5,
              cursor: 'pointer',
              color: '#8A8A8A',
              flexShrink: 0,
            }}
          >
            <Icon name="plus" size={13} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Seção 1: Identificação ── */}
            <section>
              <SectionHeader title="Identificação" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Toggle PF / PJ */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', marginBottom: 6 }}>
                    Tipo de pessoa
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    border: '1px solid #CFCCC6',
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}>
                    {(['PF', 'PJ'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onFormChange({ tipo: t })}
                        style={{
                          padding: '7px 18px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: 'none',
                          background: form.tipo === t ? '#111111' : '#fff',
                          color: form.tipo === t ? '#fff' : '#4A4A4A',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                      >
                        {t === 'PF' ? 'Pessoa física' : 'Pessoa jurídica'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 1: Nome / Documento */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field
                    label={isPF ? 'Nome completo' : 'Razão social'}
                    required
                    error={errors.nome}
                  >
                    <Input
                      value={form.nome}
                      onChange={e => onFormChange({ nome: e.target.value })}
                      placeholder={isPF ? 'Nome completo' : 'Razão social'}
                      error={!!errors.nome}
                      autoComplete="name"
                    />
                  </Field>
                  <Field
                    label={isPF ? 'CPF' : 'CNPJ'}
                    required
                    error={errors.documento}
                  >
                    <Input
                      value={formatDoc(form.tipo, form.documento)}
                      onChange={e => onFormChange({ documento: e.target.value.replace(/\D/g, '') })}
                      placeholder={isPF ? '000.000.000-00' : '00.000.000/0000-00'}
                      error={!!errors.documento}
                      mono
                    />
                  </Field>
                </div>

                {/* PJ extra fields */}
                {!isPF && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Field label="Nome fantasia">
                      <Input
                        value={form.nomeFantasia}
                        onChange={e => onFormChange({ nomeFantasia: e.target.value })}
                        placeholder="Nome fantasia"
                      />
                    </Field>
                    <Field label="Inscrição estadual">
                      <Input
                        value={form.inscricaoEstadual}
                        onChange={e => onFormChange({ inscricaoEstadual: e.target.value })}
                        placeholder="000.000.000.000"
                        mono
                      />
                    </Field>
                    <Field label="Responsável">
                      <Input
                        value={form.responsavel}
                        onChange={e => onFormChange({ responsavel: e.target.value })}
                        placeholder="Nome do responsável"
                      />
                    </Field>
                  </div>
                )}
              </div>
            </section>

            {/* ── Seção 2: Contato ── */}
            <section>
              <SectionHeader title="Contato" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Telefone / WhatsApp" required error={errors.telefone}>
                    <Input
                      value={formatPhone(form.telefone)}
                      onChange={e => onFormChange({ telefone: e.target.value.replace(/\D/g, '') })}
                      placeholder="(00) 00000-0000"
                      error={!!errors.telefone}
                      type="tel"
                    />
                  </Field>
                  <Field label="Telefone secundário">
                    <Input
                      value={formatPhone(form.telefone2)}
                      onChange={e => onFormChange({ telefone2: e.target.value.replace(/\D/g, '') })}
                      placeholder="(00) 0000-0000"
                      type="tel"
                    />
                  </Field>
                </div>
                <Field label="E-mail">
                  <Input
                    value={form.email}
                    onChange={e => onFormChange({ email: e.target.value })}
                    placeholder="email@exemplo.com"
                    type="email"
                    autoComplete="email"
                  />
                </Field>
              </div>
            </section>

            {/* ── Seção 3: Endereço ── */}
            <section>
              <SectionHeader title="Endereço" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* CEP + Rua */}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12 }}>
                  <Field label="CEP" hint="Preenchimento automático">
                    <div style={{ position: 'relative' }}>
                      <Input
                        value={formatCEP(form.cep)}
                        onChange={e => onFormChange({ cep: e.target.value.replace(/\D/g, '') })}
                        onBlur={() => onCepBlur(form.cep)}
                        placeholder="00000-000"
                        mono
                        style={{ paddingRight: cepLoading ? 32 : 10 }}
                      />
                      {cepLoading && (
                        <div style={{
                          position: 'absolute',
                          right: 9,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 12,
                          height: 12,
                          border: '2px solid #CFCCC6',
                          borderTopColor: '#E31E2D',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite',
                        }} />
                      )}
                    </div>
                  </Field>
                  <Field label="Rua / Avenida">
                    <Input
                      value={form.rua}
                      onChange={e => onFormChange({ rua: e.target.value })}
                      placeholder="Rua, Avenida, etc."
                    />
                  </Field>
                </div>

                {/* Número + Complemento + Bairro */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 12 }}>
                  <Field label="Número">
                    <Input
                      value={form.numero}
                      onChange={e => onFormChange({ numero: e.target.value })}
                      placeholder="Nº"
                    />
                  </Field>
                  <Field label="Complemento">
                    <Input
                      value={form.complemento}
                      onChange={e => onFormChange({ complemento: e.target.value })}
                      placeholder="Apto, sala…"
                    />
                  </Field>
                  <Field label="Bairro">
                    <Input
                      value={form.bairro}
                      onChange={e => onFormChange({ bairro: e.target.value })}
                      placeholder="Bairro"
                    />
                  </Field>
                </div>

                {/* Cidade + Estado */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
                  <Field label="Cidade">
                    <Input
                      value={form.cidade}
                      onChange={e => onFormChange({ cidade: e.target.value })}
                      placeholder="Cidade"
                    />
                  </Field>
                  <Field label="Estado">
                    <Select
                      value={form.estado}
                      onChange={e => onFormChange({ estado: e.target.value })}
                      placeholder="UF"
                    >
                      {ESTADOS_BR.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </div>
            </section>

            {/* ── Seção 4: Veículos ── */}
            <section>
              <SectionHeader title="Veículos" />
              <div>
                {/* Table header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 72px 100px 28px',
                  gap: 6,
                  padding: '6px 0',
                  borderBottom: '2px solid #E3E0D9',
                }}>
                  {['Placa', 'Modelo', 'Ano', 'Quilometragem', ''].map((h, i) => (
                    <span key={i} style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: '#8A8A8A',
                      textTransform: 'uppercase',
                    }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Existing vehicles */}
                {form.veiculos.length === 0 && (
                  <div style={{
                    padding: '16px 0',
                    textAlign: 'center',
                    fontSize: 12,
                    color: '#CFCCC6',
                    fontStyle: 'italic',
                  }}>
                    Nenhum veículo cadastrado
                  </div>
                )}
                {form.veiculos.map(v => (
                  <VehicleRow
                    key={v.id}
                    veiculo={v}
                    onRemove={() =>
                      onFormChange({ veiculos: form.veiculos.filter(x => x.id !== v.id) })
                    }
                    onChange={updated =>
                      onFormChange({ veiculos: form.veiculos.map(x => x.id === v.id ? updated : x) })
                    }
                  />
                ))}

                {/* Add row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 72px 100px 28px',
                  gap: 6,
                  alignItems: 'center',
                  padding: '8px 0 2px',
                  borderTop: form.veiculos.length > 0 ? 'none' : undefined,
                }}>
                  <input
                    value={newVehicle.placa}
                    onChange={e => onNewVehicleChange({ placa: normalizePlate(e.target.value) })}
                    placeholder="Placa"
                    style={{
                      border: '1px dashed #CFCCC6',
                      borderRadius: 5,
                      padding: '5px 8px',
                      fontSize: 11.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: '#1A1A1A',
                      outline: 'none',
                      background: '#FAF9F7',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#E31E2D'
                      e.currentTarget.style.borderStyle = 'solid'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#CFCCC6'
                      e.currentTarget.style.borderStyle = 'dashed'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <input
                    value={newVehicle.modelo}
                    onChange={e => onNewVehicleChange({ modelo: e.target.value })}
                    placeholder="Modelo"
                    style={{
                      border: '1px dashed #CFCCC6',
                      borderRadius: 5,
                      padding: '5px 8px',
                      fontSize: 12,
                      color: '#1A1A1A',
                      outline: 'none',
                      background: '#FAF9F7',
                      fontFamily: 'inherit',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#E31E2D'
                      e.currentTarget.style.borderStyle = 'solid'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#CFCCC6'
                      e.currentTarget.style.borderStyle = 'dashed'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <input
                    value={newVehicle.ano}
                    onChange={e => onNewVehicleChange({ ano: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="Ano"
                    style={{
                      border: '1px dashed #CFCCC6',
                      borderRadius: 5,
                      padding: '5px 8px',
                      fontSize: 12,
                      color: '#1A1A1A',
                      outline: 'none',
                      background: '#FAF9F7',
                      fontFamily: 'inherit',
                      textAlign: 'center',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#E31E2D'
                      e.currentTarget.style.borderStyle = 'solid'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#CFCCC6'
                      e.currentTarget.style.borderStyle = 'dashed'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <div style={{ position: 'relative' }}>
                    <input
                      value={newVehicle.km}
                      onChange={e => onNewVehicleChange({ km: e.target.value.replace(/\D/g, '') })}
                      placeholder="0"
                      style={{
                        width: '100%',
                        border: '1px dashed #CFCCC6',
                        borderRadius: 5,
                        padding: '5px 32px 5px 8px',
                        fontSize: 12,
                        color: '#1A1A1A',
                        outline: 'none',
                        background: '#FAF9F7',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#E31E2D'
                        e.currentTarget.style.borderStyle = 'solid'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = '#CFCCC6'
                        e.currentTarget.style.borderStyle = 'dashed'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 10.5,
                      color: '#8A8A8A',
                      pointerEvents: 'none',
                    }}>km</span>
                  </div>
                  <button
                    type="button"
                    onClick={onAddVehicle}
                    aria-label="Adicionar veículo"
                    title="Adicionar veículo"
                    style={{
                      width: 24,
                      height: 24,
                      display: 'grid',
                      placeItems: 'center',
                      background: '#E31E2D',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="plus" size={13} />
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #E3E0D9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          background: '#FAF9F7',
          gap: 12,
        }}>
          {/* Left side — delete (edit only) or required label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {mode === 'edit' && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  border: '1px solid #CFCCC6',
                  borderRadius: 5,
                  background: 'transparent',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#8A8A8A',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#E31E2D'
                  e.currentTarget.style.color = '#C0192A'
                  e.currentTarget.style.background = 'rgba(227,30,45,0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#CFCCC6'
                  e.currentTarget.style.color = '#8A8A8A'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon name="trash" size={13} />
                Excluir cliente
              </button>
            )}

            {mode === 'edit' && confirmDelete && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                border: '1px solid rgba(227,30,45,0.30)',
                borderRadius: 5,
                background: 'rgba(227,30,45,0.06)',
              }}>
                <Icon name="alert" size={13} style={{ color: '#C0192A', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: '#C0192A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Confirmar exclusão?
                </span>
                <button
                  type="button"
                  onClick={onDelete}
                  style={{
                    padding: '3px 10px',
                    border: 'none',
                    borderRadius: 4,
                    background: '#E31E2D',
                    color: '#fff',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Sim, excluir
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    padding: '3px 8px',
                    border: '1px solid #CFCCC6',
                    borderRadius: 4,
                    background: '#fff',
                    color: '#4A4A4A',
                    fontSize: 11.5,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Não
                </button>
              </div>
            )}

            {mode === 'new' && (
              <span style={{ fontSize: 11, color: '#8A8A8A' }}>
                <span style={{ color: '#E31E2D' }}>*</span> Campos obrigatórios
              </span>
            )}
          </div>

          {/* Right side — Cancel + Save */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={onSave}>
              {mode === 'new' ? 'Salvar cliente' : 'Salvar alterações'}
              <Icon name="chevron" size={13} />
            </Button>
          </div>
        </div>
      </div>

      {/* Spinner keyframe (injected once) */}
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ClientesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'new' | 'edit'>('new')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [cepLoading, setCepLoading] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ placa: '', modelo: '', ano: '', km: '' })

  // ─── Supabase queries ────────────────────────────────────────────────────────

  const { data: clientes = [], isLoading, isError } = useQuery({
    queryKey: ['clientes'],
    queryFn:  clientesService.list,
  })

  const createMutation = useMutation({
    mutationFn: clientesService.create,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['clientes'] }); setDrawerOpen(false) },
  })

  const updateMutation = useMutation({
    mutationFn: clientesService.update,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['clientes'] }); setDrawerOpen(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: clientesService.delete,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['clientes'] }); setDrawerOpen(false) },
  })

  // ─── Search filter ───────────────────────────────────────────────────────────

  const filtered = clientes.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.nome.toLowerCase().includes(q) ||
      c.documento.includes(q.replace(/\D/g, '')) ||
      c.telefone.includes(q) ||
      c.veiculos.some(v =>
        v.placa.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q)
      )
    )
  })

  // ─── Drawer helpers ───────────────────────────────────────────────────────────

  function openNew() {
    setForm(EMPTY_FORM)
    setErrors({})
    setNewVehicle({ placa: '', modelo: '', ano: '', km: '' })
    setDrawerMode('new')
    setEditingId(null)
    setDrawerOpen(true)
  }

  function openEdit(c: Cliente) {
    setForm(clienteToForm(c))
    setErrors({})
    setNewVehicle({ placa: '', modelo: '', ano: '', km: '' })
    setDrawerMode('edit')
    setEditingId(c.id)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  function patchForm(patch: Partial<FormData>) {
    setForm(prev => ({ ...prev, ...patch }))
  }

  // ─── CEP lookup ──────────────────────────────────────────────────────────────

  async function handleCepBlur(rawCep: string) {
    const cleaned = rawCep.replace(/\D/g, '')
    if (cleaned.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
      const data = await res.json()
      if (data.erro) return
      setForm(prev => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }))
    } catch {
      // ignore network errors
    } finally {
      setCepLoading(false)
    }
  }

  // ─── Vehicle add ─────────────────────────────────────────────────────────────

  function addVehicle() {
    if (!newVehicle.placa && !newVehicle.modelo) return
    const v: Veiculo = {
      id: crypto.randomUUID(),
      placa: newVehicle.placa,
      modelo: newVehicle.modelo,
      ano: newVehicle.ano,
      km: newVehicle.km,
    }
    setForm(prev => ({ ...prev, veiculos: [...prev.veiculos, v] }))
    setNewVehicle({ placa: '', modelo: '', ano: '', km: '' })
  }

  // ─── Validate & save ─────────────────────────────────────────────────────────

  function handleDelete() {
    if (editingId) deleteMutation.mutate(editingId)
  }

  function buildPayload(): Omit<Cliente, 'id'> {
    return {
      tipo:              form.tipo,
      nome:              form.nome,
      documento:         form.documento,
      nomeFantasia:      form.nomeFantasia      || undefined,
      inscricaoEstadual: form.inscricaoEstadual || undefined,
      responsavel:       form.responsavel       || undefined,
      telefone:          form.telefone,
      telefone2:         form.telefone2         || undefined,
      email:             form.email             || undefined,
      cep:               form.cep               || undefined,
      rua:               form.rua               || undefined,
      numero:            form.numero            || undefined,
      complemento:       form.complemento       || undefined,
      bairro:            form.bairro            || undefined,
      cidade:            form.cidade            || undefined,
      estado:            form.estado            || undefined,
      veiculos:          form.veiculos,
    }
  }

  function handleSave() {
    const errs: Partial<Record<string, string>> = {}
    if (!form.nome.trim())      errs.nome      = 'Campo obrigatório'
    if (!form.documento.trim()) errs.documento = 'Campo obrigatório'
    if (!form.telefone.trim())  errs.telefone  = 'Campo obrigatório'
    if (Object.keys(errs).length) { setErrors(errs); return }

    if (drawerMode === 'new') {
      createMutation.mutate(buildPayload())
    } else {
      updateMutation.mutate({ id: editingId!, ...buildPayload() })
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Topbar
        section="Cadastros"
        title="Clientes"
        searchPlaceholder="Buscar cliente, CPF, placa…"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {/* Summary bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, color: '#8A8A8A' }}>
            {isLoading ? (
              <span>Carregando…</span>
            ) : isError ? (
              <span style={{ color: '#E31E2D' }}>Erro ao carregar clientes</span>
            ) : (
              <><span style={{ fontWeight: 600, color: '#1A1A1A' }}>{filtered.length}</span>
              {' '}cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</>
            )}
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: '#E31E2D',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Limpar filtro ✕
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: '#fff',
          border: '1px solid #E3E0D9',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {[
                  { label: 'Cliente', style: {} },
                  { label: 'Tipo', style: { width: 72 } },
                  { label: 'Telefone', style: { width: 160 } },
                  { label: 'Veículos', style: { width: 220 } },
                  { label: '', style: { width: 36 } },
                ].map((col, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: '#8A8A8A',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid #E3E0D9',
                      background: '#F4F2ED',
                      ...col.style,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 14px', textAlign: 'center', color: '#8A8A8A', fontSize: 13 }}>
                    Carregando clientes…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: '40px 14px',
                      textAlign: 'center',
                      color: '#CFCCC6',
                      fontSize: 13,
                    }}
                  >
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
              {filtered.map(c => (
                <tr
                  key={c.id}
                  style={{ cursor: 'default' }}
                >
                  {/* Cliente */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={c.nome} size={28} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#1A1A1A' }}>{c.nome}</div>
                        <div style={{
                          fontSize: 10.5,
                          color: '#8A8A8A',
                          fontFamily: "'JetBrains Mono', monospace",
                          marginTop: 1,
                        }}>
                          {formatDoc(c.tipo, c.documento)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                    <TipoBadge tipo={c.tipo} />
                  </td>

                  {/* Telefone */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', color: '#4A4A4A' }}>
                    {formatPhone(c.telefone)}
                  </td>

                  {/* Veículos */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                    {c.veiculos.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 4, alignItems: 'center' }}>
                        {c.veiculos.map(v => (
                          <PlateBadge key={v.id} placa={v.placa} />
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#CFCCC6', fontSize: 11 }}>—</span>
                    )}
                  </td>

                  {/* Arrow */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', color: '#CFCCC6' }}>
                    <Icon name="chevron" size={14} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <ClienteDrawer
        open={drawerOpen}
        mode={drawerMode}
        form={form}
        errors={errors}
        cepLoading={cepLoading}
        newVehicle={newVehicle}
        onFormChange={patchForm}
        onNewVehicleChange={patch => setNewVehicle(prev => ({ ...prev, ...patch }))}
        onAddVehicle={addVehicle}
        onClose={closeDrawer}
        onSave={handleSave}
        onDelete={handleDelete}
        onCepBlur={handleCepBlur}
      />
    </>
  )
}
