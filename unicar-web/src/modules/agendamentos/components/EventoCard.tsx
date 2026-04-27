import type { Agendamento } from '../types'

interface EventoCardProps {
  evento: Agendamento
  onClick: (e: React.MouseEvent) => void
}

export function EventoCard({ evento, onClick }: EventoCardProps) {
  const isLembrete = evento.tipo === 'lembrete'

  return (
    <div
      onClick={onClick}
      title={evento.titulo}
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
        background: isLembrete ? '#fefce8' : `${evento.cor}18`,
        borderLeft: `2.5px solid ${isLembrete ? '#eab308' : evento.cor}`,
        color: isLembrete ? '#854d0e' : evento.cor,
      }}
    >
      {!evento.dia_inteiro && evento.hora_inicio && (
        <span style={{ flexShrink: 0, fontSize: 8.5, opacity: 0.8 }}>
          {evento.hora_inicio.slice(0, 5)}
        </span>
      )}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{evento.titulo}</span>
    </div>
  )
}
