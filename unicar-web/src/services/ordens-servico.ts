import { supabase } from '../lib/supabase'
import type {
  OrdemServico,
  OrdemServicoRow,
  OrdemServicoStatus,
  KanbanOS,
  OSItem,
  OSParcela,
  Tecnico,
  CatalogoItem,
  HistoricoOSRow,
  OSHistoricoItem,
} from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildEndereco(c: any): string {
  if (!c) return ''
  return [c.rua, c.bairro, c.cidade, c.estado].filter(Boolean).join(', ')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToListItem(row: any): OrdemServicoRow {
  const items = (row.os_itens ?? []) as { qtd: number; valor_unit: number }[]
  const subtotal = items.reduce((s, i) => s + (i.qtd ?? 0) * (i.valor_unit ?? 0), 0)
  const total = subtotal - (row.desconto ?? 0)
  return {
    id: row.id,
    numero: row.numero ?? '',
    status: row.status ?? 'rascunho',
    clienteNome: row.clientes?.nome ?? '',
    clienteDocumento: row.clientes?.documento ?? '',
    veiculoPlaca: row.veiculos?.placa ?? '',
    veiculoModelo: row.veiculos?.modelo ?? '',
    kmAtual: row.km_atual ?? '',
    tecnicoNome: row.tecnicos?.nome ?? '',
    tecnicoId: row.tecnico_id ?? '',
    valorTotal: Math.max(0, total),
    data: row.data ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOS(row: any): OrdemServico {
  const itens = (row.os_itens ?? []) as any[]  // eslint-disable-line @typescript-eslint/no-explicit-any
  const servicos: OSItem[] = itens
    .filter(i => i.tipo === 'servico')
    .map(i => ({ id: i.id, tipo: 'servico', codigo: i.codigo ?? '', descricao: i.descricao ?? '', qtd: i.qtd ?? 1, valor_unit: i.valor_unit ?? 0 }))
  const pecas: OSItem[] = itens
    .filter(i => i.tipo === 'peca')
    .map(i => ({ id: i.id, tipo: 'peca', codigo: i.codigo ?? '', descricao: i.descricao ?? '', qtd: i.qtd ?? 1, valor_unit: i.valor_unit ?? 0 }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pag = (row.os_pagamentos ?? [])[0] as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcelas: OSParcela[] = (row.os_parcelas ?? []).map((p: any): OSParcela => ({
    id: p.id,
    numero: p.numero,
    data_vencimento: p.data_vencimento,
    valor: p.valor,
    status: p.status ?? 'pendente',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })).sort((a: any, b: any) => a.numero - b.numero)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aux: string[] = (row.os_tecnicos_auxiliares ?? []).map((a: any) => a.tecnico_id as string)

  return {
    id: row.id,
    numero: row.numero ?? '',
    data: row.data ?? '',
    cliente_id: row.cliente_id ?? '',
    cliente_nome: row.clientes?.nome ?? '',
    cliente_documento: row.clientes?.documento ?? '',
    cliente_endereco: buildEndereco(row.clientes),
    veiculo_id: row.veiculo_id ?? '',
    veiculo_placa: row.veiculos?.placa ?? '',
    veiculo_modelo: row.veiculos?.modelo ?? '',
    veiculo_ano: row.veiculos?.ano ?? '',
    km_atual: row.km_atual ?? '',
    status: row.status ?? 'rascunho',
    tipo_servico: row.tipo_servico ?? '',
    prazo_estimado: row.prazo_estimado ?? '',
    problema_relatado: row.problema_relatado ?? '',
    observacoes: row.observacoes ?? '',
    tecnico_id: row.tecnico_id ?? '',
    auxiliares: aux,
    garantia_dias: row.garantia_dias ?? 90,
    desconto: row.desconto ?? 0,
    servicos,
    pecas,
    pagamento_tipo: pag?.tipo ?? 'unico',
    pagamento_forma: pag?.forma ?? '',
    pagamento_data_vencimento: pag?.data_vencimento ?? '',
    pagamento_total: pag?.total ?? 0,
    pagamento_num_parcelas: pag?.num_parcelas ?? 2,
    pagamento_primeira_parcela: pag?.primeira_parcela ?? '',
    parcelas,
  }
}

const FULL_SELECT = `
  id, numero, status, km_atual, desconto, data, tipo_servico,
  problema_relatado, observacoes, prazo_estimado,
  cliente_id, veiculo_id, tecnico_id, garantia_dias,
  clientes (nome, documento, rua, bairro, cidade, estado),
  veiculos (placa, modelo, ano),
  tecnicos!tecnico_id (nome),
  os_itens (id, tipo, codigo, descricao, qtd, valor_unit),
  os_pagamentos (id, tipo, forma, data_vencimento, total, num_parcelas, primeira_parcela),
  os_parcelas (id, numero, data_vencimento, valor, status),
  os_tecnicos_auxiliares (tecnico_id)
`

// ─── Service ──────────────────────────────────────────────────────────────────

export const ordensServicoService = {

  async list(): Promise<OrdemServicoRow[]> {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id, numero, status, km_atual, desconto, data, tecnico_id,
        clientes (nome, documento),
        veiculos (placa, modelo),
        tecnicos!tecnico_id (nome),
        os_itens (qtd, valor_unit)
      `)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(rowToListItem)
  },

  async get(id: string): Promise<OrdemServico> {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(FULL_SELECT)
      .eq('id', id)
      .single()
    if (error) throw error
    return rowToOS(data)
  },

  async upsert(os: Partial<OrdemServico> & { id?: string }): Promise<OrdemServico> {
    const row = {
      data:              os.data              || new Date().toISOString().slice(0, 10),
      cliente_id:        os.cliente_id        || null,
      veiculo_id:        os.veiculo_id        || null,
      km_atual:          os.km_atual          || null,
      status:            os.status            ?? 'rascunho',
      tipo_servico:      os.tipo_servico      || null,
      prazo_estimado:    os.prazo_estimado    || null,
      problema_relatado: os.problema_relatado || null,
      observacoes:       os.observacoes       || null,
      tecnico_id:        os.tecnico_id        || null,
      garantia_dias:     os.garantia_dias     ?? 90,
      desconto:          os.desconto          ?? 0,
    }

    let osId = os.id
    if (osId) {
      const { error } = await supabase.from('ordens_servico').update(row).eq('id', osId)
      if (error) throw error
    } else {
      const { data, error } = await supabase.from('ordens_servico').insert(row).select('id').single()
      if (error) throw error
      osId = data.id as string
    }

    // auxiliares
    await supabase.from('os_tecnicos_auxiliares').delete().eq('os_id', osId)
    if (os.auxiliares && os.auxiliares.length > 0) {
      const { error } = await supabase.from('os_tecnicos_auxiliares').insert(
        os.auxiliares.map(tid => ({ os_id: osId, tecnico_id: tid }))
      )
      if (error) throw error
    }

    // itens
    await supabase.from('os_itens').delete().eq('os_id', osId)
    const allItems = [
      ...(os.servicos ?? []).filter(s => s.descricao).map(s => ({
        os_id: osId, tipo: 'servico', codigo: s.codigo || null,
        descricao: s.descricao, qtd: s.qtd, valor_unit: s.valor_unit,
      })),
      ...(os.pecas ?? []).filter(p => p.descricao).map(p => ({
        os_id: osId, tipo: 'peca', codigo: p.codigo || null,
        descricao: p.descricao, qtd: p.qtd, valor_unit: p.valor_unit,
      })),
    ]
    if (allItems.length > 0) {
      const { error } = await supabase.from('os_itens').insert(allItems)
      if (error) throw error
    }

    // pagamento + parcelas
    await supabase.from('os_parcelas').delete().eq('os_id', osId)
    await supabase.from('os_pagamentos').delete().eq('os_id', osId)
    if (os.pagamento_forma) {
      const { data: pag, error: pErr } = await supabase.from('os_pagamentos').insert({
        os_id: osId,
        tipo:             os.pagamento_tipo             ?? 'unico',
        forma:            os.pagamento_forma,
        data_vencimento:  os.pagamento_data_vencimento  || null,
        total:            os.pagamento_total            ?? 0,
        num_parcelas:     os.pagamento_num_parcelas     || null,
        primeira_parcela: os.pagamento_primeira_parcela || null,
      }).select('id').single()
      if (pErr) throw pErr

      if (pag) {
        const parcelasToInsert =
          os.parcelas && os.parcelas.length > 0
            ? os.parcelas.map(p => ({
                os_id: osId,
                pagamento_id: pag.id,
                numero:          p.numero,
                data_vencimento: p.data_vencimento,
                valor:           p.valor,
                status:          p.status,
              }))
            // pagamento à vista: cria uma parcela única automaticamente
            : [{
                os_id: osId,
                pagamento_id: pag.id,
                numero: 1,
                data_vencimento: os.pagamento_data_vencimento || new Date().toISOString().slice(0, 10),
                valor: os.pagamento_total ?? 0,
                status: 'pendente',
              }]

        const { error: paErr } = await supabase.from('os_parcelas').insert(parcelasToInsert)
        if (paErr) throw paErr
      }
    }

    const { data: savedRow, error: fetchErr } = await supabase
      .from('ordens_servico')
      .select('id, numero, status, garantia_dias, desconto')
      .eq('id', osId!)
      .single()
    if (fetchErr) throw fetchErr

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = savedRow as any
    return rowToOS({
      id:                r.id,
      numero:            r.numero,
      status:            r.status,
      garantia_dias:     r.garantia_dias,
      desconto:          r.desconto,
      data:              os.data              || new Date().toISOString().slice(0, 10),
      km_atual:          os.km_atual          || null,
      tipo_servico:      os.tipo_servico      || null,
      prazo_estimado:    os.prazo_estimado    || null,
      problema_relatado: os.problema_relatado || null,
      observacoes:       os.observacoes       || null,
      cliente_id:        os.cliente_id        || null,
      veiculo_id:        os.veiculo_id        || null,
      tecnico_id:        os.tecnico_id        || null,
      clientes:  { nome: os.cliente_nome ?? '', documento: os.cliente_documento ?? '', rua: '', bairro: '', cidade: '', estado: '' },
      veiculos:  { placa: os.veiculo_placa ?? '', modelo: os.veiculo_modelo ?? '', ano: os.veiculo_ano ?? '' },
      tecnicos:  { nome: '' },
      os_itens: [
        ...(os.servicos ?? []).map(s => ({ id: s.id, tipo: 'servico', codigo: s.codigo, descricao: s.descricao, qtd: s.qtd, valor_unit: s.valor_unit })),
        ...(os.pecas    ?? []).map(p => ({ id: p.id, tipo: 'peca',    codigo: p.codigo, descricao: p.descricao, qtd: p.qtd, valor_unit: p.valor_unit })),
      ],
      os_pagamentos: os.pagamento_forma ? [{
        tipo:             os.pagamento_tipo             ?? 'unico',
        forma:            os.pagamento_forma,
        data_vencimento:  os.pagamento_data_vencimento  ?? null,
        total:            os.pagamento_total            ?? 0,
        num_parcelas:     os.pagamento_num_parcelas     ?? null,
        primeira_parcela: os.pagamento_primeira_parcela ?? null,
      }] : [],
      os_parcelas: (os.parcelas ?? []).map(p => ({
        id: p.id, numero: p.numero, data_vencimento: p.data_vencimento,
        valor: p.valor, status: p.status,
      })),
      os_tecnicos_auxiliares: (os.auxiliares ?? []).map(tid => ({ tecnico_id: tid })),
    })
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('ordens_servico').delete().eq('id', id)
    if (error) throw error
  },

  async listTecnicos(): Promise<Tecnico[]> {
    const { data, error } = await supabase
      .from('tecnicos')
      .select('id, nome')
      .order('nome')
    if (error) throw error
    return (data ?? []) as Tecnico[]
  },

  async listCatalogo(tipo?: 'servico' | 'peca'): Promise<CatalogoItem[]> {
    let q = supabase.from('catalogo_itens').select('id, tipo, codigo, nome, ativo').order('nome')
    if (tipo) q = q.eq('tipo', tipo)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as CatalogoItem[]
  },

  async inserirHistorico(osId: string, statusAnterior: string | null, statusNovo: string): Promise<void> {
    const { error } = await supabase.from('os_historico').insert({
      os_id: osId,
      status_anterior: statusAnterior,
      status_novo: statusNovo,
    })
    if (error) throw error
  },

  async listKanban(): Promise<KanbanOS[]> {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id, numero, status, data, problema_relatado, desconto,
        veiculo_id, tecnico_id,
        clientes (nome),
        veiculos (modelo, placa),
        tecnicos!tecnico_id (nome),
        os_itens (qtd, valor_unit)
      `)
      .not('status', 'in', '("entregue","cancelada")')
      .order('data', { ascending: false })
    if (error) throw error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any): KanbanOS => {
      const items = (row.os_itens ?? []) as { qtd: number; valor_unit: number }[]
      const subtotal = items.reduce((s, i) => s + (i.qtd ?? 0) * (i.valor_unit ?? 0), 0)
      return {
        id: row.id,
        numero: row.numero ?? '',
        status: row.status ?? 'aberta',
        data: row.data ?? '',
        problema_relatado: row.problema_relatado ?? '',
        valor_total: Math.max(0, subtotal - (row.desconto ?? 0)),
        cliente_nome: row.clientes?.nome ?? '',
        veiculo_modelo: row.veiculos?.modelo ?? '',
        veiculo_placa: row.veiculos?.placa ?? '',
        veiculo_id: row.veiculo_id ?? null,
        tecnico_nome: row.tecnicos?.nome ?? '',
        tecnico_id: row.tecnico_id ?? null,
      }
    })
  },

  async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase.from('ordens_servico').update({ status }).eq('id', id)
    if (error) throw error
  },

  async listHistorico(): Promise<HistoricoOSRow[]> {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id, numero, status, desconto, data, data_liberacao, tecnico_id,
        clientes (nome),
        veiculos (placa, modelo),
        tecnicos!tecnico_id (nome),
        os_itens (tipo, descricao, qtd, valor_unit)
      `)
      .in('status', ['veiculo_liberado', 'entregue'])
      .order('data_liberacao', { ascending: false })
    if (error) throw error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any): HistoricoOSRow => {
      const items = (row.os_itens ?? []) as { qtd: number; valor_unit: number; tipo: string; descricao: string }[]
      const subtotal = items.reduce((s, i) => s + (i.qtd ?? 0) * (i.valor_unit ?? 0), 0)
      return {
        id: row.id,
        numero: row.numero ?? '',
        status: row.status ?? 'veiculo_liberado',
        clienteNome: row.clientes?.nome ?? '',
        veiculoPlaca: row.veiculos?.placa ?? '',
        veiculoModelo: row.veiculos?.modelo ?? '',
        tecnicoNome: row.tecnicos?.nome ?? '',
        tecnicoId: row.tecnico_id ?? '',
        valorTotal: Math.max(0, subtotal - (row.desconto ?? 0)),
        data: row.data ?? '',
        dataLiberacao: row.data_liberacao ?? null,
        itens: items.map(i => ({ descricao: i.descricao ?? '', tipo: (i.tipo ?? 'servico') as 'servico' | 'peca' })),
      }
    })
  },

  async getOSStatusHistorico(osId: string): Promise<OSHistoricoItem[]> {
    const { data, error } = await supabase
      .from('os_historico')
      .select('id, status_anterior, status_novo, created_at')
      .eq('os_id', osId)
      .order('created_at', { ascending: true })
    if (error) throw error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any): OSHistoricoItem => ({
      id: r.id,
      statusAnterior: r.status_anterior ?? null,
      statusNovo: r.status_novo ?? '',
      createdAt: r.created_at ?? '',
    }))
  },

  async reabrirOS(id: string, statusAnterior: OrdemServicoStatus): Promise<void> {
    const { error } = await supabase
      .from('ordens_servico')
      .update({ status: 'aberta', data_liberacao: null })
      .eq('id', id)
    if (error) throw error
    await supabase.from('os_historico').insert({
      os_id: id,
      status_anterior: statusAnterior,
      status_novo: 'aberta',
    })
  },

  async historicoVeiculo(veiculoId: string, excludeId?: string): Promise<{ id: string; numero: string; data: string; tipoServico: string }[]> {
    let q = supabase
      .from('ordens_servico')
      .select('id, numero, data, tipo_servico')
      .eq('veiculo_id', veiculoId)
      .neq('status', 'rascunho')
      .order('data', { ascending: false })
      .limit(5)
    if (excludeId) q = q.neq('id', excludeId)
    const { data, error } = await q
    if (error) throw error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({
      id: r.id,
      numero: r.numero ?? '',
      data: r.data ?? '',
      tipoServico: r.tipo_servico ?? '',
    }))
  },
}
