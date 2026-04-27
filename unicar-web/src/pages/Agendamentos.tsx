import { useState, useRef, useEffect } from 'react'
import { Topbar } from '../components/layout/Topbar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ToastNotification } from '../shared/components/Toast'
import type { ToastItem } from '../shared/components/Toast'
import { CalendarioMensal } from '../modules/agendamentos/components/CalendarioMensal'
import { ModalNovoAgendamento } from '../modules/agendamentos/components/ModalNovoAgendamento'
import { ModalNovoLembrete } from '../modules/agendamentos/components/ModalNovoLembrete'
import {
  useAgendamentos,
  useCreateAgendamento,
  useUpdateAgendamento,
  useDeleteAgendamento,
} from '../modules/agendamentos/hooks/useAgendamentos'
import type { Agendamento } from '../modules/agendamentos/types'

type ModalTipo = 'agendamento' | 'lembrete' | null

function formatEventDate(data: string, horaInicio: string | null, horaFim: string | null, diaInteiro: boolean): string {
  const [y, m, d] = data.split('-')
  const dateStr = `${d}/${m}/${y}`
  if (diaInteiro) return dateStr
  if (!horaInicio) return dateStr
  const start = horaInicio.slice(0, 5)
  const end = horaFim ? ` — ${horaFim.slice(0, 5)}` : ''
  return `${dateStr} · ${start}${end}`
}

export function AgendamentosPage() {
  const [calAno, setCalAno] = useState(() => new Date().getFullYear())
  const [calMes, setCalMes] = useState(() => new Date().getMonth() + 1)

  const [modalTipo, setModalTipo] = useState<ModalTipo>(null)
  const [dataPrefill, setDatePrefill] = useState('')
  const [editingEvento, setEditingEvento] = useState<Agendamento | null>(null)

  // Choice popup when clicking an empty day
  const [choiceDay, setChoiceDay] = useState<string | null>(null)
  const choiceRef = useRef<HTMLDivElement>(null)
  const [choicePos, setChoicePos] = useState<{ top: number; left: number } | null>(null)

  // Event detail popover
  const [detailEvento, setDetailEvento] = useState<Agendamento | null>(null)
  const [detailPos, setDetailPos] = useState<{ top: number; left: number } | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const [toasts, setToasts] = useState<ToastItem[]>([])

  function showToast(message: string, variant: 'success' | 'error' = 'success') {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant, exiting: false }])
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t)), 3600)
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  const { data: eventos = [] } = useAgendamentos(calAno, calMes)
  const createMutation = useCreateAgendamento()
  const updateMutation = useUpdateAgendamento()
  const deleteMutation = useDeleteAgendamento()

  // Close choice popup on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (choiceRef.current && !choiceRef.current.contains(e.target as Node)) {
        setChoiceDay(null); setChoicePos(null)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Close detail popover on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (detailRef.current && !detailRef.current.contains(e.target as Node)) {
        setDetailEvento(null); setDetailPos(null); setDeleteConfirm(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleDayClick(date: string) {
    // If clicking a day, open choice popup near cursor — use centered fallback
    setDatePrefill(date)
    setChoiceDay(date)
    setChoicePos({ top: window.innerHeight / 2 - 60, left: window.innerWidth / 2 - 100 })
  }

  function handleEventClick(evento: Agendamento, e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const left = Math.min(rect.left, window.innerWidth - 280)
    const top = rect.bottom + 6
    setDetailEvento(evento)
    setDetailPos({ top, left })
    setDeleteConfirm(false)
  }

  function openModal(tipo: ModalTipo) {
    setChoiceDay(null); setChoicePos(null)
    setEditingEvento(null)
    setModalTipo(tipo)
  }

  async function handleCreate(form: Parameters<typeof createMutation.mutateAsync>[0]) {
    try {
      await createMutation.mutateAsync(form)
      setModalTipo(null)
      showToast(form.tipo === 'lembrete' ? 'Lembrete criado' : 'Agendamento criado')
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Erro desconhecido'
      showToast(`Erro ao criar evento: ${msg}`, 'error')
    }
  }

  async function handleUpdate(form: Parameters<typeof createMutation.mutateAsync>[0]) {
    if (!editingEvento) return
    try {
      await updateMutation.mutateAsync({ id: editingEvento.id, form })
      setModalTipo(null)
      setEditingEvento(null)
      showToast('Evento atualizado')
    } catch {
      showToast('Erro ao atualizar evento', 'error')
    }
  }

  async function handleDeleteEvento() {
    if (!detailEvento) return
    try {
      await deleteMutation.mutateAsync(detailEvento.id)
      setDetailEvento(null); setDetailPos(null); setDeleteConfirm(false)
      showToast('Evento excluído')
    } catch {
      showToast('Erro ao excluir evento', 'error')
    }
  }

  function handleEdit(evento: Agendamento) {
    setDetailEvento(null); setDetailPos(null)
    setEditingEvento(evento)
    setModalTipo(evento.tipo)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Topbar title="Agendamentos" hideSearch />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 16 }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>Calendário</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Google Agenda — Em breve */}
            <button
              disabled
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                border: '1px solid #E3E0D9', borderRadius: 5, background: '#FAF9F7',
                fontSize: 11.5, color: '#8A8A8A', cursor: 'not-allowed', fontFamily: 'inherit',
              }}
            >
              <Icon name="calendar" size={12} />
              Sincronizar Google Agenda
              <span style={{ fontSize: 9, fontWeight: 700, background: '#E3E0D9', color: '#6A6864', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>
                EM BREVE
              </span>
            </button>

            <Button variant="primary" size="sm" onClick={() => { setDatePrefill(''); setChoiceDay('__new__') }}>
              <Icon name="plus" size={13} />
              Novo
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #E3E0D9', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', padding: '8px 8px 8px' }}>
          <CalendarioMensal
            ano={calAno}
            mes={calMes}
            eventos={eventos}
            onMonthChange={(a, m) => { setCalAno(a); setCalMes(m) }}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Choice popup (Novo Agendamento / Novo Lembrete) */}
      {(choiceDay !== null) && choicePos && (
        <div
          ref={choiceRef}
          style={{
            position: 'fixed', top: choicePos.top, left: choicePos.left, zIndex: 500,
            background: '#fff', border: '1px solid #E3E0D9', borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)', padding: 8, minWidth: 200,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A8A', padding: '4px 8px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Criar evento
          </div>
          <button
            onClick={() => openModal('agendamento')}
            style={choiceItemStyle}
            onMouseEnter={e => (e.currentTarget.style.background = '#F4F2ED')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span style={{ fontSize: 14 }}>📅</span>
            <span>Novo Agendamento</span>
          </button>
          <button
            onClick={() => openModal('lembrete')}
            style={choiceItemStyle}
            onMouseEnter={e => (e.currentTarget.style.background = '#F4F2ED')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span style={{ fontSize: 14 }}>🔔</span>
            <span>Novo Lembrete</span>
          </button>
        </div>
      )}

      {/* Event detail popover */}
      {detailEvento && detailPos && (
        <div
          ref={detailRef}
          style={{
            position: 'fixed', top: detailPos.top, left: detailPos.left, zIndex: 500,
            background: '#fff', border: '1px solid #E3E0D9', borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)', padding: 14, minWidth: 260, maxWidth: 300,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: detailEvento.cor, flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{detailEvento.titulo}</div>
            </div>
            <button onClick={() => { setDetailEvento(null); setDetailPos(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A8A', padding: 2 }}>
              <Icon name="x" size={12} />
            </button>
          </div>

          <div style={{ fontSize: 11.5, color: '#4A4A4A', marginBottom: 6 }}>
            {formatEventDate(detailEvento.data, detailEvento.hora_inicio, detailEvento.hora_fim, detailEvento.dia_inteiro)}
          </div>

          {detailEvento.cliente_nome && (
            <div style={{ fontSize: 11.5, color: '#4A4A4A', marginBottom: 4 }}>
              <span style={{ color: '#8A8A8A' }}>Cliente: </span>{detailEvento.cliente_nome}
            </div>
          )}
          {detailEvento.tecnico_nome && (
            <div style={{ fontSize: 11.5, color: '#4A4A4A', marginBottom: 4 }}>
              <span style={{ color: '#8A8A8A' }}>Técnico: </span>{detailEvento.tecnico_nome}
            </div>
          )}
          {detailEvento.descricao && (
            <div style={{ fontSize: 11.5, color: '#6A6864', marginTop: 6, marginBottom: 8, lineHeight: 1.5 }}>
              {detailEvento.descricao}
            </div>
          )}

          {!deleteConfirm ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 12, borderTop: '1px solid #F0EDE8', paddingTop: 10 }}>
              <button onClick={() => handleEdit(detailEvento)} style={detailBtnStyle}>Editar</button>
              <button onClick={() => setDeleteConfirm(true)} style={{ ...detailBtnStyle, color: '#DC2626' }}>Excluir</button>
            </div>
          ) : (
            <div style={{ marginTop: 12, borderTop: '1px solid #F0EDE8', paddingTop: 10 }}>
              <div style={{ fontSize: 11.5, color: '#4A4A4A', marginBottom: 8 }}>Excluir este evento?</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setDeleteConfirm(false)} style={detailBtnStyle}>Cancelar</button>
                <button
                  onClick={handleDeleteEvento}
                  disabled={deleteMutation.isPending}
                  style={{ ...detailBtnStyle, background: '#DC2626', color: '#fff', border: 'none' }}
                >
                  {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ModalNovoAgendamento
        open={modalTipo === 'agendamento'}
        dataPrefill={dataPrefill}
        editing={editingEvento?.tipo === 'agendamento' ? editingEvento : null}
        onClose={() => { setModalTipo(null); setEditingEvento(null) }}
        onConfirm={editingEvento ? handleUpdate : handleCreate}
        isSaving={isSaving}
      />
      <ModalNovoLembrete
        open={modalTipo === 'lembrete'}
        dataPrefill={dataPrefill}
        editing={editingEvento?.tipo === 'lembrete' ? editingEvento : null}
        onClose={() => { setModalTipo(null); setEditingEvento(null) }}
        onConfirm={editingEvento ? handleUpdate : handleCreate}
        isSaving={isSaving}
      />

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <ToastNotification key={t.id} toast={t} onDismiss={id => setToasts(prev => prev.filter(x => x.id !== id))} />
        ))}
      </div>
    </>
  )
}

const choiceItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
  padding: '8px 12px', fontSize: 12.5, background: 'none', border: 'none',
  cursor: 'pointer', color: '#1A1A1A', fontFamily: 'inherit', borderRadius: 5,
}

const detailBtnStyle: React.CSSProperties = {
  flex: 1, padding: '5px 12px', border: '1px solid #E3E0D9', borderRadius: 5,
  background: 'none', cursor: 'pointer', fontSize: 11.5, fontFamily: 'inherit', color: '#1A1A1A',
}
