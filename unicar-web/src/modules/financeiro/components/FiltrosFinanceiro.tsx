import { ResumoLancamentos } from './ResumoLancamentos'
import type { StatusPagamento, Parcela } from '../types'
import { formatCurrency, STATUS_PAG_STYLE } from '../types'

interface FiltrosFinanceiroProps {
  dataInicio: string
  dataFim: string
  statusFiltros: Set<StatusPagamento>
  parcelas: Parcela[]
  onDataInicioChange: (v: string) => void
  onDataFimChange: (v: string) => void
  onStatusToggle: (s: StatusPagamento) => void
}

const STATUS_OPTIONS: { key: StatusPagamento; label: string }[] = [
  { key: 'pago',     label: 'Recebido' },
  { key: 'pendente', label: 'Pendente' },
  { key: 'atrasado', label: 'Atrasado' },
]

export function FiltrosFinanceiro({
  dataInicio,
  dataFim,
  statusFiltros,
  parcelas,
  onDataInicioChange,
  onDataFimChange,
  onStatusToggle,
}: FiltrosFinanceiroProps) {
  const recebido = parcelas.filter(p => p.statusEfetivo === 'pago').reduce((s, p) => s + p.valor, 0)
  const pendente = parcelas.filter(p => p.statusEfetivo === 'pendente').reduce((s, p) => s + p.valor, 0)
  const atrasado = parcelas.filter(p => p.statusEfetivo === 'atrasado').reduce((s, p) => s + p.valor, 0)
  const total = parcelas.reduce((s, p) => s + p.valor, 0)

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Período */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E3E0D9',
          borderRadius: 6,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#8A8A8A',
          }}
        >
          Período
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#6A6864' }}>Data início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={e => onDataInicioChange(e.target.value)}
            style={dateInputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#6A6864' }}>Data fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={e => onDataFimChange(e.target.value)}
            style={dateInputStyle}
          />
        </div>
      </div>

      {/* Status */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E3E0D9',
          borderRadius: 6,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#8A8A8A',
          }}
        >
          Status
        </span>

        {STATUS_OPTIONS.map(opt => {
          const style = STATUS_PAG_STYLE[opt.key]
          const count = parcelas.filter(p => p.statusEfetivo === opt.key).length
          const sum = parcelas.filter(p => p.statusEfetivo === opt.key).reduce((s, p) => s + p.valor, 0)
          const checked = statusFiltros.has(opt.key)

          return (
            <label
              key={opt.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onStatusToggle(opt.key)}
                style={{ accentColor: style.color, width: 13, height: 13 }}
              />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: style.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, color: '#1A1A1A' }}>{opt.label}</span>
              </span>
              <span style={{ fontSize: 10.5, color: '#8A8A8A' }}>
                {count} · {formatCurrency(sum)}
              </span>
            </label>
          )
        })}
      </div>

      {/* Resumo */}
      <ResumoLancamentos
        recebido={recebido}
        pendente={pendente}
        atrasado={atrasado}
        total={total}
      />
    </div>
  )
}

const dateInputStyle: React.CSSProperties = {
  width: '100%',
  height: 32,
  padding: '0 8px',
  border: '1px solid #CFCCC6',
  borderRadius: 5,
  fontSize: 12,
  color: '#1A1A1A',
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}
