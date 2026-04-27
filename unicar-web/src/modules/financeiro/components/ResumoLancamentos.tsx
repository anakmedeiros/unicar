import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { formatCurrency } from '../types'

interface ResumoLancamentosProps {
  recebido: number
  pendente: number
  atrasado: number
  total: number
}

export function ResumoLancamentos({ recebido, pendente, atrasado, total }: ResumoLancamentosProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        border: '1px solid #E3E0D9',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '9px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 11.5,
          fontWeight: 600,
          color: '#1A1A1A',
          fontFamily: 'inherit',
        }}
      >
        <span>Resumo dos Lançamentos</span>
        <Icon name={open ? 'chevron-down' : 'chevron'} size={12} style={{ color: '#8A8A8A' }} />
      </button>

      {open && (
        <div style={{ padding: '4px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row label="Total recebido" value={recebido} color="#15803D" />
          <Row label="Total pendente" value={pendente} color="#854D0E" />
          <Row label="Total atrasado" value={atrasado} color="#B91C1C" />
          <div style={{ height: 1, background: '#EBE8E2', margin: '2px 0' }} />
          <Row label="Total geral" value={total} color="#1A1A1A" bold />
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string
  value: number
  color: string
  bold?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 11.5,
      }}
    >
      <span style={{ color: '#4A4A4A' }}>{label}</span>
      <span style={{ color, fontWeight: bold ? 700 : 600, fontVariantNumeric: 'tabular-nums' }}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}
