import { useState, useEffect, useRef } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import {
  formatCurrency,
  formatDate,
  getDescricao,
  STATUS_PAG_STYLE,
  OS_STATUS_LABEL,
  OS_STATUS_COLOR,
} from '../types'
import type { Parcela } from '../types'

interface ContasReceberTableProps {
  parcelas: Parcela[]
  selectedIds: Set<string>
  isLoading: boolean
  onSelectToggle: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onMarcarRecebido: (ids: string[]) => void
  onRecebimentoParcial: (parcela: Parcela) => void
}

export function ContasReceberTable({
  parcelas,
  selectedIds,
  isLoading,
  onSelectToggle,
  onSelectAll,
  onDeselectAll,
  onMarcarRecebido,
  onRecebimentoParcial,
}: ContasReceberTableProps) {
  const [acoesBulkOpen, setAcoesBulkOpen] = useState(false)
  const [rowDropdown, setRowDropdown] = useState<string | null>(null)
  const bulkRef = useRef<HTMLDivElement>(null)

  const allSelected = parcelas.length > 0 && selectedIds.size === parcelas.length
  const someSelected = selectedIds.size > 0 && !allSelected

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) {
        setAcoesBulkOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleSelectAll() {
    allSelected ? onDeselectAll() : onSelectAll()
  }

  function exportCSV() {
    const list = parcelas.filter(p => selectedIds.size === 0 || selectedIds.has(p.id))
    const headers = ['Data vencimento', 'OS', 'Cliente', 'Veículo', 'Descrição', 'Valor', 'Status pagamento', 'Data pagamento']
    const rows = list.map(p => [
      formatDate(p.data_vencimento),
      p.os_numero,
      p.cliente_nome,
      [p.veiculo_modelo, p.veiculo_placa].filter(Boolean).join(' '),
      getDescricao(p.forma_pagamento, p.pagamento_tipo, p.numero, p.num_parcelas),
      formatCurrency(p.valor),
      STATUS_PAG_STYLE[p.statusEfetivo].label,
      p.data_pagamento ? formatDate(p.data_pagamento) : '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contas-receber-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E3E0D9',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      {/* Table topbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid #EBE8E2',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => { if (el) el.indeterminate = someSelected }}
            onChange={handleSelectAll}
            style={{ width: 14, height: 14, accentColor: '#E31E2D', cursor: 'pointer' }}
          />
          {selectedIds.size > 0 && (
            <span style={{ fontSize: 11.5, color: '#8A8A8A' }}>
              {selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}
            </span>
          )}
          {selectedIds.size === 0 && (
            <span style={{ fontSize: 11.5, color: '#8A8A8A' }}>
              {parcelas.length} lançamento{parcelas.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Ações dropdown */}
        <div ref={bulkRef} style={{ position: 'relative' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setAcoesBulkOpen(v => !v)}
          >
            Ações
            <Icon name="chevron-down" size={11} />
          </Button>
          {acoesBulkOpen && (
            <div style={dropdownStyle}>
              <DropItem
                label="Marcar como recebido"
                disabled={selectedIds.size === 0}
                onClick={() => {
                  onMarcarRecebido(Array.from(selectedIds))
                  setAcoesBulkOpen(false)
                }}
              />
              <DropItem
                label="Exportar CSV"
                onClick={() => { exportCSV(); setAcoesBulkOpen(false) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Scrollable table */}
      <div style={{ overflow: 'auto', flex: 1 }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, color: '#8A8A8A', fontSize: 12 }}>
            Carregando...
          </div>
        ) : parcelas.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, color: '#CFCCC6', fontSize: 12, fontStyle: 'italic' }}>
            Nenhum lançamento no período
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#FAF9F7', borderBottom: '1px solid #EBE8E2' }}>
                <Th width={32} />
                <Th>Data</Th>
                <Th>OS</Th>
                <Th>Cliente</Th>
                <Th>Veículo</Th>
                <Th>Descrição</Th>
                <Th>Status OS</Th>
                <Th align="right">Valor</Th>
                <Th>Status</Th>
                <Th width={40} />
              </tr>
            </thead>
            <tbody>
              {parcelas.map(p => (
                <TableRow
                  key={p.id}
                  parcela={p}
                  selected={selectedIds.has(p.id)}
                  isRowOpen={rowDropdown === p.id}
                  onSelect={() => onSelectToggle(p.id)}
                  onOpenDropdown={() => setRowDropdown(prev => prev === p.id ? null : p.id)}
                  onCloseDropdown={() => setRowDropdown(null)}
                  onMarcarRecebido={() => { onMarcarRecebido([p.id]); setRowDropdown(null) }}
                  onRecebimentoParcial={() => { onRecebimentoParcial(p); setRowDropdown(null) }}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── TableRow ─────────────────────────────────────────────────────────────────

function TableRow({
  parcela: p,
  selected,
  isRowOpen,
  onSelect,
  onOpenDropdown,
  onCloseDropdown,
  onMarcarRecebido,
  onRecebimentoParcial,
}: {
  parcela: Parcela
  selected: boolean
  isRowOpen: boolean
  onSelect: () => void
  onOpenDropdown: () => void
  onCloseDropdown: () => void
  onMarcarRecebido: () => void
  onRecebimentoParcial: () => void
}) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const pagStyle = STATUS_PAG_STYLE[p.statusEfetivo]
  const osStyle = OS_STATUS_COLOR[p.os_status] ?? { bg: 'rgba(138,138,138,0.1)', color: '#6A6864' }
  const isLate = p.statusEfetivo === 'atrasado'

  useEffect(() => {
    if (!isRowOpen) return
    function handle(e: MouseEvent) {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        onCloseDropdown()
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isRowOpen, onCloseDropdown])

  return (
    <tr
      ref={rowRef}
      style={{
        borderBottom: '0.5px solid #EBE8E2',
        background: selected ? 'rgba(227,30,45,0.03)' : 'transparent',
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = '#FAF9F7' }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <td style={tdStyle}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          style={{ width: 13, height: 13, accentColor: '#E31E2D', cursor: 'pointer' }}
        />
      </td>

      <td style={{ ...tdStyle, color: isLate ? '#dc2626' : '#4A4A4A', fontWeight: isLate ? 600 : 400, whiteSpace: 'nowrap' }}>
        {formatDate(p.data_vencimento)}
      </td>

      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 700, color: '#dc2626' }}>
          {p.os_numero}
        </span>
      </td>

      <td style={{ ...tdStyle, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.cliente_nome || '—'}
      </td>

      <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#6A6864', fontSize: 11 }}>
        {[p.veiculo_modelo, p.veiculo_placa].filter(Boolean).join(' · ') || '—'}
      </td>

      <td style={{ ...tdStyle, color: '#4A4A4A', whiteSpace: 'nowrap' }}>
        {getDescricao(p.forma_pagamento, p.pagamento_tipo, p.numero, p.num_parcelas)}
      </td>

      <td style={tdStyle}>
        <span
          style={{
            display: 'inline-flex',
            padding: '2px 7px',
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 600,
            background: osStyle.bg,
            color: osStyle.color,
            whiteSpace: 'nowrap',
          }}
        >
          {OS_STATUS_LABEL[p.os_status] ?? p.os_status}
        </span>
      </td>

      <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {formatCurrency(p.valor)}
      </td>

      <td style={tdStyle}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 600,
            background: pagStyle.bg,
            color: pagStyle.color,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: pagStyle.color, flexShrink: 0 }} />
          {pagStyle.label}
        </span>
      </td>

      <td style={{ ...tdStyle, position: 'relative' }}>
        <button
          onClick={onOpenDropdown}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 4,
            color: '#8A8A8A',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'inherit',
          }}
        >
          <Icon name="dots" size={14} />
        </button>

        {isRowOpen && (
          <div style={{ ...dropdownStyle, right: 0, left: 'auto', top: '100%' }}>
            {p.statusEfetivo !== 'pago' && (
              <>
                <DropItem label="Marcar como recebido" onClick={onMarcarRecebido} />
                <DropItem label="Receber parcial" onClick={onRecebimentoParcial} />
              </>
            )}
            {p.statusEfetivo === 'pago' && (
              <div style={{ padding: '8px 12px', fontSize: 11.5, color: '#8A8A8A', fontStyle: 'italic' }}>
                Já recebido
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Th({ children, width, align }: { children?: React.ReactNode; width?: number; align?: string }) {
  return (
    <th
      style={{
        padding: '7px 10px',
        textAlign: (align as React.CSSProperties['textAlign']) ?? 'left',
        fontSize: 10.5,
        fontWeight: 600,
        color: '#6A6864',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        width: width ?? 'auto',
      }}
    >
      {children}
    </th>
  )
}

function DropItem({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '8px 12px',
        fontSize: 12,
        background: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? '#CFCCC6' : '#1A1A1A',
        fontFamily: 'inherit',
        borderRadius: 4,
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = '#FAF9F7' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
    >
      {label}
    </button>
  )
}

const tdStyle: React.CSSProperties = {
  padding: '9px 10px',
  fontSize: 12,
  color: '#1A1A1A',
  verticalAlign: 'middle',
}

const dropdownStyle: React.CSSProperties = {
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
}
