import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../ui/Icon'
import { LogoFull } from '../ui/MarkSpeed'
import { Avatar } from '../ui/Avatar'

// ─── Nav structure ────────────────────────────────────────────────────────────

type NavLink = {
  type?: 'link'
  id: string
  label: string
  icon: IconName
  section?: string | null
  path: string
}

type NavGroup = {
  type: 'group'
  id: string
  label: string
  icon: IconName
  section?: string | null
  children: { id: string; label: string; path: string; disabled?: boolean; badge?: string }[]
}

type NavEntry = NavLink | NavGroup

const NAV: NavEntry[] = [
  { id: 'dashboard', label: 'Dashboard',         icon: 'dashboard', section: null,       path: '/' },
  { id: 'os',        label: 'Ordens de Serviço', icon: 'wrench',    section: 'OPERAÇÃO', path: '/os' },
  { id: 'agenda',    label: 'Agenda',             icon: 'calendar',  section: null,       path: '/agenda' },
  { id: 'clientes',  label: 'Clientes',           icon: 'users',     section: 'CADASTROS',path: '/clientes' },
  { id: 'pecas',     label: 'Peças e Serviços',   icon: 'box',       section: null,       path: '/pecas' },
  {
    type: 'group',
    id: 'financeiro',
    label: 'Financeiro',
    icon: 'cash',
    section: 'FINANCEIRO',
    children: [
      { id: 'contas-receber', label: 'Contas a Receber', path: '/financeiro/contas-a-receber' },
      { id: 'contas-pagar',   label: 'Contas a Pagar',   path: '/financeiro/contas-a-pagar', disabled: true, badge: 'Em breve' },
    ],
  },
  { id: 'relatorios', label: 'Relatórios',     icon: 'chart', section: null,      path: '/relatorios' },
  { id: 'config',     label: 'Configurações',  icon: 'gear',  section: 'SISTEMA', path: '/configuracoes' },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation()

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(location.pathname.startsWith('/financeiro') ? ['financeiro'] : [])
  )

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <aside
      style={{
        width: collapsed ? 56 : 220,
        background: '#111111',
        color: '#D8D6D2',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '16px 14px' : '18px 18px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
          cursor: 'pointer',
        }}
        onClick={onToggle}
        role="button"
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {collapsed ? (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 5,
              background: '#E31E2D',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="wrench" size={14} style={{ color: '#fff' }} />
          </div>
        ) : (
          <LogoFull />
        )}
      </div>

      {/* Nav */}
      <nav
        style={{
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          overflow: 'auto',
        }}
      >
        {NAV.map((entry, i) => {
          const prevEntry = NAV[i - 1]
          const showSection = entry.section && entry.section !== prevEntry?.section

          return (
            <div key={entry.id}>
              {showSection && !collapsed && (
                <div
                  style={{
                    padding: '14px 14px 6px',
                    fontSize: 9.5,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    color: '#6A6864',
                    textTransform: 'uppercase',
                  }}
                >
                  {entry.section}
                </div>
              )}
              {showSection && collapsed && i > 0 && (
                <div
                  style={{
                    height: 1,
                    background: 'rgba(255,255,255,0.06)',
                    margin: '8px 12px',
                  }}
                />
              )}

              {entry.type === 'group' ? (
                <GroupItem
                  entry={entry}
                  collapsed={collapsed}
                  expanded={expandedGroups.has(entry.id)}
                  location={location.pathname}
                  onToggle={() => collapsed ? onToggle?.() : toggleGroup(entry.id)}
                />
              ) : (
                <LinkItem entry={entry} collapsed={collapsed} location={location.pathname} />
              )}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Avatar name="Carlos Mendes" size={collapsed ? 26 : 30} tone="#3a3a3a" />
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Carlos Mendes
              </div>
              <div style={{ fontSize: 10.5, color: '#8A8884' }}>Gerente</div>
            </div>
            <button
              aria-label="Sair"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#8A8884',
                display: 'grid',
                placeItems: 'center',
                padding: 4,
                borderRadius: 4,
              }}
            >
              <Icon name="logout" size={14} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

// ─── LinkItem ─────────────────────────────────────────────────────────────────

function LinkItem({
  entry,
  collapsed,
  location,
}: {
  entry: NavLink
  collapsed: boolean
  location: string
}) {
  const isActive = location === entry.path ||
    (entry.path !== '/' && location.startsWith(entry.path))

  return (
    <Link
      to={entry.path}
      style={linkStyle(isActive, collapsed)}
      onMouseEnter={e => { if (!isActive) hoverOn(e.currentTarget as HTMLElement) }}
      onMouseLeave={e => { if (!isActive) hoverOff(e.currentTarget as HTMLElement) }}
      title={collapsed ? entry.label : undefined}
    >
      <span style={iconWrap(isActive)}>
        <Icon name={entry.icon} size={15} />
      </span>
      {!collapsed && <span>{entry.label}</span>}
    </Link>
  )
}

// ─── GroupItem ────────────────────────────────────────────────────────────────

function GroupItem({
  entry,
  collapsed,
  expanded,
  location,
  onToggle,
}: {
  entry: NavGroup
  collapsed: boolean
  expanded: boolean
  location: string
  onToggle: () => void
}) {
  const isGroupActive = entry.children.some(c => !c.disabled && location.startsWith(c.path))

  return (
    <div>
      {/* Group header button */}
      <button
        onClick={onToggle}
        style={{
          ...linkStyle(isGroupActive, collapsed),
          display: 'flex',
          width: '100%',
          background: isGroupActive ? 'rgba(227,30,45,0.14)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        } as React.CSSProperties}
        onMouseEnter={e => { if (!isGroupActive) hoverOn(e.currentTarget as HTMLElement) }}
        onMouseLeave={e => { if (!isGroupActive) hoverOff(e.currentTarget as HTMLElement) }}
        title={collapsed ? entry.label : undefined}
      >
        <span style={iconWrap(isGroupActive)}>
          <Icon name={entry.icon} size={15} />
        </span>
        {!collapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left' }}>{entry.label}</span>
            <Icon
              name={expanded ? 'chevron-down' : 'chevron'}
              size={11}
              style={{ color: '#6A6864', flexShrink: 0 }}
            />
          </>
        )}
      </button>

      {/* Children */}
      {expanded && !collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 1, paddingLeft: 8 }}>
          {entry.children.map(child => {
            const isActive = !child.disabled && location === child.path

            if (child.disabled) {
              return (
                <div
                  key={child.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px 6px 20px',
                    fontSize: 12,
                    color: '#4A4A48',
                    cursor: 'not-allowed',
                    borderRadius: 5,
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#4A4A48',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1 }}>{child.label}</span>
                  {child.badge && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#6A6864',
                        background: 'rgba(255,255,255,0.08)',
                        padding: '1px 5px',
                        borderRadius: 3,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {child.badge}
                    </span>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={child.id}
                to={child.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px 6px 20px',
                  fontSize: 12,
                  color: isActive ? '#fff' : '#B8B6B1',
                  background: isActive ? 'rgba(227,30,45,0.14)' : 'transparent',
                  textDecoration: 'none',
                  borderRadius: 5,
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) hoverOn(e.currentTarget as HTMLElement) }}
                onMouseLeave={e => { if (!isActive) hoverOff(e.currentTarget as HTMLElement) }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: isActive ? '#E31E2D' : '#4A4A48',
                    flexShrink: 0,
                  }}
                />
                {child.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function linkStyle(isActive: boolean, collapsed: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: collapsed ? '10px' : '8px 12px',
    borderRadius: 6,
    fontSize: 12.5,
    color: isActive ? '#fff' : '#B8B6B1',
    background: isActive ? 'rgba(227,30,45,0.14)' : 'transparent',
    textDecoration: 'none',
    justifyContent: collapsed ? 'center' : 'flex-start',
    transition: 'background 0.15s, color 0.15s',
  }
}

function iconWrap(isActive: boolean): React.CSSProperties {
  return {
    width: 16,
    height: 16,
    display: 'grid',
    placeItems: 'center',
    color: isActive ? '#E31E2D' : '#8C8A85',
    flexShrink: 0,
  }
}

function hoverOn(el: HTMLElement) {
  el.style.background = 'rgba(255,255,255,0.04)'
  el.style.color = '#fff'
}

function hoverOff(el: HTMLElement) {
  el.style.background = 'transparent'
  el.style.color = '#B8B6B1'
}
