// UNICAR — Dashboard (3 variações).
// V1: clássico (cards horizontais + tabela + side alerts)
// V2: data-dense (tabela protagonista, métricas inline)
// V3: kanban-first (status board de OS por coluna)

const MOCK_OS = [
  { num: '#OS-2641', cliente: 'Marcos Lima',     veiculo: 'VW Gol G6 · ABC-1234', servico: 'Revisão 40k + Troca de óleo', tec: 'Rafael S.',    status: 'progress', valor: 'R$ 1.450,00' },
  { num: '#OS-2640', cliente: 'Juliana Pereira', veiculo: 'Honda Civic · DEF-5678', servico: 'Alinhamento + Balanceamento', tec: 'Anderson C.', status: 'open',     valor: 'R$    480,00' },
  { num: '#OS-2639', cliente: 'Tech Logística',  veiculo: 'Ford Cargo · MEC-2K33',  servico: 'Diagnóstico motor diesel',    tec: 'Bruno T.',     status: 'waiting',  valor: 'R$    350,00' },
  { num: '#OS-2638', cliente: 'Ana Castro',      veiculo: 'Fiat Argo · QFR-9182', servico: 'Troca de pastilhas + discos',  tec: 'Rafael S.',    status: 'progress', valor: 'R$    920,00' },
  { num: '#OS-2637', cliente: 'Eduardo Souza',   veiculo: 'Toyota Hilux · TAU-7H88', servico: 'Suspensão dianteira completa', tec: 'Anderson C.', status: 'open',  valor: 'R$ 3.280,00' },
  { num: '#OS-2636', cliente: 'Mariana Reis',    veiculo: 'Hyundai HB20 · NPE-4421', servico: 'Troca de embreagem',         tec: 'Bruno T.',     status: 'progress', valor: 'R$ 2.140,00' },
];

const STATUS_LABEL = { open:'Aberta', progress:'Em execução', waiting:'Aguardando peça', done:'Concluída' };

const TopBar = ({ title, subtitle, showActions = true }) => (
  <div className="wf-topbar">
    <div className="crumbs">
      <Icon name="calendar" size={14}/>
      <span>Sábado, 25 de abril</span>
      <span className="dot-sep"/>
      <b>{title}</b>
      {subtitle && <><span className="dot-sep"/><span>{subtitle}</span></>}
    </div>
    <div className="actions">
      <div style={{position:'relative', marginRight: 8}}>
        <Icon name="search" size={14} style={{position:'absolute', left: 9, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
        <input className="input" placeholder="Buscar OS, cliente, placa…" style={{width:240, paddingLeft: 30, height: 32}}/>
      </div>
      <button className="wf-btn ghost" title="Notificações"><Icon name="bell" size={15}/></button>
      {showActions && <>
        <button className="wf-btn"><Icon name="doc" size={13}/> Orçamento</button>
        <button className="wf-btn primary"><Icon name="plus" size={13}/> Nova OS</button>
      </>}
    </div>
  </div>
);

const MetricCard = ({ label, value, sub, icon, accent, progress }) => (
  <div className="wf-card wf-metric">
    <div className="label">
      {label}
      {icon && <Icon name={icon} size={14} style={{ color: accent || 'var(--ink-3)' }}/>}
    </div>
    <div className="value">{value}</div>
    {progress != null && (
      <div style={{ marginTop: 10 }}>
        <div className="wf-progress"><span style={{ width: `${progress}%` }}/></div>
        <div className="sub" style={{ marginTop: 6 }}>{sub}</div>
      </div>
    )}
    {progress == null && sub && <div className="sub">{sub}</div>}
  </div>
);

const OSTable = ({ rows = MOCK_OS, compact = false }) => (
  <table className="wf-table">
    <thead>
      <tr>
        <th style={{width: 90}}>OS</th>
        <th>Cliente / Veículo</th>
        <th>Serviço</th>
        <th style={{width: 120}}>Resp.</th>
        <th style={{width: 130}}>Status</th>
        <th style={{width: 110, textAlign:'right'}}>Valor</th>
        <th style={{width: 30}}></th>
      </tr>
    </thead>
    <tbody>
      {rows.map(r => (
        <tr key={r.num}>
          <td className="strong tabular">{r.num}</td>
          <td>
            <div style={{fontWeight:600}}>{r.cliente}</div>
            <div className="muted" style={{fontSize:11}}>{r.veiculo}</div>
          </td>
          <td>{r.servico}</td>
          <td>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <Avatar name={r.tec} size={20}/>
              {!compact && <span style={{fontSize:11.5}}>{r.tec}</span>}
            </div>
          </td>
          <td><StatusPill kind={r.status}>{STATUS_LABEL[r.status]}</StatusPill></td>
          <td className="tabular strong" style={{textAlign:'right'}}>{r.valor}</td>
          <td><Icon name="dots" size={14} style={{color:'var(--ink-3)'}}/></td>
        </tr>
      ))}
    </tbody>
  </table>
);

const AlertList = () => (
  <div className="wf-card" style={{padding: 0, overflow:'hidden'}}>
    <div style={{padding:'14px 16px', borderBottom:'1px solid var(--line-3)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
      <div style={{fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8}}>
        <Icon name="alert" size={14} style={{color:'var(--red)'}}/>
        Alertas e pendências
      </div>
      <span className="muted" style={{fontSize:11}}>4</span>
    </div>
    {[
      { icon: 'alert', tone:'red',  title:'OS-2615 atrasada 3 dias', sub:'Aguardando aprovação do cliente desde 22/abr', time:'há 2h' },
      { icon: 'box',   tone:'amber',title:'Estoque baixo — Filtro de óleo Mann W712', sub:'2 unidades restantes', time:'há 5h' },
      { icon: 'cash',  tone:'red',  title:'Boleto vencido — Tech Logística', sub:'R$ 3.280,00 vencido em 23/abr', time:'ontem' },
      { icon: 'flag',  tone:'amber',title:'Aprovação pendente — Orçamento #ORC-1182', sub:'Cliente: Eduardo Souza', time:'ontem' },
    ].map((a, i) => (
      <div key={i} style={{display:'flex', gap: 10, padding:'12px 16px', borderBottom:'1px solid var(--line-3)'}}>
        <div style={{
          width: 28, height: 28, flexShrink:0, borderRadius: 6,
          background: a.tone === 'red' ? 'rgba(227,30,45,0.10)' : 'rgba(245,158,11,0.14)',
          color: a.tone === 'red' ? 'var(--red)' : '#b25e09',
          display:'grid', placeItems:'center'
        }}>
          <Icon name={a.icon} size={14}/>
        </div>
        <div className="grow">
          <div style={{fontSize:12, fontWeight:600}}>{a.title}</div>
          <div className="muted" style={{fontSize:11, marginTop:2}}>{a.sub}</div>
        </div>
        <div className="muted" style={{fontSize:10.5, whiteSpace:'nowrap'}}>{a.time}</div>
      </div>
    ))}
  </div>
);

const ReceberCard = () => (
  <div className="wf-card" style={{padding: 0, overflow:'hidden'}}>
    <div style={{padding:'14px 16px', borderBottom:'1px solid var(--line-3)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
      <div style={{fontWeight:700, fontSize:13}}>A receber esta semana</div>
      <span className="muted tabular" style={{fontSize:11}}>R$ 14.820</span>
    </div>
    {[
      { cli:'Marcos Lima',     val:'R$ 1.450,00', day:'Hoje', d: 0 },
      { cli:'Tech Logística',  val:'R$ 3.280,00', day:'Amanhã', d: 1 },
      { cli:'Ana Castro',      val:'R$    920,00', day:'Qua, 28/04', d: 3 },
      { cli:'Eduardo Souza',   val:'R$ 3.280,00', day:'Sex, 30/04', d: 5 },
    ].map((r,i) => (
      <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:'1px solid var(--line-3)'}}>
        <DayPill days={r.d}/>
        <div className="grow">
          <div style={{fontSize:12, fontWeight:600}}>{r.cli}</div>
          <div className="muted" style={{fontSize:11}}>{r.day}</div>
        </div>
        <div className="tabular strong" style={{fontSize:12}}>{r.val}</div>
      </div>
    ))}
  </div>
);

const VeiculosCard = () => (
  <div className="wf-card" style={{padding: 0, overflow:'hidden'}}>
    <div style={{padding:'14px 16px', borderBottom:'1px solid var(--line-3)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
      <div style={{fontWeight:700, fontSize:13}}>Veículos na oficina</div>
      <span className="muted tabular" style={{fontSize:11}}>8 ativos</span>
    </div>
    {[
      { mod:'VW Gol G6',     plc:'ABC-1234', sta:'Em execução', d: 1 },
      { mod:'Honda Civic',   plc:'DEF-5678', sta:'Aguardando peça', d: 4 },
      { mod:'Ford Cargo',    plc:'MEC-2K33', sta:'Diagnóstico', d: 2 },
      { mod:'Toyota Hilux',  plc:'TAU-7H88', sta:'Aguardando aprov.', d: 6 },
    ].map((r,i) => (
      <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:'1px solid var(--line-3)'}}>
        <div style={{
          width: 32, height: 32, borderRadius: 5, background:'var(--fill)',
          display:'grid', placeItems:'center', color:'var(--ink-2)'
        }}>
          <Icon name="car" size={16}/>
        </div>
        <div className="grow">
          <div style={{fontSize:12, fontWeight:600}}>{r.mod} · <span className="muted tabular">{r.plc}</span></div>
          <div className="muted" style={{fontSize:11}}>{r.sta}</div>
        </div>
        <DayPill days={r.d}/>
      </div>
    ))}
  </div>
);

// ───────── Variações ─────────

const DashboardV1 = ({ collapsed, density }) => (
  <div className={`wf-frame density-${density || 'regular'}`} style={{display:'flex', width: 1280, height: 820}}>
    <Sidebar active="dashboard" collapsed={collapsed}/>
    <div className="grow" style={{display:'flex', flexDirection:'column', minWidth:0, background:'var(--paper-2)'}}>
      <TopBar title="Dashboard"/>
      <div style={{padding: 20, display:'flex', flexDirection:'column', gap: 16, overflow:'hidden'}}>
        {/* metrics row */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 12}}>
          <MetricCard label="OS abertas"        value="14" sub="3 atrasadas"        icon="wrench" accent="var(--red)"/>
          <MetricCard label="Veículos na oficina" value="8" sub="2 prontos p/ retirada" icon="car"/>
          <MetricCard label="Faturamento mês"   value="R$ 84.620" sub={<><span className="delta-up">▲ 12%</span> vs. março</>} icon="cash" accent="#10884a"/>
          <MetricCard label="A receber semana"  value="R$ 14.820" sub="4 boletos" icon="calendar"/>
          <MetricCard label="OS concluídas"     value="62 / 80" sub="78% da meta mensal" icon="check" progress={78}/>
        </div>
        {/* main grid */}
        <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 320px', gap: 16, flex:1, minHeight:0}}>
          <div className="wf-card" style={{padding: 0, display:'flex', flexDirection:'column', minHeight:0}}>
            <div className="wf-section-h">
              <h2>Ordens de Serviço abertas</h2>
              <div className="meta" style={{display:'flex', alignItems:'center', gap: 10}}>
                <button className="wf-btn sm"><Icon name="filter" size={12}/> Filtros</button>
                <span>14 itens</span>
              </div>
            </div>
            <div style={{flex:1, overflow:'auto'}}>
              <OSTable/>
            </div>
          </div>
          <AlertList/>
        </div>
        {/* footer cards */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
          <ReceberCard/>
          <VeiculosCard/>
        </div>
      </div>
    </div>

    {/* annotations */}
    <Note x={236} y={12} n={1}>Sidebar escura, navegação por seções</Note>
    <Note x={830} y={62} n={2}>Botão "Nova OS" sempre visível (vermelho)</Note>
    <Note x={28}  y={150} n={3}>5 métricas-chave, 1 com barra de progresso</Note>
    <Note x={950} y={210} n={4}>Lateral de alertas com tone color</Note>
    <Note x={28}  y={680} n={5}>Cards de "a receber" e "veículos" usam day-pills (verde / laranja / vermelho)</Note>
  </div>
);

const DashboardV2 = ({ collapsed, density }) => (
  // Variação data-dense: métricas como linha-única, tabela protagonista,
  // alerts colapsam para barra inferior
  <div className={`wf-frame density-${density || 'compact'}`} style={{display:'flex', width: 1280, height: 820}}>
    <Sidebar active="dashboard" collapsed={collapsed}/>
    <div className="grow" style={{display:'flex', flexDirection:'column', minWidth:0, background:'var(--paper-2)'}}>
      <TopBar title="Dashboard" subtitle="Visão operacional"/>
      <div style={{padding: 16, display:'flex', flexDirection:'column', gap: 12, flex:1, minHeight:0}}>
        {/* compact metrics inline */}
        <div className="wf-card" style={{padding: 0}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(6, 1fr)'}}>
            {[
              { l:'OS abertas',       v:'14',          d:'3 atrasadas',        a:'red' },
              { l:'Em execução',      v:'6',           d:'4 técnicos ativos',  a:'amber' },
              { l:'Aguard. peça',     v:'3',           d:'2 fornecedores',     a:'amber' },
              { l:'Concluídas (mês)', v:'62',          d:'meta 80 (78%)',      a:'green' },
              { l:'Faturamento',      v:'R$ 84,6k',    d:'▲ 12% vs março',     a:'green' },
              { l:'A receber',        v:'R$ 14,8k',    d:'4 boletos / 7 dias', a:'red' },
            ].map((m,i) => (
              <div key={i} style={{
                padding:'14px 16px',
                borderRight: i < 5 ? '1px solid var(--line-3)' : 'none',
                position:'relative'
              }}>
                <div style={{
                  position:'absolute', left: 0, top: 14, bottom: 14, width: 3,
                  background: m.a === 'red' ? 'var(--red)' : m.a === 'amber' ? '#f59e0b' : '#10884a'
                }}/>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.06em', color:'var(--ink-3)', textTransform:'uppercase' }}>{m.l}</div>
                <div style={{fontSize: 19, fontWeight:700, marginTop: 4, letterSpacing:'-0.02em'}} className="tabular">{m.v}</div>
                <div className="muted" style={{fontSize:10.5, marginTop: 2}}>{m.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* main split: large table | compact alerts */}
        <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 280px', gap: 12, flex:1, minHeight:0}}>
          <div className="wf-card" style={{padding: 0, display:'flex', flexDirection:'column', minHeight:0}}>
            <div className="wf-section-h" style={{padding:'10px 16px'}}>
              <h2 style={{fontSize: 14}}>OS abertas <span className="muted" style={{fontWeight:400, fontSize:11}}>· 14 itens</span></h2>
              <div className="meta" style={{display:'flex', alignItems:'center', gap: 6}}>
                <button className="wf-btn sm">Todos</button>
                <button className="wf-btn sm">Hoje</button>
                <button className="wf-btn sm">Atrasadas</button>
                <button className="wf-btn sm"><Icon name="filter" size={11}/></button>
              </div>
            </div>
            <div style={{flex:1, overflow:'auto'}}><OSTable compact/></div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap: 12, minHeight:0}}>
            <AlertList/>
            <ReceberCard/>
          </div>
        </div>
      </div>
    </div>

    <Note x={236} y={56} n={1}>Métricas como uma faixa de 6 colunas com indicador de cor lateral</Note>
    <Note x={28}  y={130} n={2}>Tom da barra lateral indica gravidade</Note>
    <Note x={28}  y={230} n={3}>Tabela protagonista, ocupa 2/3 da tela</Note>
    <Note x={950} y={250} n={4}>Alertas + a receber empilhados na lateral</Note>
  </div>
);

const DashboardV3 = ({ collapsed, density }) => {
  // Kanban: colunas por status
  const cols = [
    { k:'open',     title:'Abertas',         tone:'#c0192a', bg:'rgba(227,30,45,0.05)' },
    { k:'progress', title:'Em execução',     tone:'#b25e09', bg:'rgba(245,158,11,0.06)' },
    { k:'waiting',  title:'Aguardando peça', tone:'#4f46d6', bg:'rgba(99,102,241,0.05)' },
    { k:'done',     title:'Prontas',         tone:'#0d6e3d', bg:'rgba(16,136,74,0.05)' },
  ];
  const byStatus = (k) => MOCK_OS.filter(o => o.status === k).concat(
    k === 'done' ? [
      { num:'#OS-2630', cliente:'Patrícia Nunes', veiculo:'Renault Kwid · KWD-9911', servico:'Troca de bateria', tec:'Rafael S.', status:'done', valor:'R$ 540,00' },
      { num:'#OS-2628', cliente:'Logística Sul', veiculo:'Iveco Daily · LOG-3K22', servico:'Revisão diesel', tec:'Bruno T.', status:'done', valor:'R$ 1.890,00' },
    ] : []
  );

  return (
    <div className={`wf-frame density-${density || 'regular'}`} style={{display:'flex', width: 1280, height: 820}}>
      <Sidebar active="dashboard" collapsed={collapsed}/>
      <div className="grow" style={{display:'flex', flexDirection:'column', minWidth:0, background:'var(--paper-2)'}}>
        <TopBar title="Dashboard" subtitle="Quadro de OS"/>
        <div style={{padding: 16, display:'flex', flexDirection:'column', gap: 12, flex:1, minHeight:0}}>
          {/* Top hero: faturamento + gráfico simples */}
          <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap: 12}}>
            <div className="wf-card" style={{padding: 16, display:'flex', flexDirection:'column', gap: 10}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div className="muted" style={{fontSize:10.5, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase'}}>Faturamento · Abril</div>
                  <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.02em', marginTop: 4}} className="tabular">R$ 84.620</div>
                  <div style={{fontSize:11, color:'#10884a', fontWeight:600, marginTop: 2}}>▲ 12% vs. março</div>
                </div>
                <button className="wf-btn sm">Mês ▾</button>
              </div>
              {/* mini bar chart */}
              <div style={{display:'flex', alignItems:'flex-end', gap: 4, height: 50, marginTop: 6}}>
                {[40,55,38,62,48,70,52,68,72,65,80,84].map((h,i)=>(
                  <div key={i} style={{flex:1, height:`${h}%`, background: i === 11 ? 'var(--red)' : 'var(--line)', borderRadius:'2px 2px 0 0'}}/>
                ))}
              </div>
            </div>
            <MetricCard label="OS concluídas"  value="62 / 80" sub="78% da meta" icon="check" progress={78}/>
            <MetricCard label="Veículos ativos" value="8" sub="2 prontos retirada" icon="car"/>
            <MetricCard label="A receber"      value="R$ 14,8k" sub="4 boletos / 7 dias" icon="cash" accent="var(--red)"/>
          </div>

          {/* Kanban */}
          <div className="wf-card" style={{padding: 0, display:'flex', flexDirection:'column', minHeight:0, flex:1}}>
            <div className="wf-section-h">
              <h2>Quadro de Ordens de Serviço</h2>
              <div className="meta" style={{display:'flex', alignItems:'center', gap: 8}}>
                <button className="wf-btn sm">Hoje</button>
                <button className="wf-btn sm">Por técnico</button>
                <button className="wf-btn sm"><Icon name="filter" size={12}/></button>
              </div>
            </div>
            <div style={{flex:1, overflow:'hidden', padding: 12, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10}}>
              {cols.map(col => (
                <div key={col.k} style={{display:'flex', flexDirection:'column', gap: 8, minHeight:0, background: col.bg, borderRadius: 6, padding: 10}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <div style={{display:'flex', alignItems:'center', gap: 6, fontSize: 12, fontWeight: 700, color: col.tone}}>
                      <span style={{width:7, height:7, borderRadius:'50%', background: col.tone}}/>
                      {col.title}
                    </div>
                    <span className="muted" style={{fontSize: 11}}>{byStatus(col.k).length}</span>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:8, overflow:'auto'}}>
                    {byStatus(col.k).map(o => (
                      <div key={o.num} className="wf-card" style={{padding: 10}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span className="strong tabular" style={{fontSize:11.5}}>{o.num}</span>
                          <Avatar name={o.tec} size={18}/>
                        </div>
                        <div style={{fontSize:12, fontWeight:600, marginTop: 4}}>{o.cliente}</div>
                        <div className="muted" style={{fontSize:10.5}}>{o.veiculo}</div>
                        <div style={{fontSize:11, marginTop: 6, color:'var(--ink-2)'}}>{o.servico}</div>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 8, paddingTop: 8, borderTop:'1px solid var(--line-3)'}}>
                          <span className="muted" style={{fontSize:10.5}}>há 2d</span>
                          <span className="tabular" style={{fontSize:11.5, fontWeight:700}}>{o.valor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Note x={236} y={56} n={1}>Hero com faturamento + mini-gráfico de barras</Note>
      <Note x={28}  y={210} n={2}>Quadro Kanban: 4 colunas de status, drag-and-drop para mudar OS de coluna</Note>
      <Note x={950} y={400} n={3}>Cards compactos com OS, valor e técnico</Note>
    </div>
  );
};

Object.assign(window, { DashboardV1, DashboardV2, DashboardV3, TopBar, OSTable, MetricCard, AlertList, ReceberCard, VeiculosCard, MOCK_OS, STATUS_LABEL });
