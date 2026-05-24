import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { supabase } from '../lib/supabase'
import { ordensServicoService } from '../services/ordens-servico'
import { Topbar } from '../components/layout/Topbar'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ToastNotification } from '../shared/components/Toast'
import type { ToastItem } from '../shared/components/Toast'
import type { KanbanOS, OrdemServicoStatus } from '../types'

// ─── Kanban columns config ────────────────────────────────────────────────────

const KANBAN_COLS = [
  {
    key: 'aguardando_aprovacao' as OrdemServicoStatus,
    title: 'Aguardando aprovação',
    tone: '#CA8A04',
    bg: '#fefce8',
    cardBg: '#fefce8',
    cardBorder: '#fef08a',
  },
  {
    key: 'aberta' as OrdemServicoStatus,
    title: 'Abertas',
    tone: '#dc2626',
    bg: '#fff1f2',
    cardBg: '#fff1f2',
    cardBorder: '#fecdd3',
  },
  {
    key: 'em_execucao' as OrdemServicoStatus,
    title: 'Em execução',
    tone: '#2563EB',
    bg: '#eff6ff',
    cardBg: '#eff6ff',
    cardBorder: '#bfdbfe',
  },
  {
    key: 'aguardando_peca' as OrdemServicoStatus,
    title: 'Paradas / Aguard. peça',
    tone: '#7C3AED',
    bg: '#f5f3ff',
    cardBg: '#f5f3ff',
    cardBorder: '#ddd6fe',
  },
  {
    key: 'pronta' as OrdemServicoStatus,
    title: 'Prontas',
    tone: '#16a34a',
    bg: '#f0fdf4',
    cardBg: '#f0fdf4',
    cardBorder: '#bbf7d0',
  },
] as const

type ColDef = (typeof KANBAN_COLS)[number]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '—'
  const diffMs = Date.now() - new Date(dateStr + 'T00:00:00').getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  const diffD = Math.floor(diffH / 24)
  if (diffD > 0) return `há ${diffD}d`
  if (diffH > 0) return `há ${diffH}h`
  return 'hoje'
}

function findColumnStatus(id: string, osList: KanbanOS[]): OrdemServicoStatus | null {
  const col = KANBAN_COLS.find(c => c.key === id)
  if (col) return col.key
  return osList.find(o => o.id === id)?.status ?? null
}

// ─── OS Card ──────────────────────────────────────────────────────────────────

const CARD_STYLE: Partial<Record<OrdemServicoStatus, { bg: string; border: string }>> = {
  aguardando_aprovacao: { bg: '#fefce8', border: '#fef08a' },
  aberta:               { bg: '#fff1f2', border: '#fecdd3' },
  em_execucao:          { bg: '#eff6ff', border: '#bfdbfe' },
  aguardando_peca:      { bg: '#f5f3ff', border: '#ddd6fe' },
  pronta:               { bg: '#f0fdf4', border: '#bbf7d0' },
}

function OSCard({ os, isDragging }: { os: KanbanOS; isDragging?: boolean }) {
  const s = CARD_STYLE[os.status] ?? { bg: '#fff', border: '#E3E0D9' }
  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        padding: 10,
        boxShadow: isDragging
          ? '0 8px 24px rgba(0,0,0,0.14)'
          : '0 1px 2px rgba(0,0,0,0.04)',
        opacity: isDragging ? 0.9 : 1,
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#dc2626',
          }}
        >
          {os.numero}
        </span>
        {os.tecnico_nome && <Avatar name={os.tecnico_nome} size={20} />}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 5, color: '#1A1A1A' }}>
        {os.cliente_nome || '—'}
      </div>

      <div style={{ fontSize: 10.5, color: '#8A8A8A', marginTop: 2 }}>
        {[os.veiculo_modelo, os.veiculo_placa].filter(Boolean).join(' · ') || '—'}
      </div>

      <div
        style={{
          fontSize: 11,
          color: '#4A4A4A',
          marginTop: 5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {os.problema_relatado || '—'}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
          paddingTop: 8,
          borderTop: '0.5px solid rgba(0,0,0,0.08)',
        }}
      >
        <span style={{ fontSize: 10.5, color: '#8A8A8A' }}>{timeAgo(os.data)}</span>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: '#1A1A1A',
          }}
        >
          {formatCurrency(os.valor_total)}
        </span>
      </div>
    </div>
  )
}

// ─── Sortable OS Card ─────────────────────────────────────────────────────────

function SortableOSCard({ os }: { os: KanbanOS }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: os.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 'auto',
      }}
      {...attributes}
      {...listeners}
    >
      <OSCard os={os} isDragging={isDragging} />
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({ col, cards }: { col: ColDef; cards: KanbanOS[] }) {
  const { setNodeRef } = useDroppable({ id: col.key })
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: col.bg,
        borderRadius: 8,
        padding: 10,
        minHeight: 200,
        border: '0.5px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11.5,
            fontWeight: 700,
            color: col.tone,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: col.tone,
              flexShrink: 0,
            }}
          />
          {col.title}
        </div>
        <span style={{ fontSize: 11, color: '#8A8A8A', fontWeight: 500 }}>{cards.length}</span>
      </div>

      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 40 }}
        >
          {cards.map(os => (
            <SortableOSCard key={os.id} os={os} />
          ))}
          {cards.length === 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#CFCCC6',
                fontSize: 11,
                fontStyle: 'italic',
                padding: '20px 8px',
              }}
            >
              Nenhuma OS nesta etapa
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCompact(v: number): string {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Metric card "Em breve" ────────────────────────────────────────────────────

function MetricEmBreve({ label }: { label: string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E3E0D9',
        borderRadius: 6,
        padding: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#8A8A8A',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: '#CFCCC6', marginTop: 10, fontStyle: 'italic' }}>
        Em breve
      </div>
    </div>
  )
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export function Dashboard() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: queryData = [] } = useQuery({
    queryKey: ['kanban'],
    queryFn: ordensServicoService.listKanban,
  })

  const { data: parcelasReceber = [] } = useQuery({
    queryKey: ['resumo-receber'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('os_parcelas')
        .select('valor, data_vencimento, status, os_pagamentos(ordens_servico(status))')
        .in('status', ['pendente', 'atrasado'])
      if (error) throw error
      return (data ?? [])
        .filter(row => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pag = Array.isArray((row as any).os_pagamentos) ? (row as any).os_pagamentos[0] : (row as any).os_pagamentos
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const os = pag ? (Array.isArray(pag.ordens_servico) ? pag.ordens_servico[0] : pag.ordens_servico) : null
          return os?.status !== 'cancelada'
        })
        .map(({ valor, data_vencimento, status }) => ({ valor, data_vencimento, status })) as { valor: number; data_vencimento: string; status: string }[]
    },
  })

  // Local state for optimistic DnD updates
  const [localOS, setLocalOS] = useState<KanbanOS[]>([])
  useEffect(() => { setLocalOS(queryData) }, [queryData])

  // DnD state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragOriginStatus, setDragOriginStatus] = useState<OrdemServicoStatus | null>(null)

  // Filters
  const [filterToday, setFilterToday] = useState(false)
  const [filterTecnico, setFilterTecnico] = useState<string | null>(null)
  const [showTecnicoDropdown, setShowTecnicoDropdown] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function showToast(message: string, variant: 'success' | 'error' = 'success') {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant, exiting: false }])
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t)), 3600)
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400)
  }

  // Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('kanban-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_servico' }, () => {
        qc.invalidateQueries({ queryKey: ['kanban'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])

  // Computed: kanban-visible OS with filters applied
  const kanbanOS = useMemo(() => {
    let list = localOS.filter(o => o.status !== 'rascunho' && o.status !== 'veiculo_liberado')
    if (filterToday) {
      const todayStr = new Date().toISOString().slice(0, 10)
      list = list.filter(o => o.data.startsWith(todayStr))
    }
    if (filterTecnico) {
      list = list.filter(o => o.tecnico_id === filterTecnico)
    }
    return list
  }, [localOS, filterToday, filterTecnico])

  // Computed: metrics (use full localOS, which excludes entregue/cancelada)
  const osEmAberto = localOS.length

  const subtextoOS = useMemo(() => {
    const counts: Partial<Record<OrdemServicoStatus, number>> = {}
    for (const os of localOS) {
      if (['aguardando_aprovacao', 'aberta', 'em_execucao', 'aguardando_peca'].includes(os.status)) {
        counts[os.status] = (counts[os.status] ?? 0) + 1
      }
    }
    const parts: string[] = []
    if (counts.aguardando_aprovacao)
      parts.push(`${counts.aguardando_aprovacao} aguard. aprovação`)
    if (counts.aberta)
      parts.push(`${counts.aberta} ${counts.aberta === 1 ? 'aberta' : 'abertas'}`)
    if (counts.em_execucao)
      parts.push(`${counts.em_execucao} em execução`)
    if (counts.aguardando_peca)
      parts.push(`${counts.aguardando_peca} aguard. peça`)
    return parts.join(' · ') || '—'
  }, [localOS])

  const veiculosEmManutencao = useMemo(
    () => new Set(localOS.filter(o => o.veiculo_id).map(o => o.veiculo_id!)).size,
    [localOS]
  )

  const prontos = useMemo(
    () => localOS.filter(o => o.status === 'pronta').length,
    [localOS]
  )

  const totalReceber = useMemo(
    () => parcelasReceber.reduce((s, p) => s + (p.valor ?? 0), 0),
    [parcelasReceber]
  )
  const emAtraso = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    return parcelasReceber.filter(p => p.status === 'atrasado' || p.data_vencimento < hoje).length
  }, [parcelasReceber])

  // Unique technicians for filter dropdown
  const uniqueTecnicos = useMemo(() => {
    const seen = new Set<string>()
    return localOS
      .filter(o => o.tecnico_id && !seen.has(o.tecnico_id) && seen.add(o.tecnico_id))
      .map(o => ({ id: o.tecnico_id!, nome: o.tecnico_nome }))
  }, [localOS])

  const activeCard = activeId ? localOS.find(o => o.id === activeId) : null
  const hasFilters = filterToday || !!filterTecnico

  // ─── DnD handlers ──────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart({ active }: DragStartEvent) {
    const id = active.id as string
    setActiveId(id)
    setDragOriginStatus(localOS.find(o => o.id === id)?.status ?? null)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const id = active.id as string
    const targetStatus = findColumnStatus(over.id as string, localOS)
    if (!targetStatus) return
    const current = localOS.find(o => o.id === id)
    if (!current || current.status === targetStatus) return
    setLocalOS(prev => prev.map(o => o.id === id ? { ...o, status: targetStatus } : o))
  }

  async function handleDragEnd({ active }: DragEndEvent) {
    const id = active.id as string
    const card = localOS.find(o => o.id === id)
    setActiveId(null)

    if (!card || card.status === dragOriginStatus) {
      setDragOriginStatus(null)
      return
    }

    try {
      await ordensServicoService.updateStatus(id, card.status)
      await ordensServicoService.inserirHistorico(id, dragOriginStatus, card.status)
      qc.invalidateQueries({ queryKey: ['kanban'] })
      qc.invalidateQueries({ queryKey: ['ordens_servico'] })
      const colTitle = KANBAN_COLS.find(c => c.key === card.status)?.title ?? card.status
      showToast(`OS ${card.numero} movida para ${colTitle}`)
    } catch {
      setLocalOS(prev =>
        prev.map(o => o.id === id ? { ...o, status: dragOriginStatus! } : o)
      )
      showToast('Erro ao mover OS. Tente novamente.', 'error')
    }

    setDragOriginStatus(null)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Topbar title="Dashboard" subtitle="Quadro de OS" hideSearch />

      <div
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
          overflow: 'auto',
        }}
      >
        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <MetricEmBreve label="Faturamento" />

          {/* OS em aberto */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #E3E0D9',
              borderRadius: 6,
              padding: 16,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#8A8A8A',
              }}
            >
              OS EM ABERTO
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
                color: '#1A1A1A',
              }}
            >
              {osEmAberto}
            </div>
            <div style={{ fontSize: 11, color: '#8A8A8A', marginTop: 4 }}>{subtextoOS}</div>
          </div>

          {/* Veículos em manutenção */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #E3E0D9',
              borderRadius: 6,
              padding: 16,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#8A8A8A',
              }}
            >
              VEÍCULOS EM MANUTENÇÃO
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
                color: '#1A1A1A',
              }}
            >
              {veiculosEmManutencao}
            </div>
            <div style={{ fontSize: 11, color: '#8A8A8A', marginTop: 4 }}>
              {prontos > 0
                ? `${prontos} ${prontos === 1 ? 'pronto' : 'prontos'} para retirada`
                : 'Nenhum pronto para retirada'}
            </div>
          </div>

          {/* A Receber */}
          <div
            onClick={() => navigate('/financeiro/contas-a-receber')}
            style={{
              background: '#fff',
              border: '1px solid #E3E0D9',
              borderRadius: 6,
              padding: 16,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#E31E2D')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#E3E0D9')}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#8A8A8A',
              }}
            >
              A RECEBER
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
                color: '#1A1A1A',
              }}
            >
              {formatCompact(totalReceber)}
            </div>
            <div style={{ fontSize: 11, color: emAtraso > 0 ? '#DC2626' : '#8A8A8A', marginTop: 4 }}>
              {parcelasReceber.length} {parcelasReceber.length === 1 ? 'parcela' : 'parcelas'}
              {emAtraso > 0 ? ` · ${emAtraso} em atraso` : ''}
            </div>
          </div>
        </div>

        {/* Kanban board */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #E3E0D9',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          {/* Board header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 24px 12px',
              borderBottom: '1px solid #EBE8E2',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: '#1A1A1A',
              }}
            >
              Quadro de Ordens de Serviço
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button
                variant={filterToday ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterToday(f => !f)}
              >
                Hoje
              </Button>

              {/* Por técnico dropdown */}
              <div style={{ position: 'relative' }}>
                <Button
                  variant={filterTecnico ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setShowTecnicoDropdown(v => !v)}
                >
                  {filterTecnico
                    ? uniqueTecnicos.find(t => t.id === filterTecnico)?.nome ?? 'Técnico'
                    : 'Por técnico'}
                </Button>

                {showTecnicoDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 4,
                      background: '#fff',
                      border: '1px solid #E3E0D9',
                      borderRadius: 6,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                      zIndex: 50,
                      minWidth: 180,
                      padding: 4,
                    }}
                  >
                    {uniqueTecnicos.length === 0 ? (
                      <div style={{ padding: '8px 12px', fontSize: 12, color: '#8A8A8A' }}>
                        Nenhum técnico encontrado
                      </div>
                    ) : (
                      uniqueTecnicos.map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setFilterTecnico(t.id)
                            setShowTecnicoDropdown(false)
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '7px 12px',
                            fontSize: 12,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: 4,
                            color: filterTecnico === t.id ? '#E31E2D' : '#1A1A1A',
                            fontWeight: filterTecnico === t.id ? 600 : 400,
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#FAF9F7'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'none'
                          }}
                        >
                          {t.nome}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {hasFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterToday(false)
                    setFilterTecnico(null)
                    setShowTecnicoDropdown(false)
                  }}
                >
                  <Icon name="x" size={12} />
                </Button>
              ) : (
                <Button variant="secondary" size="sm">
                  <Icon name="filter" size={12} />
                </Button>
              )}
            </div>
          </div>

          {/* Kanban grid */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: 12,
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 10,
              }}
            >
              {KANBAN_COLS.map(col => (
                <KanbanColumn
                  key={col.key}
                  col={col}
                  cards={kanbanOS.filter(o => o.status === col.key)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeCard && (
                <div style={{ transform: 'rotate(1.5deg)', opacity: 0.92 }}>
                  <OSCard os={activeCard} isDragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Toasts */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 9999,
        }}
      >
        {toasts.map(t => (
          <ToastNotification key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </>
  )
}
