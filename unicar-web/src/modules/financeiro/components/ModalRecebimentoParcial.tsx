import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { formatCurrency, FORMA_LABEL } from '../types'
import type { Parcela, RecebimentoParcialParams } from '../types'

interface ModalRecebimentoParcialProps {
  parcela: Parcela | null
  open: boolean
  onClose: () => void
  onConfirm: (params: RecebimentoParcialParams) => void
  isSaving: boolean
}

const FORMAS = Object.entries(FORMA_LABEL).map(([value, label]) => ({ value, label }))

export function ModalRecebimentoParcial({
  parcela,
  open,
  onClose,
  onConfirm,
  isSaving,
}: ModalRecebimentoParcialProps) {
  const [valorRecebidoStr, setValorRecebidoStr] = useState('')
  const [novoVencimento, setNovoVencimento] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open && parcela) {
      setValorRecebidoStr('')
      setNovoVencimento('')
      setFormaPagamento('')
      setErrors({})
    }
  }, [open, parcela])

  if (!open || !parcela) return null

  const valorTotal = parcela.valor
  const valorRecebido = parseFloat(valorRecebidoStr.replace(',', '.')) || 0
  const valorEmAberto = Math.max(0, valorTotal - valorRecebido)

  function handleConfirm() {
    const errs: Record<string, string> = {}
    if (!valorRecebido || valorRecebido <= 0) errs.valor = 'Informe o valor recebido'
    else if (valorRecebido >= valorTotal) errs.valor = 'Use "Marcar como recebido" para valores totais'
    if (!novoVencimento) errs.vencimento = 'Informe o novo vencimento'
    if (!formaPagamento) errs.forma = 'Selecione a forma de pagamento'

    if (Object.keys(errs).length) { setErrors(errs); return }
    if (!parcela) return

    onConfirm({
      parcelaId: parcela.id,
      osId: parcela.os_id,
      pagamentoId: parcela.pagamento_id,
      valorRecebido,
      valorEmAberto,
      novoVencimento,
      formaPagamento,
      parcelaNumero: parcela.numero,
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          width: 420,
          maxWidth: '100%',
          boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #EBE8E2',
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
              Recebimento parcial
            </div>
            <div style={{ fontSize: 11, color: '#8A8A8A', marginTop: 2 }}>
              OS {parcela.os_numero} · {parcela.cliente_nome}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#8A8A8A',
              padding: 4,
              borderRadius: 4,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Valor total (readonly) */}
          <Field label="Valor total da parcela">
            <div
              style={{
                height: 34,
                padding: '0 10px',
                background: '#FAF9F7',
                border: '1px solid #E3E0D9',
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: '#1A1A1A',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(valorTotal)}
            </div>
          </Field>

          {/* Valor recebido */}
          <Field label="Valor recebido" error={errors.valor}>
            <input
              type="number"
              min="0"
              step="0.01"
              max={valorTotal - 0.01}
              value={valorRecebidoStr}
              onChange={e => { setValorRecebidoStr(e.target.value); setErrors(prev => ({ ...prev, valor: '' })) }}
              placeholder="0,00"
              style={{
                ...inputStyle,
                borderColor: errors.valor ? '#E31E2D' : '#CFCCC6',
              }}
            />
          </Field>

          {/* Valor em aberto (readonly) */}
          <Field label="Valor em aberto">
            <div
              style={{
                height: 34,
                padding: '0 10px',
                background: '#FAF9F7',
                border: '1px solid #E3E0D9',
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: valorEmAberto > 0 ? '#B91C1C' : '#8A8A8A',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(valorEmAberto)}
            </div>
          </Field>

          {/* Novo vencimento */}
          <Field label="Novo vencimento" error={errors.vencimento}>
            <input
              type="date"
              value={novoVencimento}
              onChange={e => { setNovoVencimento(e.target.value); setErrors(prev => ({ ...prev, vencimento: '' })) }}
              style={{
                ...inputStyle,
                borderColor: errors.vencimento ? '#E31E2D' : '#CFCCC6',
              }}
            />
          </Field>

          {/* Forma de pagamento */}
          <Field label="Forma de pagamento" error={errors.forma}>
            <select
              value={formaPagamento}
              onChange={e => { setFormaPagamento(e.target.value); setErrors(prev => ({ ...prev, forma: '' })) }}
              style={{
                ...inputStyle,
                borderColor: errors.forma ? '#E31E2D' : '#CFCCC6',
              }}
            >
              <option value="">Selecione...</option>
              {FORMAS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '12px 20px',
            borderTop: '1px solid #EBE8E2',
          }}
        >
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Confirmar recebimento parcial'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 10.5, color: '#E31E2D' }}>{error}</span>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  height: 34,
  padding: '0 10px',
  border: '1px solid #CFCCC6',
  borderRadius: 5,
  fontSize: 12.5,
  color: '#1A1A1A',
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
}
