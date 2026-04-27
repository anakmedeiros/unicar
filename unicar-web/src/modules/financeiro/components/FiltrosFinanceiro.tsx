import { useMemo } from 'react'
import { ResumoLancamentos } from './ResumoLancamentos'
import { CalendarioVencimentos } from './CalendarioVencimentos'
import type { StatusPagamento, Parcela } from '../types'
import { formatCurrency, STATUS_PAG_STYLE } from '../types'

interface FiltrosFinanceiroProps {
  allParcelas: Parcela[]
  rangeStart: string | null
  rangeEnd: string | null
  calAno: number
  calMes: number
  statusFiltros: Set<StatusPagamento>
  onRangeChange: (start: string | null, end: string | null) => void
  onMonthChange: (ano: number, mes: number) => void
  onStatusToggle: (s: StatusPagamento) => void
}

const STATUS_OPTIONS: { key: StatusPagamento; label: string }[] = [
  { key: 'pago',     label: 'Recebido' },
  { key: 'pendente', label: 'Pendente' },
  { key: 'atrasado', label: 'Atrasado' },
]

export function FiltrosFinanceiro({
  allParcelas,
  rangeStart,
  rangeEnd,
  calAno,
  calMes,
  statusFiltros,
  onRangeChange,
  onMonthChange,
  onStatusToggle,
}: FiltrosFinanceiroProps) {
  // Parcelas visible in the calendar month (for dots)
  const calMonthParcelas = useMemo(() => {
    const monthStr = `${calAno}-${String(calMes).padStart(2, '0')}`
    return allParcelas.filter(p => p.data_vencimento.startsWith(monthStr))
  }, [allParcelas, calAno, calMes])

  // Parcelas within the selected range (for status counts and resumo)
  const periodParcelas = useMemo(() => {
    if (rangeStart && rangeEnd)
      return allParcelas.filter(p => p.data_vencimento >= rangeStart && p.data_vencimento <= rangeEnd)
    if (rangeStart)
      return allParcelas.filter(p => p.data_vencimento === rangeStart)
    const monthStr = `${calAno}-${String(calMes).padStart(2, '0')}`
    return allParcelas.filter(p => p.data_vencimento.startsWith(monthStr))
  }, [allParcelas, rangeStart, rangeEnd, calAno, calMes])

  const recebido = periodParcelas.filter(p => p.statusEfetivo === 'pago').reduce((s, p) => s + p.valor, 0)
  const pendente = periodParcelas.filter(p => p.statusEfetivo === 'pendente').reduce((s, p) => s + p.valor, 0)
  const atrasado = periodParcelas.filter(p => p.statusEfetivo === 'atrasado').reduce((s, p) => s + p.valor, 0)
  const total = periodParcelas.reduce((s, p) => s + p.valor, 0)

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
      {/* Calendar */}
      <CalendarioVencimentos
        calAno={calAno}
        calMes={calMes}
        parcelas={calMonthParcelas}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onRangeChange={onRangeChange}
        onMonthChange={onMonthChange}
      />

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
          const count = periodParcelas.filter(p => p.statusEfetivo === opt.key).length
          const sum = periodParcelas.filter(p => p.statusEfetivo === opt.key).reduce((s, p) => s + p.valor, 0)
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
