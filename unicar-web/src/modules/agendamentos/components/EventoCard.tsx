import type { Agendamento } from '../types'

interface EventoCardProps {
  evento: Agendamento
  onClick: (e: React.MouseEvent) => void
}

export function EventoCard({ evento, onClick }: EventoCardProps) {
  const isLembrete = evento.tipo === 'lembrete'
  const isPagamento = evento.tipo === 'pagamento'

  const bg    = isPagamento ? 'rgba(194,65,12,0.10)' : isLembrete ? '#fefce8' : `${evento.cor}18`
  const border = isPagamento ? '#c2410c' : isLembrete ? '#eab308' : evento.cor
  const color  = isPagamento ? '#9a3412' : isLembrete ? '#854d0e' : evento.cor

  const label = isPagamento && evento.valor != null
    ? `${evento.titulo} · R$ ${evento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : evento.titulo

  return (
    <div
      onClick={onClick}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '1px 5px',
        borderRadius: 3,
        fontSize: 9.5,
        fontWeight: 500,
        cursor: 'pointer',
        lineHeight: 1.4,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        background: bg,
        borderLeft: `2.5px solid ${border}`,
        color,
      }}
    >
      {isPagamento && <span style={{ flexShrink: 0, fontSize: 8, opacity: 0.9 }}>💸</span>}
      {!isPagamento && !evento.dia_inteiro && evento.hora_inicio && (
        <span style={{ flexShrink: 0, fontSize: 8.5, opacity: 0.8 }}>
          {evento.hora_inicio.slice(0, 5)}
        </span>
      )}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>
  )
}
