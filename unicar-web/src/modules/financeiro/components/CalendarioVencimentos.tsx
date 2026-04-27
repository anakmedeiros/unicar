import { Icon } from '../../../components/ui/Icon'
import type { Parcela, StatusPagamento } from '../types'

interface CalendarioVencimentosProps {
  calAno: number
  calMes: number
  parcelas: Parcela[]
  rangeStart: string | null
  rangeEnd: string | null
  onRangeChange: (start: string | null, end: string | null) => void
  onMonthChange: (ano: number, mes: number) => void
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MES_NOME = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const DOT_COLOR: Record<StatusPagamento, string> = {
  pago:     '#16a34a',
  pendente: '#CA8A04',
  atrasado: '#dc2626',
}

function getDayStatus(dayStr: string, parcelas: Parcela[]): StatusPagamento | null {
  const day = parcelas.filter(p => p.data_vencimento === dayStr)
  if (day.length === 0) return null
  if (day.some(p => p.statusEfetivo === 'atrasado')) return 'atrasado'
  if (day.some(p => p.statusEfetivo === 'pendente')) return 'pendente'
  return 'pago'
}

function fmtDay(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function CalendarioVencimentos({
  calAno, calMes, parcelas, rangeStart, rangeEnd, onRangeChange, onMonthChange,
}: CalendarioVencimentosProps) {
  const diasNoMes = new Date(calAno, calMes, 0).getDate()
  const primeiroDia = new Date(calAno, calMes - 1, 1).getDay()
  const hoje = new Date().toISOString().slice(0, 10)

  const cells: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function handleDayClick(dayStr: string) {
    if (!rangeStart) {
      onRangeChange(dayStr, null)
    } else if (!rangeEnd) {
      if (dayStr === rangeStart) {
        onRangeChange(null, null)
      } else if (dayStr < rangeStart) {
        onRangeChange(dayStr, rangeStart)
      } else {
        onRangeChange(rangeStart, dayStr)
      }
    } else {
      onRangeChange(dayStr, null)
    }
  }

  function prevMonth() {
    if (calMes === 1) onMonthChange(calAno - 1, 12)
    else onMonthChange(calAno, calMes - 1)
  }

  function nextMonth() {
    if (calMes === 12) onMonthChange(calAno + 1, 1)
    else onMonthChange(calAno, calMes + 1)
  }

  const periodLabel = rangeStart && rangeEnd
    ? `${fmtDay(rangeStart)} a ${fmtDay(rangeEnd)}`
    : rangeStart
    ? fmtDay(rangeStart)
    : null

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E3E0D9',
        borderRadius: 6,
        padding: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <button onClick={prevMonth} style={navBtnStyle} title="Mês anterior">
          <Icon name="arrow-left" size={12} />
        </button>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
          {MES_NOME[calMes - 1]} {calAno}
        </span>
        <button onClick={nextMonth} style={navBtnStyle} title="Próximo mês">
          <Icon name="chevron" size={12} />
        </button>
      </div>

      {/* Weekday headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
          marginBottom: 4,
        }}
      >
        {DIAS_SEMANA.map(d => (
          <div
            key={d}
            style={{
              fontSize: 9.5,
              fontWeight: 600,
              color: '#8A8A8A',
              textAlign: 'center',
              padding: '2px 0',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />

          const dayStr = `${calAno}-${String(calMes).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const status = getDayStatus(dayStr, parcelas)
          const isStart = rangeStart === dayStr
          const isEnd = rangeEnd === dayStr
          const isEdge = isStart || isEnd
          const isInRange = !!(rangeStart && rangeEnd && dayStr > rangeStart && dayStr < rangeEnd)
          const isToday = dayStr === hoje

          return (
            <button
              key={dayStr}
              onClick={() => handleDayClick(dayStr)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '4px 2px',
                borderRadius: 5,
                gap: 2,
                border: isEdge ? '1.5px solid #E31E2D' : '1px solid transparent',
                background: isEdge
                  ? 'rgba(227,30,45,0.10)'
                  : isInRange
                  ? 'rgba(227,30,45,0.04)'
                  : 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isToday ? 700 : 400,
                  color: isEdge ? '#E31E2D' : isToday ? '#E31E2D' : '#1A1A1A',
                }}
              >
                {day}
              </span>
              {status
                ? <span style={{ width: 5, height: 5, borderRadius: '50%', background: DOT_COLOR[status], flexShrink: 0 }} />
                : <span style={{ width: 5, height: 5 }} />
              }
            </button>
          )
        })}
      </div>

      {/* Period label + clear */}
      {periodLabel && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1px solid #F0EDE8',
          }}
        >
          <span style={{ fontSize: 11, color: '#4A4A4A', fontWeight: 500 }}>
            {periodLabel}
          </span>
          <button
            onClick={() => onRangeChange(null, null)}
            style={{
              fontSize: 11,
              color: '#E31E2D',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 4,
              fontFamily: 'inherit',
            }}
          >
            Limpar filtro
          </button>
        </div>
      )}
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#6A6864',
  padding: '2px 6px',
  borderRadius: 4,
  display: 'grid',
  placeItems: 'center',
}
