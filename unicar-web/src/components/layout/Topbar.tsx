import type { ReactNode } from 'react'
import { Icon } from '../ui/Icon'
import { Button } from '../ui/Button'

interface TopbarProps {
  title: string
  section?: string          // mostra "section › title" no breadcrumb
  subtitle?: string
  actions?: ReactNode
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (v: string) => void
}

const today = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1)

export function Topbar({
  title,
  section,
  subtitle,
  actions,
  searchPlaceholder = 'Buscar OS, cliente, placa…',
  searchValue,
  onSearchChange,
}: TopbarProps) {
  const controlled = searchValue !== undefined

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 52,
        borderBottom: '1px solid #E3E0D9',
        background: '#fff',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8A8A8A' }}>
        <Icon name="calendar" size={14} />
        <span>{todayFormatted}</span>
        <DotSep />
        {section && (
          <>
            <span>{section}</span>
            <Icon name="chevron" size={12} style={{ color: '#CFCCC6' }} />
          </>
        )}
        <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{title}</span>
        {subtitle && (
          <>
            <DotSep />
            <span>{subtitle}</span>
          </>
        )}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', marginRight: 4 }}>
          <Icon
            name="search"
            size={14}
            style={{
              position: 'absolute',
              left: 9,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8A8A8A',
              pointerEvents: 'none',
            }}
          />
          <input
            placeholder={searchPlaceholder}
            value={controlled ? searchValue : undefined}
            onChange={controlled ? e => onSearchChange?.(e.target.value) : undefined}
            style={{
              width: 240,
              height: 32,
              paddingLeft: 30,
              paddingRight: 10,
              border: '1px solid #CFCCC6',
              borderRadius: 5,
              background: '#fff',
              fontSize: 12.5,
              color: '#1A1A1A',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#E31E2D'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#CFCCC6'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        <Button variant="ghost" size="sm" aria-label="Notificações">
          <Icon name="bell" size={15} />
        </Button>

        {actions}
      </div>
    </div>
  )
}

function DotSep() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 3,
        height: 3,
        borderRadius: '50%',
        background: '#8A8A8A',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  )
}
