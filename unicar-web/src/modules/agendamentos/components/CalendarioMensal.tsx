import { useState, useRef, useEffect } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { EventoCard } from './EventoCard'
import { FERIADOS } from '../types'
import type { Agendamento } from '../types'

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const MES_NOME = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

interface CalendarioMensalProps {
  ano: number
  mes: number // 1-12
  eventos: Agendamento[]
  onMonthChange: (ano: number, mes: number) => void
  onDayClick: (date: string) => void
  onEventClick: (evento: Agendamento, e: React.MouseEvent) => void
}

interface DayCell {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  feriado?: string
}

function buildCells(ano: number, mes: number): DayCell[] {
  const hoje = new Date().toISOString().slice(0, 10)
  const firstDow = new Date(ano, mes - 1, 1).getDay()
  const diasMes = new Date(ano, mes, 0).getDate()
  const diasMesAnterior = new Date(ano, mes - 1, 0).getDate()

  const cells: DayCell[] = []

  // Prev month fill
  for (let i = firstDow - 1; i >= 0; i--) {
    const day = diasMesAnterior - i
    const m = mes === 1 ? 12 : mes - 1
    const y = mes === 1 ? ano - 1 : ano
    const date = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ date, day, isCurrentMonth: false, isToday: date === hoje, feriado: FERIADOS[date] })
  }

  // Current month
  for (let d = 1; d <= diasMes; d++) {
    const date = `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ date, day: d, isCurrentMonth: true, isToday: date === hoje, feriado: FERIADOS[date] })
  }

  // Next month fill
  let nextDay = 1
  while (cells.length % 7 !== 0) {
    const m = mes === 12 ? 1 : mes + 1
    const y = mes === 12 ? ano + 1 : ano
    const date = `${y}-${String(m).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`
    cells.push({ date, day: nextDay++, isCurrentMonth: false, isToday: date === hoje, feriado: FERIADOS[date] })
  }

  return cells
}

const MAX_VISIBLE = 3

export function CalendarioMensal({ ano, mes, eventos, onMonthChange, onDayClick, onEventClick }: CalendarioMensalProps) {
  const cells = buildCells(ano, mes)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const expandRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (expandRef.current && !expandRef.current.contains(e.target as Node)) setExpandedDay(null)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function prevMonth() {
    if (mes === 1) onMonthChange(ano - 1, 12)
    else onMonthChange(ano, mes - 1)
  }

  function nextMonth() {
    if (mes === 12) onMonthChange(ano + 1, 1)
    else onMonthChange(ano, mes + 1)
  }

  function goToday() {
    const d = new Date()
    onMonthChange(d.getFullYear(), d.getMonth() + 1)
  }

  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Calendar header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={prevMonth} style={navBtn}>
            <Icon name="arrow-left" size={12} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', minWidth: 140, textAlign: 'center' }}>
            {MES_NOME[mes - 1]} {ano}
          </span>
          <button onClick={nextMonth} style={navBtn}>
            <Icon name="chevron" size={12} />
          </button>
          <button onClick={goToday} style={{ ...navBtn, padding: '3px 8px', fontSize: 11, fontWeight: 600, marginLeft: 2 }}>
            Hoje
          </button>
        </div>
      </div>

      {/* Day-of-week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ padding: '3px 0', textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.04em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateRows: `repeat(${rows.length}, minmax(90px, auto))` }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: ri < rows.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
            {row.map(cell => {
              const dayEvents = eventos.filter(e => e.data === cell.date)
              const visible = dayEvents.slice(0, MAX_VISIBLE)
              const overflow = dayEvents.length - MAX_VISIBLE
              const isExpanded = expandedDay === cell.date

              return (
                <div
                  key={cell.date}
                  onClick={() => onDayClick(cell.date)}
                  style={{
                    borderRight: '1px solid #e5e7eb',
                    padding: '2px 3px 3px',
                    cursor: 'pointer',
                    background: 'transparent',
                    position: 'relative',
                    transition: 'background 0.1s',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Day number */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 1, paddingRight: 1 }}>
                    <span
                      style={{
                        width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', fontSize: 10, fontWeight: cell.isToday ? 700 : 400,
                        background: cell.isToday ? '#dc2626' : 'transparent',
                        color: cell.isToday ? '#fff' : cell.isCurrentMonth ? '#1A1A1A' : '#d1d5db',
                        flexShrink: 0,
                      }}
                    >
                      {cell.day}
                    </span>
                  </div>

                  {/* Feriado */}
                  {cell.feriado && (
                    <div style={{
                      padding: '0px 4px', marginBottom: 1, borderRadius: 3,
                      fontSize: 8.5, background: '#f3f4f6', color: '#6b7280',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {cell.feriado}
                    </div>
                  )}

                  {/* Events */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }} onClick={e => e.stopPropagation()}>
                    {visible.map(ev => (
                      <EventoCard key={ev.id} evento={ev} onClick={e => { e.stopPropagation(); onEventClick(ev, e) }} />
                    ))}
                    {overflow > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); setExpandedDay(prev => prev === cell.date ? null : cell.date) }}
                        style={{
                          fontSize: 10, color: '#6b7280', background: 'none', border: 'none',
                          cursor: 'pointer', padding: '1px 4px', textAlign: 'left', fontFamily: 'inherit',
                        }}
                      >
                        +{overflow} mais
                      </button>
                    )}
                  </div>

                  {/* Expanded popover */}
                  {isExpanded && (
                    <div
                      ref={expandRef}
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute', top: '100%', left: 0, zIndex: 200,
                        background: '#fff', border: '1px solid #E3E0D9', borderRadius: 6,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 8,
                        minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4,
                      }}
                    >
                      {dayEvents.map(ev => (
                        <EventoCard key={ev.id} evento={ev} onClick={e => { setExpandedDay(null); onEventClick(ev, e) }} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background: 'none', border: '1px solid #E3E0D9', borderRadius: 5, cursor: 'pointer',
  padding: '4px 8px', color: '#6A6864', display: 'grid', placeItems: 'center',
  fontFamily: 'inherit',
}
