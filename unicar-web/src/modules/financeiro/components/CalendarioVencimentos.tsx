import type { Parcela, StatusPagamento } from '../types'

interface CalendarioVencimentosProps {
  ano: number
  mes: number // 1-12
  parcelas: Parcela[]
  diaSelecionado: string | null
  onDiaClick: (dia: string | null) => void
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

export function CalendarioVencimentos({
  ano,
  mes,
  parcelas,
  diaSelecionado,
  onDiaClick,
}: CalendarioVencimentosProps) {
  const diasNoMes = new Date(ano, mes, 0).getDate()
  const primeiroDia = new Date(ano, mes - 1, 1).getDay() // 0=Dom
  const hoje = new Date().toISOString().slice(0, 10)

  const cells: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

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
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
          {MES_NOME[mes - 1]} {ano}
        </span>
        {diaSelecionado && (
          <button
            onClick={() => onDiaClick(null)}
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
        )}
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
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

          const dayStr = `${ano}-${String(mes).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const status = getDayStatus(dayStr, parcelas)
          const isSelected = diaSelecionado === dayStr
          const isToday = dayStr === hoje

          return (
            <button
              key={dayStr}
              onClick={() => onDiaClick(isSelected ? null : dayStr)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '4px 2px',
                borderRadius: 5,
                border: isSelected ? '1.5px solid #E31E2D' : '1px solid transparent',
                background: isSelected ? 'rgba(227,30,45,0.06)' : 'transparent',
                cursor: status ? 'pointer' : 'default',
                fontFamily: 'inherit',
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? '#E31E2D' : '#1A1A1A',
                }}
              >
                {day}
              </span>
              {status && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: DOT_COLOR[status],
                    flexShrink: 0,
                  }}
                />
              )}
              {!status && <span style={{ width: 5, height: 5 }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
