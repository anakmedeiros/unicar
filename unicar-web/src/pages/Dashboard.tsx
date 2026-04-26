import { useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Topbar } from '../components/layout/Topbar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Avatar } from '../components/ui/Avatar'
import { MetricCard } from '../components/ui/MetricCard'

import { MOCK_OS, KANBAN_COLUMNS, BAR_CHART_DATA } from '../data/mock'
import type { OS, OSStatus } from '../types'

// ─── OS Card ────────────────────────────────────────────────────────────────

function OSCard({ os, isDragging }: { os: OS; isDragging?: boolean }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E3E0D9',
        borderRadius: 6,
        padding: 10,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
        opacity: isDragging ? 0.85 : 1,
        cursor: 'grab',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#8A8A8A',
          }}
        >
          {os.num}
        </span>
        <Avatar name={os.tec} size={18} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: '#1A1A1A' }}>{os.cliente}</div>
      <div style={{ fontSize: 10.5, color: '#8A8A8A', marginTop: 2 }}>{os.veiculo}</div>
      <div style={{ fontSize: 11, marginTop: 6, color: '#4A4A4A' }}>{os.servico}</div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px solid #EBE8E2',
        }}
      >
        <span style={{ fontSize: 10.5, color: '#8A8A8A' }}>
          {os.dias != null ? `há ${os.dias}d` : '—'}
        </span>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: '#1A1A1A',
          }}
        >
          {os.valor}
        </span>
      </div>
    </div>
  )
}

// ─── Sortable OS Card ────────────────────────────────────────────────────────

function SortableOSCard({ os }: { os: OS }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: os.num,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <OSCard os={os} isDragging={isDragging} />
    </div>
  )
}

// ─── Kanban Column ───────────────────────────────────────────────────────────

interface KanbanColumnProps {
  colKey?: OSStatus
  title: string
  tone: string
  bg: string
  cards: OS[]
}

function KanbanColumn({ title, tone, bg, cards }: KanbanColumnProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: bg,
        borderRadius: 6,
        padding: 10,
        minHeight: 200,
      }}
    >
      {/* Column header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: tone }}>
          <span
            aria-hidden="true"
            style={{ width: 7, height: 7, borderRadius: '50%', background: tone, flexShrink: 0 }}
          />
          {title}
        </div>
        <span style={{ fontSize: 11, color: '#8A8A8A' }}>{cards.length}</span>
      </div>

      {/* Cards */}
      <SortableContext items={cards.map(c => c.num)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cards.map(os => (
            <SortableOSCard key={os.num} os={os} />
          ))}
        </div>
      </SortableContext>

      {cards.length === 0 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#CFCCC6',
            fontSize: 11,
            fontStyle: 'italic',
          }}
        >
          Sem ordens
        </div>
      )}
    </div>
  )
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

export function Dashboard() {
  const [osList, setOsList] = useState<OS[]>(MOCK_OS)
  const [activeOS, setActiveOS] = useState<OS | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const byStatus = (k: OSStatus) => osList.filter(o => o.status === k)

  function handleDragStart(event: DragStartEvent) {
    const os = osList.find(o => o.num === event.active.id)
    setActiveOS(os ?? null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const newStatus = KANBAN_COLUMNS.find(c => c.key === overId)?.key
    if (!newStatus) return

    setOsList(prev =>
      prev.map(o => (o.num === activeId ? { ...o, status: newStatus } : o))
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveOS(null)

    if (!over) return

    const overId = over.id as string
    const newStatus = KANBAN_COLUMNS.find(c => c.key === overId)?.key
    if (newStatus) {
      setOsList(prev =>
        prev.map(o => (o.num === active.id ? { ...o, status: newStatus } : o))
      )
    }
  }

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Quadro de OS"
        actions={
          <>
            <Button variant="secondary" size="md">
              <Icon name="doc" size={13} />
              Orçamento
            </Button>
            <Button variant="primary" size="md">
              <Icon name="plus" size={13} />
              Nova OS
            </Button>
          </>
        }
      />

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
        {/* Hero metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 12 }}>
          {/* Faturamento card */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #E3E0D9',
              borderRadius: 6,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#8A8A8A',
                  }}
                >
                  Faturamento · Abril
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    marginTop: 4,
                    fontVariantNumeric: 'tabular-nums',
                    color: '#1A1A1A',
                  }}
                >
                  R$ 84.620
                </div>
                <div style={{ fontSize: 11, color: '#10884A', fontWeight: 600, marginTop: 2 }}>
                  ▲ 12% vs. março
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Mês ▾
              </Button>
            </div>

            {/* Mini bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 50, marginTop: 6 }}>
              {BAR_CHART_DATA.map((h, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: i === BAR_CHART_DATA.length - 1 ? '#E31E2D' : '#CFCCC6',
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              ))}
            </div>
          </div>

          <MetricCard
            label="OS concluídas"
            value="62 / 80"
            sub="78% da meta"
            icon="check"
            progress={78}
          />
          <MetricCard
            label="Veículos ativos"
            value="8"
            sub="2 prontos retirada"
            icon="car"
          />
          <MetricCard
            label="A receber"
            value="R$ 14,8k"
            sub="4 boletos / 7 dias"
            icon="cash"
            accent="#E31E2D"
          />
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
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: '#1A1A1A' }}>
              Quadro de Ordens de Serviço
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button variant="secondary" size="sm">Hoje</Button>
              <Button variant="secondary" size="sm">Por técnico</Button>
              <Button variant="secondary" size="sm">
                <Icon name="filter" size={12} />
              </Button>
            </div>
          </div>

          {/* Kanban grid */}
          <DndContext
            sensors={sensors}
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
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
              }}
            >
              {KANBAN_COLUMNS.map(col => (
                <KanbanColumn
                  key={col.key}
                  colKey={col.key}
                  title={col.title}
                  tone={col.tone}
                  bg={col.bg}
                  cards={byStatus(col.key)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeOS && (
                <div style={{ transform: 'rotate(2deg)' }}>
                  <OSCard os={activeOS} isDragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </>
  )
}
