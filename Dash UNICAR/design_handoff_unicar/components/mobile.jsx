// UNICAR — Mobile screens (iPhone-ish, no full bezel — just rounded screen)

const MobileFrame = ({ children, label }) => (
  <div style={{display:'flex', flexDirection:'column', gap: 10, alignItems:'center'}}>
    <div className="wf-mobile">
      <div className="notch"/>
      <div className="screen">{children}</div>
    </div>
    {label && <div style={{fontFamily:'var(--hand)', color:'var(--red)', fontSize: 14}}>{label}</div>}
  </div>
);

const MobileTopBar = ({ title, back }) => (
  <div style={{padding:'40px 16px 12px', display:'flex', alignItems:'center', gap: 10, background:'#fff', borderBottom:'1px solid var(--line-3)'}}>
    {back && <Icon name="arrow-left" size={18}/>}
    <div style={{fontSize:15, fontWeight:700, flex:1}}>{title}</div>
    <Icon name="bell" size={17} style={{color:'var(--ink-3)'}}/>
  </div>
);

const MobileTabBar = ({ active = 'home' }) => (
  <div style={{display:'flex', borderTop:'1px solid var(--line-2)', background:'#fff', padding:'8px 0 22px'}}>
    {[
      { k:'home',  i:'dashboard', l:'Início' },
      { k:'os',    i:'wrench',    l:'OS' },
      { k:'novo',  i:'plus',      l:'', primary: true },
      { k:'cli',   i:'users',     l:'Clientes' },
      { k:'menu',  i:'menu',      l:'Mais' },
    ].map(t => (
      <div key={t.k} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap: 3, color: t.k === active ? 'var(--red)' : 'var(--ink-3)'}}>
        {t.primary
          ? <div style={{width:42, height:42, marginTop:-14, borderRadius:'50%', background:'var(--red)', color:'#fff', display:'grid', placeItems:'center'}}><Icon name={t.i} size={20}/></div>
          : <Icon name={t.i} size={18}/>}
        {t.l && <span style={{fontSize: 9.5, fontWeight: t.k === active ? 600 : 500}}>{t.l}</span>}
      </div>
    ))}
  </div>
);

const MobileDashboard = () => (
  <MobileFrame label="Dashboard mobile">
    <MobileTopBar title="Bom dia, Carlos"/>
    <div style={{flex:1, overflow:'auto', padding: 14, display:'flex', flexDirection:'column', gap: 12, background:'var(--paper-2)'}}>
      {/* Hero metric */}
      <div style={{background:'#111', color:'#fff', borderRadius:10, padding:16}}>
        <div style={{fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#999', fontWeight:600}}>Faturamento · Abril</div>
        <div style={{fontSize:24, fontWeight:800, marginTop:4}} className="tabular">R$ 84.620</div>
        <div style={{fontSize:11, color:'#10c466', fontWeight:600, marginTop:2}}>▲ 12% vs. março</div>
        <div style={{display:'flex', alignItems:'flex-end', gap:3, height:32, marginTop:12}}>
          {[40,55,38,62,48,70,52,68,72,65,80,84].map((h,i)=>(
            <div key={i} style={{flex:1, height:`${h}%`, background: i === 11 ? 'var(--red)' : '#444', borderRadius:'2px 2px 0 0'}}/>
          ))}
        </div>
      </div>
      {/* metric grid */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
        <div className="wf-card" style={{padding:12}}>
          <div style={{fontSize:10, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>OS abertas</div>
          <div style={{fontSize:20, fontWeight:700, marginTop:2}} className="tabular">14</div>
          <div style={{fontSize:10.5, color:'var(--red)', fontWeight:600}}>3 atrasadas</div>
        </div>
        <div className="wf-card" style={{padding:12}}>
          <div style={{fontSize:10, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Veículos</div>
          <div style={{fontSize:20, fontWeight:700, marginTop:2}} className="tabular">8</div>
          <div style={{fontSize:10.5, color:'var(--ink-3)'}}>2 prontos</div>
        </div>
      </div>
      {/* alerts */}
      <div className="wf-card" style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'10px 12px', borderBottom:'1px solid var(--line-3)', fontSize:12, fontWeight:700, display:'flex', justifyContent:'space-between'}}>
          <span>Pendências <span className="muted" style={{fontWeight:400}}>· 4</span></span>
          <span style={{color:'var(--red)', fontSize:11}}>Ver todas</span>
        </div>
        {[
          {i:'alert',c:'var(--red)',t:'OS-2615 atrasada',s:'Tech Logística · 3 dias'},
          {i:'box',c:'#b25e09',t:'Estoque baixo',s:'Filtro Mann W712 · 2 un.'},
          {i:'cash',c:'var(--red)',t:'Boleto vencido',s:'R$ 3.280 · Tech Log.'},
        ].map((a,j)=>(
          <div key={j} style={{display:'flex', gap:10, padding:'10px 12px', borderBottom:'1px solid var(--line-3)', alignItems:'center'}}>
            <div style={{width:26, height:26, borderRadius:5, background:'var(--fill)', color:a.c, display:'grid', placeItems:'center'}}><Icon name={a.i} size={13}/></div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:11.5, fontWeight:600}}>{a.t}</div>
              <div className="muted" style={{fontSize:10.5}}>{a.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <MobileTabBar active="home"/>
  </MobileFrame>
);

const MobileNovaOS = () => (
  <MobileFrame label="Nova OS · mobile (wizard)">
    <div style={{padding:'40px 16px 12px', background:'#fff', borderBottom:'1px solid var(--line-3)', display:'flex', alignItems:'center', gap: 10}}>
      <Icon name="arrow-left" size={18}/>
      <div style={{fontSize:15, fontWeight:700, flex:1}}>Nova OS</div>
      <span className="muted" style={{fontSize:11}}>3/4</span>
    </div>
    {/* progress */}
    <div style={{height:3, background:'var(--line-3)', position:'relative'}}>
      <div style={{position:'absolute', left:0, top:0, bottom:0, width:'75%', background:'var(--red)'}}/>
    </div>
    <div style={{flex:1, overflow:'auto', padding: 14, display:'flex', flexDirection:'column', gap: 12, background:'var(--paper-2)'}}>
      <div className="wf-card flat" style={{padding:'10px 12px', display:'flex', alignItems:'center', gap:10}}>
        <Avatar name="Marcos Lima" size={28}/>
        <div style={{flex:1, fontSize:12}}>
          <div style={{fontWeight:600}}>Marcos Lima</div>
          <div className="muted" style={{fontSize:10.5}}>VW Gol · ABC-1234 · 78.420 km</div>
        </div>
        <Icon name="edit" size={14} style={{color:'var(--ink-3)'}}/>
      </div>

      <div style={{fontSize:11, fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:4}}>Serviços (3)</div>
      {SERVICOS.slice(0,3).map((s,i)=>(
        <div key={i} className="wf-card" style={{padding:12}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
            <div style={{fontSize:12.5, fontWeight:600, lineHeight:1.4}}>{s.d}</div>
            <Icon name="trash" size={14} style={{color:'var(--ink-3)', flexShrink:0}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11.5}}>
            <span className="muted">{s.q} × {s.vu}</span>
            <span className="strong tabular">{s.vt}</span>
          </div>
        </div>
      ))}
      <button className="wf-btn" style={{justifyContent:'center', borderStyle:'dashed', color:'var(--red)'}}><Icon name="plus" size={13}/> Adicionar serviço</button>

      <div className="wf-card" style={{padding:14, background:'var(--fill)', borderColor:'var(--line-2)'}}>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--ink-2)', padding:'2px 0'}}><span>Subtotal</span><span className="tabular">R$ 1.330,00</span></div>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--red)', padding:'2px 0'}}><span>Desconto</span><span className="tabular">− R$ 30,00</span></div>
        <div style={{height:1, background:'var(--line-2)', margin:'6px 0'}}/>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontSize:12, fontWeight:700}}>Total</span>
          <span className="tabular" style={{fontSize:18, fontWeight:800, color:'var(--red)'}}>R$ 1.300,00</span>
        </div>
      </div>
    </div>
    <div style={{padding:'10px 14px 22px', background:'#fff', borderTop:'1px solid var(--line-2)', display:'flex', gap:8}}>
      <button className="wf-btn" style={{flex:1, justifyContent:'center'}}>Voltar</button>
      <button className="wf-btn primary" style={{flex:2, justifyContent:'center'}}>Continuar</button>
    </div>
  </MobileFrame>
);

const MobileFinanceiro = () => (
  <MobileFrame label="Financeiro · mobile">
    <MobileTopBar title="A Receber" back/>
    <div style={{flex:1, overflow:'auto', padding: 14, display:'flex', flexDirection:'column', gap: 12, background:'var(--paper-2)'}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
        <div className="wf-card" style={{padding:12}}>
          <div style={{fontSize:10, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Total</div>
          <div style={{fontSize:18, fontWeight:700, marginTop:2}} className="tabular">R$ 38.420</div>
        </div>
        <div className="wf-card" style={{padding:12, borderColor:'var(--red)'}}>
          <div style={{fontSize:10, fontWeight:600, color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Vencidos</div>
          <div style={{fontSize:18, fontWeight:700, marginTop:2, color:'var(--red)'}} className="tabular">R$ 6.180</div>
        </div>
      </div>

      <div style={{display:'flex', gap:6, overflowX:'auto'}}>
        <button className="wf-btn primary sm">Todos</button>
        <button className="wf-btn sm">Vencidos</button>
        <button className="wf-btn sm">Hoje</button>
        <button className="wf-btn sm">7 dias</button>
        <button className="wf-btn sm">Pagos</button>
      </div>

      {[
        { os:'#OS-2615', cli:'Tech Logística', val:'R$ 3.280,00', d:'Vencido há 2 dias', st:'late' },
        { os:'#OS-2641', cli:'Marcos Lima',    val:'R$ 1.450,00', d:'Vence hoje',         st:'due' },
        { os:'#OS-2638', cli:'Ana Castro',     val:'R$    920,00', d:'Vence em 3 dias',   st:'waiting' },
        { os:'#OS-2598', cli:'Patrícia Nunes', val:'R$    540,00', d:'Pago em 14/01',     st:'paid' },
      ].map(r => (
        <div key={r.os} className="wf-card" style={{padding:12, borderLeft: '3px solid', borderLeftColor: r.st==='late'?'var(--red)': r.st==='due'?'#f59e0b': r.st==='paid'?'#10884a':'var(--line)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <div>
              <div style={{fontSize:12.5, fontWeight:600}}>{r.cli}</div>
              <div className="muted tabular" style={{fontSize:10.5, marginTop:2}}>{r.os}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="tabular strong" style={{fontSize:13}}>{r.val}</div>
              <div style={{fontSize:10.5, marginTop:2,
                color: r.st==='late'?'var(--red)': r.st==='due'?'#b25e09': r.st==='paid'?'#0d6e3d':'var(--ink-3)',
                fontWeight: 600}}>{r.d}</div>
            </div>
          </div>
          {r.st !== 'paid' && (
            <div style={{display:'flex', gap:6, marginTop:10}}>
              <button className="wf-btn sm" style={{flex:1, justifyContent:'center'}}><Icon name="whatsapp" size={11} style={{color:'#10884a'}}/> Lembrar</button>
              <button className="wf-btn primary sm" style={{flex:1, justifyContent:'center'}}>Receber</button>
            </div>
          )}
        </div>
      ))}
    </div>
    <MobileTabBar active="os"/>
  </MobileFrame>
);

Object.assign(window, { MobileDashboard, MobileNovaOS, MobileFinanceiro, MobileFrame });
