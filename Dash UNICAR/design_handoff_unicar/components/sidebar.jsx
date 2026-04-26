// UNICAR — Sidebar component (shared across screens).

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', section: null },
  { id: 'os',        label: 'Ordens de Serviço', icon: 'wrench', section: 'OPERAÇÃO' },
  { id: 'orcamentos',label: 'Orçamentos', icon: 'doc' },
  { id: 'agenda',    label: 'Agenda', icon: 'calendar' },
  { id: 'clientes',  label: 'Clientes', icon: 'users', section: 'CADASTROS' },
  { id: 'veiculos',  label: 'Veículos', icon: 'car' },
  { id: 'pecas',     label: 'Peças e Serviços', icon: 'box' },
  { id: 'financeiro',label: 'Financeiro', icon: 'cash', section: 'FINANCEIRO' },
  { id: 'relatorios',label: 'Relatórios', icon: 'chart' },
  { id: 'config',    label: 'Configurações', icon: 'gear', section: 'SISTEMA' },
];

const Sidebar = ({ active = 'dashboard', collapsed = false, MarkComp = MarkSpeed }) => (
  <aside className={`wf-sidebar ${collapsed ? 'collapsed' : ''}`} style={{ width: collapsed ? 56 : 220 }}>
    <div className="wf-sidebar-logo">
      <div style={{ display:'grid', placeItems:'center', width: 30, height: 30, background:'#E31E2D', borderRadius: 5 }}>
        <MarkComp size={22} fill="#fff" secondary="#fff"/>
      </div>
      {!collapsed && <span className="name">UNI<span style={{color:'#E31E2D'}}>CAR</span></span>}
    </div>
    <nav>
      {NAV.map((item, i) => (
        <React.Fragment key={item.id}>
          {item.section && !collapsed && <div className="wf-nav-section">{item.section}</div>}
          {item.section && collapsed && i > 0 && <div style={{height:1, background:'rgba(255,255,255,0.06)', margin:'8px 12px'}}/>}
          <div className={`wf-nav-item ${item.id === active ? 'active' : ''}`}>
            <span className="ico"><Icon name={item.icon} size={15}/></span>
            <span>{item.label}</span>
          </div>
        </React.Fragment>
      ))}
    </nav>
    <div className="wf-sidebar-user">
      <Avatar name="Carlos Mendes" size={collapsed ? 26 : 30} tone="#3a3a3a"/>
      {!collapsed && (
        <div className="meta grow">
          <b>Carlos Mendes</b>
          <span>Gerente</span>
        </div>
      )}
      {!collapsed && <Icon name="logout" size={14} style={{color:'#8a8884'}}/>}
    </div>
  </aside>
);

Object.assign(window, { Sidebar, NAV });
