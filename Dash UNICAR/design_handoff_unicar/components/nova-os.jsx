// UNICAR — Nova Ordem de Serviço (3 variações)
// V1: Modal full-screen (overlay sobre dashboard)
// V2: Página inteira com painéis lado a lado
// V3: Wizard em 4 etapas

const SERVICOS = [
  { d: 'Troca de óleo motor + filtro',         q: 1, vu: 'R$ 180,00', vt: 'R$ 180,00' },
  { d: 'Revisão completa 40.000 km',           q: 1, vu: 'R$ 480,00', vt: 'R$ 480,00' },
  { d: 'Alinhamento + Balanceamento',          q: 1, vu: 'R$ 220,00', vt: 'R$ 220,00' },
];

const PECAS = [
  { c: '7891234001', d: 'Óleo Mobil Super 5W30 1L',     q: 4, v: 'R$ 42,00',  t: 'R$ 168,00' },
  { c: '7891234112', d: 'Filtro de óleo Mann W712/52',  q: 1, v: 'R$ 38,00',  t: 'R$ 38,00'  },
  { c: '7891234208', d: 'Filtro de ar Tecfil ARS-7522', q: 1, v: 'R$ 64,00',  t: 'R$ 64,00'  },
  { c: '7891234411', d: 'Pastilha de freio dianteira',  q: 1, v: 'R$ 180,00', t: 'R$ 180,00' },
];

const TotalsBlock = ({ compact = false }) => (
  <div className="wf-card" style={{ padding: compact ? 14 : 18, background:'var(--fill)', borderColor:'var(--line-2)' }}>
    {[
      ['Subtotal serviços', 'R$    880,00'],
      ['Subtotal peças',    'R$    450,00'],
      ['Desconto',          '− R$ 30,00', 'var(--red)'],
    ].map(([l, v, c], i) => (
      <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize: 12.5, color: c || 'var(--ink-2)'}}>
        <span>{l}</span><span className="tabular">{v}</span>
      </div>
    ))}
    <div style={{height:1, background:'var(--line-2)', margin:'8px 0'}}/>
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <span style={{fontSize: 12.5, fontWeight:600}}>Total geral</span>
      <span className="tabular" style={{fontSize: 22, fontWeight:800, color:'var(--red)'}}>R$ 1.300,00</span>
    </div>
  </div>
);

const ItemTable = ({ rows, columns, addLabel }) => (
  <div style={{ border: '1px solid var(--line-2)', borderRadius: 6, overflow: 'hidden' }}>
    <table className="wf-table">
      <thead>
        <tr>
          {columns.map((c, i) => <th key={i} style={c.style}>{c.label}</th>)}
          <th style={{width: 30}}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {columns.map((c, j) => <td key={j} style={c.tdStyle} className={c.cls || ''}>{r[c.key]}</td>)}
            <td><Icon name="trash" size={13} style={{color:'var(--ink-3)'}}/></td>
          </tr>
        ))}
        <tr>
          <td colSpan={columns.length + 1} style={{padding: 0}}>
            <button className="wf-btn ghost" style={{width:'100%', justifyContent:'center', borderRadius: 0, padding:'10px 12px', color:'var(--red)', fontWeight:600, borderTop:'1px dashed var(--line)'}}>
              <Icon name="plus" size={13}/> {addLabel}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const NovaOSForm = ({ density, layout = 'twoCol' }) => {
  const SERV_COLS = [
    { key: 'd', label: 'Descrição' },
    { key: 'q', label: 'Qtd', style:{width: 60, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular' },
    { key: 'vu', label: 'Valor unit.', style:{width:110, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular' },
    { key: 'vt', label: 'Total', style:{width:110, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular strong' },
  ];
  const PEC_COLS = [
    { key: 'c', label: 'Código', style:{width:120}, cls:'tabular muted' },
    { key: 'd', label: 'Descrição' },
    { key: 'q', label: 'Qtd', style:{width:60, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular' },
    { key: 'v', label: 'Unit.', style:{width:90, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular' },
    { key: 't', label: 'Total', style:{width:100, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular strong' },
  ];

  if (layout === 'twoCol') {
    return (
      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 320px', gap: 16, padding: 20 }}>
        <div style={{display:'flex', flexDirection:'column', gap: 16, minWidth:0}}>
          {/* Identificação */}
          <div className="wf-card">
            <h3 style={{margin:'0 0 14px', fontSize:13, fontWeight:700}}>Identificação</h3>
            <div style={{display:'grid', gridTemplateColumns:'140px 160px 1fr 200px', gap: 12}}>
              <div className="field"><label>Nº OS</label><input className="input tabular" defaultValue="#OS-2642" disabled/></div>
              <div className="field"><label>Data</label><input className="input" defaultValue="25/04/2026"/></div>
              <div className="field">
                <label>Cliente <span className="req">*</span></label>
                <div className="input-group">
                  <Icon name="search" size={13} className="ico"/>
                  <input className="input" defaultValue="Marcos Lima"/>
                </div>
              </div>
              <div className="field"><label>Status</label>
                <select className="select"><option>Rascunho</option><option>Aberta</option><option>Em execução</option></select>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 140px 1fr 200px', gap: 12, marginTop: 12}}>
              <div className="field"><label>Veículo</label>
                <select className="select"><option>VW Gol G6 · ABC-1234 · 2018 · Branco</option></select>
              </div>
              <div className="field"><label>Km atual</label><input className="input tabular" defaultValue="78.420"/></div>
              <div className="field"><label>Tipo de serviço</label>
                <select className="select"><option>Revisão preventiva</option><option>Reparo corretivo</option><option>Diagnóstico</option></select>
              </div>
              <div className="field"><label>Prazo estimado</label><input className="input" defaultValue="28/04/2026"/></div>
            </div>
            <div className="field" style={{marginTop: 12}}>
              <label>Problema relatado pelo cliente</label>
              <textarea className="textarea" defaultValue={'Cliente relata barulho na suspensão dianteira em lombadas e ao fazer curvas. Pediu também troca de óleo e revisão dos 40k km.'}/>
            </div>
          </div>

          {/* Serviços */}
          <div className="wf-card">
            <h3 style={{margin:'0 0 14px', fontSize:13, fontWeight:700, display:'flex', justifyContent:'space-between'}}>
              <span>Serviços</span>
              <span className="muted" style={{fontSize:11, fontWeight:400}}>{SERVICOS.length} itens</span>
            </h3>
            <ItemTable rows={SERVICOS} columns={SERV_COLS} addLabel="Adicionar serviço"/>
          </div>

          {/* Peças */}
          <div className="wf-card">
            <h3 style={{margin:'0 0 14px', fontSize:13, fontWeight:700, display:'flex', justifyContent:'space-between'}}>
              <span>Peças utilizadas</span>
              <span className="muted" style={{fontSize:11, fontWeight:400}}>{PECAS.length} itens · estoque OK</span>
            </h3>
            <ItemTable rows={PECAS} columns={PEC_COLS} addLabel="Adicionar peça do estoque"/>
          </div>

          <div className="wf-card">
            <h3 style={{margin:'0 0 8px', fontSize:13, fontWeight:700}}>Observações internas</h3>
            <textarea className="textarea" placeholder="Visível apenas para a equipe…" defaultValue={'Cliente prefere ser contatado por WhatsApp. Veículo já é cliente recorrente.'}/>
          </div>
        </div>

        {/* Right column */}
        <div style={{display:'flex', flexDirection:'column', gap: 16, position:'sticky', top: 16, alignSelf:'start'}}>
          <TotalsBlock/>

          <div className="wf-card">
            <h3 style={{margin:'0 0 12px', fontSize:13, fontWeight:700}}>Equipe e prazo</h3>
            <div className="field" style={{marginBottom: 10}}>
              <label>Técnico responsável</label>
              <div className="input-group">
                <Avatar name="Rafael Souza" size={20}/>
                <input className="input" style={{paddingLeft: 34}} defaultValue="Rafael Souza"/>
              </div>
            </div>
            <div className="field" style={{marginBottom: 10}}>
              <label>Auxiliares</label>
              <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
                <span className="pill draft"><Avatar name="Bruno Tavares" size={14}/> Bruno T. ×</span>
                <span className="pill draft"><Avatar name="Anderson Cruz" size={14}/> Anderson C. ×</span>
                <button className="wf-btn sm ghost"><Icon name="plus" size={11}/></button>
              </div>
            </div>
            <div className="field"><label>Garantia (dias)</label><input className="input tabular" defaultValue="90"/></div>
          </div>

          <div className="wf-card flat">
            <div style={{fontSize:11, fontWeight:600, color:'var(--ink-2)', marginBottom: 6}}>Histórico do veículo</div>
            <div style={{fontSize:11.5, color:'var(--ink-2)', lineHeight: 1.6}}>
              <div>• <span className="tabular">12/01/2026</span> · Troca de bateria</div>
              <div>• <span className="tabular">08/09/2025</span> · Revisão 30k km</div>
              <div>• <span className="tabular">21/04/2025</span> · Pastilhas de freio</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// ───── V1: MODAL ─────
const NovaOSModal = ({ collapsed, density }) => (
  <div className={`wf-frame density-${density || 'regular'}`} style={{position:'relative', width: 1280, height: 820, overflow:'hidden'}}>
    {/* dimmed dashboard behind */}
    <div style={{position:'absolute', inset: 0, filter:'blur(2px) brightness(0.95)', opacity: 0.5, pointerEvents:'none'}}>
      <DashboardV1 collapsed={collapsed} density={density}/>
    </div>
    <div style={{position:'absolute', inset:0, background:'rgba(20,20,20,0.45)'}}/>

    {/* modal */}
    <div style={{
      position:'absolute', left: 60, right: 60, top: 30, bottom: 30,
      background:'var(--paper)', borderRadius: 8,
      boxShadow:'0 24px 80px rgba(0,0,0,0.30)',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      <div style={{
        padding:'14px 20px', borderBottom:'1px solid var(--line-2)',
        display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff',
      }}>
        <div>
          <div style={{fontSize:15, fontWeight:700}}>Nova Ordem de Serviço</div>
          <div className="muted" style={{fontSize:11.5}}>Rascunho · auto-salvo há 3s</div>
        </div>
        <div style={{display:'flex', gap: 8, alignItems:'center'}}>
          <button className="wf-btn">Salvar rascunho</button>
          <button className="wf-btn"><Icon name="doc" size={13}/> Gerar Orçamento</button>
          <button className="wf-btn primary"><Icon name="wrench" size={13}/> Iniciar OS</button>
          <button className="wf-btn ghost" style={{padding:'6px 8px'}}>✕</button>
        </div>
      </div>
      <div style={{flex:1, overflow:'auto', background:'var(--paper-2)'}}>
        <NovaOSForm density={density}/>
      </div>
    </div>

    <Note x={70}  y={56} n={1}>Modal ocupa quase toda a tela mas mantém contexto do dashboard atrás (esmaecido)</Note>
    <Note x={750} y={56} n={2}>Ações ficam no topo e sempre visíveis</Note>
    <Note x={70}  y={460} n={3}>Painel direito sticky: totais + equipe</Note>
  </div>
);

// ───── V2: PÁGINA INTEIRA ─────
const NovaOSPage = ({ collapsed, density }) => (
  <div className={`wf-frame density-${density || 'regular'}`} style={{display:'flex', width: 1280, height: 820}}>
    <Sidebar active="os" collapsed={collapsed}/>
    <div className="grow" style={{display:'flex', flexDirection:'column', minWidth:0, background:'var(--paper-2)'}}>
      <div className="wf-topbar">
        <div className="crumbs">
          <Icon name="arrow-left" size={14}/>
          <span>Ordens de Serviço</span>
          <span className="dot-sep"/>
          <b>Nova OS · Rascunho #OS-2642</b>
        </div>
        <div className="actions">
          <span className="muted" style={{fontSize:11}}>Auto-salvo há 3s</span>
          <button className="wf-btn">Salvar rascunho</button>
          <button className="wf-btn"><Icon name="doc" size={13}/> Gerar Orçamento</button>
          <button className="wf-btn primary"><Icon name="wrench" size={13}/> Iniciar OS</button>
        </div>
      </div>
      <div style={{flex:1, overflow:'auto'}}>
        <NovaOSForm density={density}/>
      </div>
    </div>

    <Note x={236} y={12} n={1}>Página inteira: navegação principal segue visível</Note>
    <Note x={750} y={56} n={2}>Toolbar inferior com 3 ações principais</Note>
    <Note x={28}  y={310} n={3}>Tabelas inline para serviços e peças, com botão "Adicionar" no rodapé</Note>
  </div>
);

// ───── V3: WIZARD ─────
const Stepper = ({ steps, current }) => (
  <div style={{display:'flex', alignItems:'center', gap: 0, padding:'14px 24px', background:'#fff', borderBottom:'1px solid var(--line-2)'}}>
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div style={{display:'flex', alignItems:'center', gap: 10}}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            display:'grid', placeItems:'center',
            background: i < current ? 'var(--red)' : i === current ? '#fff' : 'var(--fill)',
            border: i === current ? '2px solid var(--red)' : i < current ? 'none' : '1px solid var(--line)',
            color: i < current ? '#fff' : i === current ? 'var(--red)' : 'var(--ink-3)',
            fontSize: 11, fontWeight: 700,
          }}>
            {i < current ? <Icon name="check" size={13}/> : (i+1)}
          </div>
          <div>
            <div style={{fontSize: 10.5, color:'var(--ink-3)', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600}}>Etapa {i+1}</div>
            <div style={{fontSize: 12.5, fontWeight: i === current ? 700 : 500, color: i <= current ? 'var(--ink)' : 'var(--ink-3)'}}>{s}</div>
          </div>
        </div>
        {i < steps.length - 1 && <div style={{flex: 1, height: 1, background:'var(--line-2)', margin:'0 16px'}}/>}
      </React.Fragment>
    ))}
  </div>
);

const NovaOSWizard = ({ collapsed, density }) => (
  <div className={`wf-frame density-${density || 'regular'}`} style={{display:'flex', width: 1280, height: 820}}>
    <Sidebar active="os" collapsed={collapsed}/>
    <div className="grow" style={{display:'flex', flexDirection:'column', minWidth:0, background:'var(--paper-2)'}}>
      <div className="wf-topbar">
        <div className="crumbs">
          <Icon name="arrow-left" size={14}/>
          <b>Nova OS · Assistente</b>
        </div>
        <div className="actions">
          <button className="wf-btn ghost">Cancelar</button>
          <button className="wf-btn">Salvar rascunho</button>
        </div>
      </div>
      <Stepper steps={['Cliente & veículo', 'Diagnóstico', 'Serviços & peças', 'Equipe & confirmação']} current={2}/>

      <div style={{flex:1, overflow:'auto', padding: 24, display:'flex', justifyContent:'center'}}>
        <div style={{width: '100%', maxWidth: 880, display:'flex', flexDirection:'column', gap: 16}}>
          {/* recap of completed steps (compact) */}
          <div className="wf-card flat" style={{display:'flex', alignItems:'center', gap: 16, padding:'12px 16px'}}>
            <span className="pill done"><Icon name="check" size={11}/> Cliente</span>
            <div style={{fontSize:12}}><b>Marcos Lima</b> · <span className="muted">VW Gol G6 · ABC-1234 · 78.420 km</span></div>
            <div className="grow"/>
            <button className="wf-btn sm ghost"><Icon name="edit" size={11}/> Editar</button>
          </div>
          <div className="wf-card flat" style={{display:'flex', alignItems:'center', gap: 16, padding:'12px 16px'}}>
            <span className="pill done"><Icon name="check" size={11}/> Diagnóstico</span>
            <div style={{fontSize:12}}>Barulho na suspensão dianteira + revisão 40k km</div>
            <div className="grow"/>
            <button className="wf-btn sm ghost"><Icon name="edit" size={11}/> Editar</button>
          </div>

          {/* current step */}
          <div className="wf-card">
            <h3 style={{margin:'0 0 4px', fontSize: 16, fontWeight:700}}>Serviços e peças</h3>
            <p className="muted" style={{margin:'0 0 16px', fontSize:12}}>Adicione os serviços executados e as peças necessárias para esta OS.</p>

            <h4 style={{fontSize:12, fontWeight:700, margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--ink-3)'}}>Serviços</h4>
            <ItemTable rows={SERVICOS} columns={[
              { key: 'd', label: 'Descrição' },
              { key: 'q', label: 'Qtd', style:{width: 60, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular' },
              { key: 'vu', label: 'Unit.', style:{width:100, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular' },
              { key: 'vt', label: 'Total', style:{width:100, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular strong' },
            ]} addLabel="Adicionar serviço"/>

            <h4 style={{fontSize:12, fontWeight:700, margin:'24px 0 10px', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--ink-3)'}}>Peças</h4>
            <ItemTable rows={PECAS} columns={[
              { key: 'c', label: 'Código', style:{width:120}, cls:'tabular muted' },
              { key: 'd', label: 'Descrição' },
              { key: 'q', label: 'Qtd', style:{width:60, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular' },
              { key: 'v', label: 'Unit.', style:{width:90, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular' },
              { key: 't', label: 'Total', style:{width:100, textAlign:'right'}, tdStyle:{textAlign:'right'}, cls:'tabular strong' },
            ]} addLabel="Adicionar peça"/>

            <div style={{marginTop: 18}}><TotalsBlock compact/></div>
          </div>

          {/* footer nav */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0'}}>
            <button className="wf-btn"><Icon name="arrow-left" size={13}/> Voltar</button>
            <div className="muted" style={{fontSize:11.5}}>Etapa 3 de 4</div>
            <button className="wf-btn primary">Continuar <Icon name="chevron" size={13}/></button>
          </div>
        </div>
      </div>
    </div>

    <Note x={236} y={56} n={1}>Stepper guia o usuário em 4 etapas focadas</Note>
    <Note x={236} y={130} n={2}>Etapas concluídas viram resumos colapsados, editáveis</Note>
    <Note x={28}  y={460} n={3}>Tabelas e total visíveis na etapa 3</Note>
    <Note x={28}  y={750} n={4}>Navegação footer com etapa atual e CTA principal</Note>
  </div>
);

Object.assign(window, { NovaOSModal, NovaOSPage, NovaOSWizard, SERVICOS, PECAS, TotalsBlock });
