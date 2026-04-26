// UNICAR — Cliente, Orçamento, Financeiro, Peças/Serviços (1 versão cada)

// ════════ CLIENTE ════════
const ClienteScreen = ({ collapsed, density }) => {
  const [tab, setTab] = React.useState(0);
  const tabs = ['Dados Pessoais', 'Endereço', 'Veículos', 'Histórico'];
  return (
    <div className={`wf-frame density-${density || 'regular'}`} style={{display:'flex', width: 1280, height: 820}}>
      <Sidebar active="clientes" collapsed={collapsed}/>
      <div className="grow" style={{display:'flex', flexDirection:'column', minWidth:0, background:'var(--paper-2)'}}>
        <div className="wf-topbar">
          <div className="crumbs">
            <Icon name="arrow-left" size={14}/>
            <span>Clientes</span>
            <span className="dot-sep"/>
            <b>Marcos Lima</b>
            <span className="pill done" style={{marginLeft: 6}}><span className="dot"/>Ativo</span>
          </div>
          <div className="actions">
            <button className="wf-btn ghost"><Icon name="trash" size={13}/></button>
            <button className="wf-btn"><Icon name="doc" size={13}/> Nova OS</button>
            <button className="wf-btn primary"><Icon name="check" size={13}/> Salvar</button>
          </div>
        </div>

        <div style={{padding:'20px 24px 0', background:'#fff', borderBottom:'1px solid var(--line-2)'}}>
          <div style={{display:'flex', alignItems:'center', gap: 16, marginBottom: 16}}>
            <Avatar name="Marcos Lima" size={56} tone="#3a3a3a"/>
            <div className="grow">
              <div style={{fontSize: 20, fontWeight:700, letterSpacing:'-0.01em'}}>Marcos Lima</div>
              <div className="muted" style={{fontSize:12, display:'flex', gap: 14, marginTop: 4}}>
                <span><Icon name="doc" size={12}/> CPF 123.456.789-00</span>
                <span><Icon name="phone" size={12}/> (11) 98765-4321</span>
                <span><Icon name="mail" size={12}/> marcos.lima@email.com</span>
              </div>
            </div>
            <div style={{display:'flex', gap: 24, alignItems:'center'}}>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:18, fontWeight:700}} className="tabular">12</div>
                <div className="muted" style={{fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.06em'}}>Ordens</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:18, fontWeight:700}} className="tabular">R$ 14.620</div>
                <div className="muted" style={{fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.06em'}}>Histórico</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:18, fontWeight:700}} className="tabular">2</div>
                <div className="muted" style={{fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.06em'}}>Veículos</div>
              </div>
            </div>
          </div>
          <div className="wf-tabs">
            {tabs.map((t, i) => (
              <div key={t} className={`wf-tab ${i === tab ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding: 24}}>
          {tab === 0 && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 24, maxWidth: 980}}>
              <div className="wf-card">
                <h3 style={{margin:'0 0 14px', fontSize:13, fontWeight:700}}>Tipo de pessoa</h3>
                <div style={{display:'flex', gap: 8, marginBottom: 14}}>
                  <button className="wf-btn primary sm" style={{flex:1}}>Pessoa Física</button>
                  <button className="wf-btn sm" style={{flex:1}}>Pessoa Jurídica</button>
                </div>
                <div className="field" style={{marginBottom: 12}}>
                  <label>Nome completo <span className="req">*</span></label>
                  <input className="input" defaultValue="Marcos Antonio Lima"/>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
                  <div className="field"><label>CPF <span className="req">*</span></label><input className="input tabular" defaultValue="123.456.789-00"/></div>
                  <div className="field"><label>Data de nascimento</label><input className="input" defaultValue="14/03/1985"/></div>
                </div>
              </div>
              <div className="wf-card">
                <h3 style={{margin:'0 0 14px', fontSize:13, fontWeight:700}}>Contato</h3>
                <div className="field" style={{marginBottom: 12}}><label>E-mail</label><input className="input" defaultValue="marcos.lima@email.com"/></div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, marginBottom: 12}}>
                  <div className="field"><label>Telefone</label><input className="input tabular" defaultValue="(11) 3242-1188"/></div>
                  <div className="field">
                    <label>Celular / WhatsApp</label>
                    <div className="input-group">
                      <Icon name="whatsapp" size={13} className="ico" style={{color:'#10884a'}}/>
                      <input className="input tabular" defaultValue="(11) 98765-4321"/>
                    </div>
                  </div>
                </div>
                <label style={{display:'flex', alignItems:'center', gap:8, fontSize:12, cursor:'pointer'}}>
                  <input type="checkbox" defaultChecked/> Aceita comunicações por WhatsApp
                </label>
              </div>
            </div>
          )}
          {tab === 1 && (
            <div className="wf-card" style={{maxWidth: 720}}>
              <div style={{display:'grid', gridTemplateColumns:'160px 1fr', gap: 12, marginBottom: 12}}>
                <div className="field"><label>CEP <span className="req">*</span></label>
                  <div className="input-group">
                    <Icon name="search" size={13} className="ico"/>
                    <input className="input tabular" defaultValue="04547-130"/>
                  </div>
                </div>
                <div className="field" style={{justifyContent:'flex-end'}}>
                  <span className="muted" style={{fontSize:11}}>Auto-preenchimento via ViaCEP</span>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 100px', gap: 12, marginBottom: 12}}>
                <div className="field"><label>Rua</label><input className="input" defaultValue="Av. das Nações Unidas"/></div>
                <div className="field"><label>Número</label><input className="input tabular" defaultValue="14.401"/></div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, marginBottom: 12}}>
                <div className="field"><label>Complemento</label><input className="input" defaultValue="Torre Tarumã · 14º andar"/></div>
                <div className="field"><label>Bairro</label><input className="input" defaultValue="Vila Gertrudes"/></div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 100px', gap: 12}}>
                <div className="field"><label>Cidade</label><input className="input" defaultValue="São Paulo"/></div>
                <div className="field"><label>Estado</label><select className="select"><option>SP</option></select></div>
              </div>
            </div>
          )}
          {tab === 2 && (
            <div className="wf-card" style={{padding: 0, overflow:'hidden'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid var(--line-3)'}}>
                <h3 style={{margin: 0, fontSize:13, fontWeight:700}}>Veículos vinculados <span className="muted" style={{fontWeight:400, fontSize:11}}>· 2</span></h3>
                <button className="wf-btn primary sm"><Icon name="plus" size={11}/> Adicionar veículo</button>
              </div>
              <table className="wf-table">
                <thead><tr>
                  <th style={{width: 110}}>Placa</th><th>Modelo</th><th>Marca</th>
                  <th style={{width: 70}}>Ano</th><th style={{width: 90}}>Cor</th>
                  <th style={{width: 100, textAlign:'right'}}>Km</th>
                  <th style={{width: 110}}>Combustível</th><th style={{width: 30}}></th>
                </tr></thead>
                <tbody>
                  {[
                    { p:'ABC-1234', m:'Gol G6 1.6', mc:'VW', a:'2018', c:'Branco', km:'78.420', cb:'Flex' },
                    { p:'XYZ-9988', m:'Onix LT 1.0', mc:'Chevrolet', a:'2022', c:'Prata', km:'24.110', cb:'Flex' },
                  ].map(v => (
                    <tr key={v.p}>
                      <td className="strong tabular">{v.p}</td>
                      <td>{v.m}</td><td>{v.mc}</td>
                      <td className="tabular">{v.a}</td><td>{v.c}</td>
                      <td className="tabular" style={{textAlign:'right'}}>{v.km}</td>
                      <td>{v.cb}</td>
                      <td><Icon name="dots" size={14} style={{color:'var(--ink-3)'}}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 3 && (
            <div className="wf-card" style={{padding: 0, overflow:'hidden'}}>
              <div style={{padding:'14px 18px', borderBottom:'1px solid var(--line-3)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3 style={{margin: 0, fontSize:13, fontWeight:700}}>Histórico de OS</h3>
                <span className="muted" style={{fontSize:11}}>12 ordens · R$ 14.620 totais</span>
              </div>
              <table className="wf-table">
                <thead><tr>
                  <th style={{width:90}}>OS</th><th style={{width:110}}>Data</th>
                  <th>Serviço</th><th style={{width:120}}>Veículo</th>
                  <th style={{width:130}}>Status</th><th style={{width:100, textAlign:'right'}}>Valor</th>
                </tr></thead>
                <tbody>
                  {[
                    { n:'#OS-2641', d:'25/04/2026', s:'Revisão 40k + Troca de óleo',     v:'ABC-1234', st:'progress', val:'R$ 1.450,00' },
                    { n:'#OS-2598', d:'12/01/2026', s:'Troca de bateria',                v:'ABC-1234', st:'done',     val:'R$    540,00' },
                    { n:'#OS-2502', d:'08/09/2025', s:'Revisão 30k km',                  v:'ABC-1234', st:'done',     val:'R$ 1.180,00' },
                    { n:'#OS-2440', d:'21/04/2025', s:'Pastilhas de freio + discos',     v:'ABC-1234', st:'done',     val:'R$    920,00' },
                    { n:'#OS-2398', d:'02/02/2025', s:'Troca de pneus dianteiros',       v:'XYZ-9988', st:'done',     val:'R$ 1.380,00' },
                  ].map(r => (
                    <tr key={r.n}>
                      <td className="strong tabular">{r.n}</td>
                      <td className="tabular">{r.d}</td>
                      <td>{r.s}</td>
                      <td className="tabular muted">{r.v}</td>
                      <td><StatusPill kind={r.st}>{STATUS_LABEL[r.st]}</StatusPill></td>
                      <td className="tabular strong" style={{textAlign:'right'}}>{r.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Note x={236} y={130} n={1}>Header do cliente com avatar e estatísticas</Note>
      <Note x={236} y={210} n={2}>Abas para organizar dados sem rolagem longa</Note>
      <Note x={750} y={68} n={3}>Botão Salvar primário (vermelho)</Note>
    </div>
  );
};

// ════════ ORÇAMENTO ════════
const OrcamentoScreen = ({ density }) => (
  <div className={`wf-frame density-${density || 'regular'}`} style={{width: 1280, height: 820, display:'flex', flexDirection:'column', background:'var(--paper-2)'}}>
    <div className="wf-topbar">
      <div className="crumbs">
        <Icon name="arrow-left" size={14}/>
        <span>Orçamentos</span><span className="dot-sep"/>
        <b>#ORC-1182</b>
        <span className="pill draft" style={{marginLeft: 6}}>Aguardando aprovação</span>
      </div>
      <div className="actions">
        <button className="wf-btn"><Icon name="print" size={13}/> Imprimir</button>
        <button className="wf-btn"><Icon name="whatsapp" size={13} style={{color:'#10884a'}}/> Enviar por WhatsApp</button>
        <button className="wf-btn primary"><Icon name="check" size={13}/> Aprovar e gerar OS</button>
      </div>
    </div>

    <div style={{flex:1, overflow:'auto', padding: '24px 0', display:'flex', justifyContent:'center'}}>
      {/* paper-like document */}
      <div style={{
        width: 820, background:'#fff',
        boxShadow:'0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        padding: '40px 48px', display:'flex', flexDirection:'column', gap: 24,
        border:'1px solid var(--line-3)',
      }}>
        {/* header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'2px solid #111', paddingBottom: 20}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 10}}>
              <MarkSpeed size={42}/>
              <Wordmark size={28}/>
            </div>
            <div style={{fontSize: 11, color:'var(--ink-3)', lineHeight: 1.6}}>
              UNICAR Auto Center Ltda · CNPJ 12.345.678/0001-90<br/>
              Av. das Nações Unidas, 14.401 · Vila Gertrudes · São Paulo / SP<br/>
              (11) 3242-1188 · contato@unicar.com.br
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize: 11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:600}}>Orçamento</div>
            <div style={{fontSize: 28, fontWeight: 800, letterSpacing:'-0.02em', marginTop: 4}} className="tabular">#ORC-1182</div>
            <div style={{fontSize: 11.5, color:'var(--ink-2)', marginTop: 8}}>
              Emissão: <b className="tabular">25/04/2026</b><br/>
              Validade: <b className="tabular">02/05/2026</b> (7 dias)
            </div>
          </div>
        </div>

        {/* cliente + veículo */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 24}}>
          <div>
            <div style={{fontSize: 10.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom: 6}}>Cliente</div>
            <div style={{fontSize: 14, fontWeight:700}}>Marcos Antonio Lima</div>
            <div style={{fontSize: 12, color:'var(--ink-2)', lineHeight: 1.6, marginTop: 4}}>
              CPF 123.456.789-00<br/>
              (11) 98765-4321 · marcos.lima@email.com<br/>
              Av. das Nações Unidas, 14.401 · São Paulo / SP
            </div>
          </div>
          <div>
            <div style={{fontSize: 10.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom: 6}}>Veículo</div>
            <div style={{fontSize: 14, fontWeight:700}}>VW Gol G6 1.6 · 2018</div>
            <div style={{fontSize: 12, color:'var(--ink-2)', lineHeight: 1.6, marginTop: 4}}>
              Placa <b className="tabular">ABC-1234</b> · Cor Branco · Flex<br/>
              Km atual: <b className="tabular">78.420</b><br/>
              Chassi: 9BWZZZ377VT004251
            </div>
          </div>
        </div>

        {/* Serviços + peças */}
        <div>
          <div style={{fontSize: 10.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom: 8}}>Serviços</div>
          <table className="wf-table" style={{borderTop:'1px solid var(--line-2)'}}>
            <thead>
              <tr><th>Descrição</th><th style={{width:60, textAlign:'right'}}>Qtd</th><th style={{width:110, textAlign:'right'}}>Unit.</th><th style={{width:110, textAlign:'right'}}>Total</th></tr>
            </thead>
            <tbody>
              {SERVICOS.map((r, i) => (
                <tr key={i}>
                  <td>{r.d}</td>
                  <td className="tabular" style={{textAlign:'right'}}>{r.q}</td>
                  <td className="tabular" style={{textAlign:'right'}}>{r.vu}</td>
                  <td className="tabular strong" style={{textAlign:'right'}}>{r.vt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div style={{fontSize: 10.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom: 8}}>Peças</div>
          <table className="wf-table" style={{borderTop:'1px solid var(--line-2)'}}>
            <thead>
              <tr><th style={{width:120}}>Código</th><th>Descrição</th><th style={{width:60, textAlign:'right'}}>Qtd</th><th style={{width:90, textAlign:'right'}}>Unit.</th><th style={{width:100, textAlign:'right'}}>Total</th></tr>
            </thead>
            <tbody>
              {PECAS.map((r, i) => (
                <tr key={i}>
                  <td className="tabular muted">{r.c}</td>
                  <td>{r.d}</td>
                  <td className="tabular" style={{textAlign:'right'}}>{r.q}</td>
                  <td className="tabular" style={{textAlign:'right'}}>{r.v}</td>
                  <td className="tabular strong" style={{textAlign:'right'}}>{r.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{display:'flex', justifyContent:'flex-end'}}>
          <div style={{width: 320}}>
            {[
              ['Subtotal serviços', 'R$    880,00'],
              ['Subtotal peças',    'R$    450,00'],
              ['Desconto (3%)',     '− R$ 30,00'],
            ].map(([l, v], i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize: 12.5, color: 'var(--ink-2)'}}>
                <span>{l}</span><span className="tabular">{v}</span>
              </div>
            ))}
            <div style={{height:1, background:'#111', margin:'8px 0'}}/>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span style={{fontSize: 13, fontWeight:700}}>Total</span>
              <span className="tabular" style={{fontSize: 24, fontWeight:800, color:'var(--red)'}}>R$ 1.300,00</span>
            </div>
          </div>
        </div>

        {/* Observations + signature */}
        <div style={{borderTop:'1px solid var(--line-3)', paddingTop: 16}}>
          <div style={{fontSize: 10.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom: 6}}>Observações</div>
          <div style={{fontSize: 12, color:'var(--ink-2)', lineHeight: 1.6}}>
            Garantia de 90 dias para os serviços executados. Peças com garantia de fábrica conforme nota do fornecedor.
            Pagamento em até 3x sem juros no cartão ou via PIX com 3% de desconto adicional.
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 32, marginTop: 18, fontSize:11.5, color:'var(--ink-2)', textAlign:'center'}}>
          <div>
            <div style={{borderTop:'1px solid var(--ink-2)', paddingTop: 6}}>UNICAR Auto Center · Carlos Mendes</div>
          </div>
          <div>
            <div style={{borderTop:'1px solid var(--ink-2)', paddingTop: 6}}>Cliente · Marcos Antonio Lima</div>
          </div>
        </div>
      </div>
    </div>

    <Note x={28}  y={68} n={1}>Visual tipo documento, pronto para imprimir</Note>
    <Note x={760} y={12} n={2}>3 ações: imprimir, WhatsApp, aprovar (gera OS automática)</Note>
    <Note x={28}  y={300} n={3}>Cabeçalho com logo + dados da empresa + nº e validade</Note>
    <Note x={28}  y={620} n={4}>Total final em vermelho, peso 800</Note>
  </div>
);

// ════════ FINANCEIRO ════════
const FinanceiroScreen = ({ collapsed, density }) => (
  <div className={`wf-frame density-${density || 'regular'}`} style={{display:'flex', width: 1280, height: 820}}>
    <Sidebar active="financeiro" collapsed={collapsed}/>
    <div className="grow" style={{display:'flex', flexDirection:'column', minWidth:0, background:'var(--paper-2)'}}>
      <TopBar title="Financeiro" subtitle="Contas a Receber"/>
      <div style={{padding: 20, display:'flex', flexDirection:'column', gap: 16, flex:1, minHeight:0}}>
        {/* Tabs internal */}
        <div style={{display:'flex', gap: 6}}>
          <button className="wf-btn primary sm">Contas a Receber</button>
          <button className="wf-btn sm">Contas a Pagar</button>
          <button className="wf-btn sm">Fluxo de Caixa</button>
          <button className="wf-btn sm">Comissões</button>
        </div>

        {/* summary cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
          <MetricCard label="Total a receber"   value="R$ 38.420" sub="22 títulos abertos"          icon="cash"/>
          <MetricCard label="Vencidos"          value="R$  6.180" sub="4 títulos · ação requerida" icon="alert" accent="var(--red)"/>
          <MetricCard label="Vence em 7 dias"   value="R$ 14.820" sub="6 títulos"                  icon="clock" accent="#b25e09"/>
          <MetricCard label="Recebidos no mês"  value="R$ 76.200" sub={<><span className="delta-up">▲ 8%</span> vs. março</>} icon="check" accent="#10884a"/>
        </div>

        {/* Filters bar */}
        <div className="wf-card" style={{padding: 12, display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap'}}>
          <div style={{position:'relative', flex:'1 1 240px', maxWidth: 280}}>
            <Icon name="search" size={13} style={{position:'absolute', left: 9, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
            <input className="input" placeholder="Buscar por OS, cliente, valor…" style={{paddingLeft: 30}}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 6, fontSize: 11.5, color:'var(--ink-3)'}}>Período:
            <button className="wf-btn sm">Hoje</button>
            <button className="wf-btn sm">7d</button>
            <button className="wf-btn primary sm">30d</button>
            <button className="wf-btn sm">Personalizado <Icon name="calendar" size={11}/></button>
          </div>
          <div style={{flex: 1}}/>
          <div style={{display:'flex', alignItems:'center', gap: 6}}>
            <span className="pill due">Pendente · 12</span>
            <span className="pill late">Vencido · 4</span>
            <span className="pill paid">Pago · 18</span>
          </div>
          <button className="wf-btn sm"><Icon name="download" size={12}/> Exportar</button>
        </div>

        {/* table */}
        <div className="wf-card" style={{padding: 0, flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
          <div style={{flex:1, overflow:'auto'}}>
            <table className="wf-table">
              <thead>
                <tr>
                  <th style={{width:30}}><input type="checkbox"/></th>
                  <th style={{width:90}}>OS</th>
                  <th>Cliente</th>
                  <th style={{width:140, textAlign:'right'}}>Valor</th>
                  <th style={{width:130}}>Vencimento</th>
                  <th style={{width:130}}>Status</th>
                  <th style={{width:130, textAlign:'right'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { os:'#OS-2615', cli:'Tech Logística',  val:'R$ 3.280,00', d:'23/04/2026', dias: 2, st:'late', sl:'Vencido há 2 dias' },
                  { os:'#OS-2620', cli:'Patrícia Nunes',  val:'R$    540,00', d:'24/04/2026', dias: 1, st:'late', sl:'Vencido há 1 dia' },
                  { os:'#OS-2641', cli:'Marcos Lima',     val:'R$ 1.450,00', d:'25/04/2026', dias: 0, st:'due',  sl:'Vence hoje' },
                  { os:'#OS-2638', cli:'Ana Castro',      val:'R$    920,00', d:'28/04/2026', dias: 3, st:'due',  sl:'Vence em 3 dias' },
                  { os:'#OS-2637', cli:'Eduardo Souza',   val:'R$ 3.280,00', d:'30/04/2026', dias: 5, st:'due',  sl:'Vence em 5 dias' },
                  { os:'#OS-2630', cli:'Logística Sul',   val:'R$ 1.890,00', d:'05/05/2026', dias:10, st:'due',  sl:'Em dia' },
                  { os:'#OS-2598', cli:'Marcos Lima',     val:'R$    540,00', d:'15/01/2026', dias: 0, st:'paid', sl:'Pago em 14/01' },
                  { os:'#OS-2502', cli:'Mariana Reis',    val:'R$ 2.140,00', d:'12/04/2026', dias: 0, st:'paid', sl:'Pago em 11/04' },
                ].map(r => (
                  <tr key={r.os}>
                    <td><input type="checkbox"/></td>
                    <td className="strong tabular">{r.os}</td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <Avatar name={r.cli} size={22}/>
                        <span style={{fontWeight:600}}>{r.cli}</span>
                      </div>
                    </td>
                    <td className="tabular strong" style={{textAlign:'right'}}>{r.val}</td>
                    <td>
                      <div className="tabular">{r.d}</div>
                      <div className="muted" style={{fontSize:10.5}}>{r.sl}</div>
                    </td>
                    <td>
                      {r.st === 'late' && <StatusPill kind="late">Vencido</StatusPill>}
                      {r.st === 'due'  && r.dias === 0 && <StatusPill kind="due">Vence hoje</StatusPill>}
                      {r.st === 'due'  && r.dias  >  0 && <StatusPill kind="waiting">Pendente</StatusPill>}
                      {r.st === 'paid' && <StatusPill kind="paid">Pago</StatusPill>}
                    </td>
                    <td style={{textAlign:'right'}}>
                      {r.st !== 'paid' ? (
                        <div style={{display:'inline-flex', gap: 6}}>
                          <button className="wf-btn sm">Lembrete</button>
                          <button className="wf-btn primary sm">Receber</button>
                        </div>
                      ) : (
                        <button className="wf-btn ghost sm"><Icon name="eye" size={12}/> Ver recibo</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <Note x={236} y={120} n={1}>4 cards de resumo: total, vencidos, vence em 7 dias, recebidos no mês</Note>
    <Note x={236} y={230} n={2}>Filtros por período + status com contagem</Note>
    <Note x={760} y={400} n={3}>Pills coloridas: vermelho vencido, laranja vence hoje, azul pendente, verde pago</Note>
    <Note x={760} y={620} n={4}>Ação rápida: Lembrete (WhatsApp) + Receber (registra pagamento)</Note>
  </div>
);

// ════════ PEÇAS E SERVIÇOS ════════
const PecasScreen = ({ collapsed, density }) => (
  <div className={`wf-frame density-${density || 'regular'}`} style={{display:'flex', width: 1280, height: 820}}>
    <Sidebar active="pecas" collapsed={collapsed}/>
    <div className="grow" style={{display:'flex', flexDirection:'column', minWidth:0, background:'var(--paper-2)'}}>
      <div className="wf-topbar">
        <div className="crumbs">
          <Icon name="box" size={14}/>
          <b>Peças e Serviços</b>
          <span className="dot-sep"/>
          <span className="muted">486 itens cadastrados</span>
        </div>
        <div className="actions">
          <button className="wf-btn"><Icon name="download" size={13}/> Exportar</button>
          <button className="wf-btn primary"><Icon name="plus" size={13}/> Adicionar Peça ou Serviço</button>
        </div>
      </div>

      <div style={{padding: 20, display:'flex', flexDirection:'column', gap: 16, flex:1, minHeight:0}}>
        {/* mini metrics */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
          <MetricCard label="Peças cadastradas" value="412" sub="32 com estoque baixo" icon="box" accent="var(--red)"/>
          <MetricCard label="Serviços"          value="74"  sub="Tempo médio: 1.8h"    icon="wrench"/>
          <MetricCard label="Valor em estoque"  value="R$ 142k" sub="custo · 8 grupos" icon="cash"/>
          <MetricCard label="Margem média"      value="38%" sub={<><span className="delta-up">▲ 2%</span> vs. trimestre</>} icon="chart" accent="#10884a"/>
        </div>

        {/* filter bar */}
        <div className="wf-card" style={{padding: 12, display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap'}}>
          <div style={{position:'relative', flex:'1 1 240px', maxWidth: 320}}>
            <Icon name="search" size={13} style={{position:'absolute', left: 9, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
            <input className="input" placeholder="Buscar por nome ou código…" style={{paddingLeft: 30}}/>
          </div>
          <select className="select" style={{maxWidth: 160}}><option>Grupo: Todos</option><option>Lubrificantes</option><option>Filtros</option><option>Freios</option></select>
          <select className="select" style={{maxWidth: 160}}><option>Tipo: Todos</option><option>Peças</option><option>Serviços</option></select>
          <select className="select" style={{maxWidth: 160}}><option>Situação: Todos</option><option>Ativo</option><option>Inativo</option></select>
          <div style={{flex:1}}/>
          <button className="wf-btn sm"><Icon name="filter" size={12}/> Mais filtros</button>
        </div>

        {/* table */}
        <div className="wf-card" style={{padding: 0, flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
          <div style={{flex:1, overflow:'auto'}}>
            <table className="wf-table">
              <thead>
                <tr>
                  <th style={{width:120}}>Código</th>
                  <th>Nome</th>
                  <th style={{width:130}}>Grupo</th>
                  <th style={{width:80}}>Tipo</th>
                  <th style={{width:70}}>Un.</th>
                  <th style={{width:100, textAlign:'right'}}>Custo</th>
                  <th style={{width:100, textAlign:'right'}}>Venda</th>
                  <th style={{width:100, textAlign:'right'}}>Estoque</th>
                  <th style={{width:100}}>Situação</th>
                  <th style={{width:30}}></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { c:'7891234001', n:'Óleo Mobil Super 5W30 1L',     g:'Lubrificantes', t:'Peça',   un:'L',  cu:'R$ 28,00',  vd:'R$ 42,00',  est: 48,  s:'ativo' },
                  { c:'7891234112', n:'Filtro de óleo Mann W712/52',  g:'Filtros',       t:'Peça',   un:'UN', cu:'R$ 22,00',  vd:'R$ 38,00',  est: 2,   s:'ativo', alert:true },
                  { c:'7891234208', n:'Filtro de ar Tecfil ARS-7522', g:'Filtros',       t:'Peça',   un:'UN', cu:'R$ 36,00',  vd:'R$ 64,00',  est: 12,  s:'ativo' },
                  { c:'7891234411', n:'Pastilha de freio dianteira VW Gol', g:'Freios',  t:'Peça',   un:'JG', cu:'R$ 98,00',  vd:'R$ 180,00', est: 6,   s:'ativo' },
                  { c:'7891234508', n:'Disco de freio dianteiro 256mm',    g:'Freios',  t:'Peça',   un:'UN', cu:'R$ 142,00', vd:'R$ 240,00', est: 4,   s:'ativo' },
                  { c:'7891234712', n:'Bateria Moura 60Ah',                g:'Elétrica', t:'Peça',   un:'UN', cu:'R$ 320,00', vd:'R$ 480,00', est: 8,   s:'ativo' },
                  { c:'SVC-0010',   n:'Troca de óleo motor + filtro',      g:'Serviços', t:'Serviço',un:'SV', cu:'R$  40,00', vd:'R$ 180,00', est: '—', s:'ativo' },
                  { c:'SVC-0022',   n:'Alinhamento computadorizado 4 rodas', g:'Serviços', t:'Serviço',un:'SV', cu:'R$  60,00', vd:'R$ 140,00', est: '—', s:'ativo' },
                  { c:'SVC-0034',   n:'Revisão completa 40.000 km',       g:'Serviços', t:'Serviço',un:'SV', cu:'R$ 180,00', vd:'R$ 480,00', est: '—', s:'ativo' },
                  { c:'7891239921', n:'Lâmpada H7 Osram (descontinuada)',  g:'Elétrica', t:'Peça',   un:'UN', cu:'R$  18,00', vd:'R$  32,00', est: 0,   s:'inativo' },
                ].map(r => (
                  <tr key={r.c}>
                    <td className="tabular muted">{r.c}</td>
                    <td>
                      <div style={{fontWeight:600}}>{r.n}</div>
                      {r.alert && <div style={{fontSize: 10.5, color:'var(--red)', display:'flex', alignItems:'center', gap:4, marginTop:2}}>
                        <Icon name="alert" size={11}/> Estoque crítico — repor
                      </div>}
                    </td>
                    <td>{r.g}</td>
                    <td>
                      {r.t === 'Peça'
                        ? <span className="pill draft" style={{background:'rgba(99,102,241,0.10)', color:'#4f46d6'}}><Icon name="box" size={10}/> Peça</span>
                        : <span className="pill draft" style={{background:'rgba(227,30,45,0.10)', color:'var(--red)'}}><Icon name="wrench" size={10}/> Serviço</span>
                      }
                    </td>
                    <td className="tabular muted">{r.un}</td>
                    <td className="tabular" style={{textAlign:'right'}}>{r.cu}</td>
                    <td className="tabular strong" style={{textAlign:'right'}}>{r.vd}</td>
                    <td className="tabular" style={{textAlign:'right', color: r.alert ? 'var(--red)' : r.est === 0 ? 'var(--ink-3)' : 'var(--ink)'}}>{r.est}</td>
                    <td>
                      {r.s === 'ativo'
                        ? <StatusPill kind="paid">Ativo</StatusPill>
                        : <span className="pill inactive"><span className="dot"/>Inativo</span>}
                    </td>
                    <td><Icon name="dots" size={14} style={{color:'var(--ink-3)'}}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* pagination */}
          <div style={{padding:'10px 16px', borderTop:'1px solid var(--line-3)', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize: 11.5, color:'var(--ink-3)'}}>
            <span>Mostrando 1–10 de 486 itens</span>
            <div style={{display:'flex', gap: 4}}>
              <button className="wf-btn sm">‹</button>
              <button className="wf-btn primary sm">1</button>
              <button className="wf-btn sm">2</button>
              <button className="wf-btn sm">3</button>
              <span style={{padding:'0 4px'}}>…</span>
              <button className="wf-btn sm">49</button>
              <button className="wf-btn sm">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Note x={760} y={12} n={1}>CTA "Adicionar Peça ou Serviço" no canto superior direito</Note>
    <Note x={236} y={130} n={2}>Métricas-chave: peças, serviços, estoque, margem</Note>
    <Note x={236} y={232} n={3}>Filtros: nome/código, grupo, tipo, situação</Note>
    <Note x={760} y={420} n={4}>Tipo Peça/Serviço com pill colorido; alertas inline para estoque crítico</Note>
  </div>
);

Object.assign(window, { ClienteScreen, OrcamentoScreen, FinanceiroScreen, PecasScreen });
