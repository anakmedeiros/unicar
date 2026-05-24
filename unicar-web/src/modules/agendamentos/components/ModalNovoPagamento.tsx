import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import type { AgendamentoForm, Agendamento } from '../types'

interface Props {
  open: boolean
  dataPrefill?: string
  editing?: Agendamento | null
  onClose: () => void
  onConfirm: (form: AgendamentoForm) => void
  isSaving: boolean
}

export function ModalNovoPagamento({ open, dataPrefill, editing, onClose, onConfirm, isSaving }: Props) {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    if (editing && editing.tipo === 'pagamento') {
      setDescricao(editing.titulo)
      setValor(editing.valor != null ? String(editing.valor).replace('.', ',') : '')
      setData(editing.data)
    } else {
      setDescricao('')
      setValor('')
      setData(dataPrefill ?? '')
    }
    setErrors({})
  }, [open, dataPrefill, editing])

  function handleConfirm() {
    const errs: Record<string, string> = {}
    if (!descricao.trim()) errs.descricao = 'Informe a descrição'
    if (!valor || isNaN(parseFloat(valor.replace(',', '.')))) errs.valor = 'Informe um valor válido'
    if (!data) errs.data = 'Informe a data'
    if (Object.keys(errs).length) { setErrors(errs); return }

    onConfirm({
      tipo: 'pagamento',
      titulo: descricao.trim(),
      descricao: '',
      data,
      hora_inicio: '',
      hora_fim: '',
      dia_inteiro: true,
      cliente_id: '',
      os_id: '',
      tecnico_id: '',
      cor: '#c2410c',
      valor: parseFloat(valor.replace(',', '.')).toFixed(2),
    })
  }

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 8, width: 420, maxWidth: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #EBE8E2' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
            {editing ? 'Editar pagamento' : 'Novo pagamento'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A8A', padding: 4, borderRadius: 4, display: 'grid', placeItems: 'center' }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FField label="Descrição *" error={errors.descricao}>
            <input
              value={descricao}
              onChange={e => { setDescricao(e.target.value); setErrors(p => ({ ...p, descricao: '' })) }}
              placeholder="Ex: ALUGUEL, FORNECEDOR..."
              style={{ ...inputSt, borderColor: errors.descricao ? '#E31E2D' : '#CFCCC6' }}
              autoFocus
            />
          </FField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FField label="Valor (R$) *" error={errors.valor}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={e => { setValor(e.target.value); setErrors(p => ({ ...p, valor: '' })) }}
                placeholder="0,00"
                style={{ ...inputSt, borderColor: errors.valor ? '#E31E2D' : '#CFCCC6' }}
              />
            </FField>

            <FField label="Data *" error={errors.data}>
              <input
                type="date"
                value={data}
                onChange={e => { setData(e.target.value); setErrors(p => ({ ...p, data: '' })) }}
                style={{ ...inputSt, borderColor: errors.data ? '#E31E2D' : '#CFCCC6' }}
              />
            </FField>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid #EBE8E2' }}>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? 'Salvando...' : editing ? 'Salvar' : 'Criar pagamento'}
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
