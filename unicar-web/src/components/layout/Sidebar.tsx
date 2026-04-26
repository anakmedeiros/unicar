import { Link, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../ui/Icon'
import { LogoFull } from '../ui/MarkSpeed'
import { Avatar } from '../ui/Avatar'

interface NavItem {
  id: string
  label: string
  icon: IconName
  section?: string | null
  path: string
}

const NAV: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',         icon: 'dashboard', section: null,       path: '/' },
  { id: 'os',         label: 'Ordens de Serviço', icon: 'wrench',    section: 'OPERAÇÃO', path: '/os' },
  { id: 'orcamentos', label: 'Orçamentos',         icon: 'doc',       section: null,       path: '/orcamentos' },
  { id: 'agenda',     label: 'Agenda',             icon: 'calendar',  section: null,       path: '/agenda' },
  { id: 'clientes',   label: 'Clientes',           icon: 'users',     section: 'CADASTROS',path: '/clientes' },
  { id: 'veiculos',   label: 'Veículos',           icon: 'car',       section: null,       path: '/veiculos' },
  { id: 'pecas',      label: 'Peças e Serviços',   icon: 'box',       section: null,       path: '/pecas' },
  { id: 'financeiro', label: 'Financeiro',         icon: 'cash',      section: 'FINANCEIRO', path: '/financeiro' },
  { id: 'relatorios', label: 'Relatórios',         icon: 'chart',     section: null,       path: '/relatorios' },
  { id: 'config',     label: 'Configurações',      icon: 'gear',      section: 'SISTEMA',  path: '/configuracoes' },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation()

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
        {NAV.map((item, i) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          const prevItem = NAV[i - 1]
          const showSection = item.section && item.section !== prevItem?.section

          return (
            <div key={item.id}>
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
                  {item.section}
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
              <Link
                to={item.path}
                style={{
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
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                    ;(e.currentTarget as HTMLElement).style.color = '#fff'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = '#B8B6B1'
                  }
                }}
                title={collapsed ? item.label : undefined}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    display: 'grid',
                    placeItems: 'center',
                    color: isActive ? '#E31E2D' : '#8C8A85',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={item.icon} size={15} />
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
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
