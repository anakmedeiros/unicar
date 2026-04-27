import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
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

export function ModalNovoLembrete({ open, dataPrefill, editing, onClose, onConfirm, isSaving }: Props) {
  const [form, setForm] = useState<AgendamentoForm>({ ...EMPTY_FORM, tipo: 'lembrete', dia_inteiro: true })
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
        hora_fim: '',
        dia_inteiro: editing.dia_inteiro,
        cliente_id: '',
        os_id: '',
        tecnico_id: '',
        cor: editing.cor,
      })
    } else {
      setForm({ ...EMPTY_FORM, tipo: 'lembrete', dia_inteiro: true, data: dataPrefill ?? '', cor: '#eab308' })
    }
    setErrors({})
  }, [open, dataPrefill, editing])

  function patch(p: Partial<AgendamentoForm>) { setForm(prev => ({ ...prev, ...p })) }

  function handleConfirm() {
    const errs: Record<string, string> = {}
    if (!form.titulo.trim()) errs.titulo = 'Informe o título'
    if (!form.data) errs.data = 'Informe a data'
    if (!form.dia_inteiro && !form.hora_inicio) errs.hora_inicio = 'Informe o horário'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onConfirm(form)
  }

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 8, width: 420, maxWidth: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #EBE8E2' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
            {editing ? 'Editar lembrete' : 'Novo lembrete'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A8A', padding: 4, borderRadius: 4, display: 'grid', placeItems: 'center' }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FField label="Título *" error={errors.titulo}>
            <input value={form.titulo} onChange={e => patch({ titulo: e.target.value })} placeholder="Ex: Ligar para cliente" style={{ ...inputSt, borderColor: errors.titulo ? '#E31E2D' : '#CFCCC6' }} />
          </FField>

          <FField label="Data *" error={errors.data}>
            <input type="date" value={form.data} onChange={e => patch({ data: e.target.value })} style={{ ...inputSt, borderColor: errors.data ? '#E31E2D' : '#CFCCC6' }} />
          </FField>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: '#1A1A1A' }}>
            <input
              type="checkbox"
              checked={form.dia_inteiro}
              onChange={e => patch({ dia_inteiro: e.target.checked, hora_inicio: '' })}
              style={{ width: 14, height: 14, accentColor: '#E31E2D' }}
            />
            Dia inteiro
          </label>

          {!form.dia_inteiro && (
            <FField label="Hora" error={errors.hora_inicio}>
              <input type="time" value={form.hora_inicio} onChange={e => patch({ hora_inicio: e.target.value })} style={{ ...inputSt, borderColor: errors.hora_inicio ? '#E31E2D' : '#CFCCC6' }} />
            </FField>
          )}

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
                    width: 26, height: 26, borderRadius: '50%', background: c.value,
                    border: form.cor === c.value ? `3px solid ${c.value}` : '2px solid transparent',
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
            {isSaving ? 'Salvando...' : editing ? 'Salvar' : 'Criar lembrete'}
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
