import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { useQuery } from '@tanstack/react-query'
import { clientesService } from '../../../services/clientes'
import { ordensServicoService } from '../../../services/ordens-servico'
import { CORES, EMPTY_FORM } from '../types'
import type { AgendamentoForm, Agendamento } from '../types'

interface Props {
  open: boolean
  dataPrefill?: string
  editing?: Agendamento | null
  onClose: () => void
  onConfirm: (form: AgendamentoForm) => void
  isSaving: boolean
}

export function ModalNovoAgendamento({ open, dataPrefill, editing, onClose, onConfirm, isSaving }: Props) {
  const [form, setForm] = useState<AgendamentoForm>({ ...EMPTY_FORM, tipo: 'agendamento' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        tipo: editing.tipo,
        titulo: editing.titulo,
        descricao: editing.descricao ?? '',
        data: editing.data,
        hora_inicio: editing.hora_inicio ?? '',
        hora_fim: editing.hora_fim ?? '',
        dia_inteiro: editing.dia_inteiro,
        cliente_id: editing.cliente_id ?? '',
        os_id: editing.os_id ?? '',
        tecnico_id: editing.tecnico_id ?? '',
        cor: editing.cor,
      })
    } else {
      setForm({ ...EMPTY_FORM, tipo: 'agendamento', data: dataPrefill ?? '', cor: '#dc2626' })
    }
    setErrors({})
  }, [open, dataPrefill, editing])

  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: clientesService.list })
  const { data: tecnicos = [] } = useQuery({ queryKey: ['tecnicos'], queryFn: ordensServicoService.listTecnicos })


  function patch(p: Partial<AgendamentoForm>) { setForm(prev => ({ ...prev, ...p })) }

  function handleConfirm() {
    const errs: Record<string, string> = {}
    if (!form.titulo.trim()) errs.titulo = 'Informe o título'
    if (!form.data) errs.data = 'Informe a data'
    if (!form.hora_inicio) errs.hora_inicio = 'Informe o horário de início'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onConfirm(form)
  }

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 8, width: 480, maxWidth: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #EBE8E2' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
            {editing ? 'Editar agendamento' : 'Novo agendamento'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A8A', padding: 4, borderRadius: 4, display: 'grid', placeItems: 'center' }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          <FField label="Título *" error={errors.titulo}>
            <input value={form.titulo} onChange={e => patch({ titulo: e.target.value })} placeholder="Ex: Revisão preventiva" style={{ ...inputSt, borderColor: errors.titulo ? '#E31E2D' : '#CFCCC6' }} />
          </FField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FField label="Data *" error={errors.data}>
              <input type="date" value={form.data} onChange={e => patch({ data: e.target.value })} style={{ ...inputSt, borderColor: errors.data ? '#E31E2D' : '#CFCCC6' }} />
            </FField>
            <FField label="Hora início *" error={errors.hora_inicio}>
              <input type="time" value={form.hora_inicio} onChange={e => patch({ hora_inicio: e.target.value })} style={{ ...inputSt, borderColor: errors.hora_inicio ? '#E31E2D' : '#CFCCC6' }} />
            </FField>
          </div>

          <FField label="Hora fim">
            <input type="time" value={form.hora_fim} onChange={e => patch({ hora_fim: e.target.value })} style={inputSt} />
          </FField>

          <FField label="Cliente">
            <select value={form.cliente_id} onChange={e => patch({ cliente_id: e.target.value, os_id: '' })} style={inputSt}>
              <option value="">Selecione...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </FField>

          <FField label="Técnico">
            <select value={form.tecnico_id} onChange={e => patch({ tecnico_id: e.target.value })} style={inputSt}>
              <option value="">Selecione...</option>
              {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </FField>

          <FField label="Descrição">
            <textarea value={form.descricao} onChange={e => patch({ descricao: e.target.value })} rows={3} placeholder="Observações..." style={{ ...inputSt, height: 'auto', resize: 'vertical', padding: '6px 10px' }} />
          </FField>

          <FField label="Cor">
            <div style={{ display: 'flex', gap: 8 }}>
              {CORES.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => patch({ cor: c.value })}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', background: c.value, border: form.cor === c.value ? `3px solid ${c.value}` : '2px solid transparent',
                    outline: form.cor === c.value ? `2px solid ${c.value}` : 'none', outlineOffset: 2, cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </FField>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid #EBE8E2' }}>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? 'Salvando...' : editing ? 'Salvar' : 'Criar agendamento'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 10.5, color: '#E31E2D' }}>{error}</span>}
    </div>
  )
}

const inputSt: React.CSSProperties = {
  height: 34, padding: '0 10px', border: '1px solid #CFCCC6', borderRadius: 5,
  fontSize: 12.5, color: '#1A1A1A', background: '#fff', outline: 'none',
  fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}

