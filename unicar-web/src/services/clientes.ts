import { supabase } from '../lib/supabase'
import type { Cliente, Veiculo } from '../types'

// ─── Row → frontend type ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCliente(row: any): Cliente {
  return {
    id:               row.id,
    tipo:             row.tipo,
    nome:             row.nome,
    documento:        row.documento,
    nomeFantasia:     row.nome_fantasia     ?? undefined,
    inscricaoEstadual:row.inscricao_estadual ?? undefined,
    responsavel:      row.responsavel       ?? undefined,
    telefone:         row.telefone,
    telefone2:        row.telefone2         ?? undefined,
    email:            row.email             ?? undefined,
    cep:              row.cep               ?? undefined,
    rua:              row.rua               ?? undefined,
    numero:           row.numero            ?? undefined,
    complemento:      row.complemento       ?? undefined,
    bairro:           row.bairro            ?? undefined,
    cidade:           row.cidade            ?? undefined,
    estado:           row.estado            ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    veiculos: (row.veiculos ?? []).map((v: any): Veiculo => ({
      id:     v.id,
      placa:  v.placa,
      modelo: v.modelo,
      ano:    v.ano  ?? '',
      km:     v.km   ?? '',
    })),
  }
}

// ─── Frontend type → DB row ───────────────────────────────────────────────────

function clienteToRow(c: Omit<Cliente, 'id' | 'veiculos'>) {
  return {
    tipo:              c.tipo,
    nome:              c.nome,
    documento:         c.documento,
    nome_fantasia:     c.nomeFantasia      || null,
    inscricao_estadual:c.inscricaoEstadual || null,
    responsavel:       c.responsavel       || null,
    telefone:          c.telefone,
    telefone2:         c.telefone2         || null,
    email:             c.email             || null,
    cep:               c.cep               || null,
    rua:               c.rua               || null,
    numero:            c.numero            || null,
    complemento:       c.complemento       || null,
    bairro:            c.bairro            || null,
    cidade:            c.cidade            || null,
    estado:            c.estado            || null,
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export const clientesService = {

  async list(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*, veiculos(*)')
      .order('nome')
    if (error) throw error
    return (data ?? []).map(rowToCliente)
  },

  async create(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    const { veiculos, ...rest } = cliente

    const { data: row, error } = await supabase
      .from('clientes')
      .insert(clienteToRow(rest))
      .select()
      .single()
    if (error) throw error

    if (veiculos.length > 0) {
      const { error: vErr } = await supabase
        .from('veiculos')
        .insert(veiculos.map(v => ({
          cliente_id: row.id,
          placa:      v.placa,
          modelo:     v.modelo,
          ano:        v.ano   || null,
          km:         v.km    || null,
        })))
      if (vErr) throw vErr
    }

    const { data: full, error: fErr } = await supabase
      .from('clientes')
      .select('*, veiculos(*)')
      .eq('id', row.id)
      .single()
    if (fErr) throw fErr
    return rowToCliente(full)
  },

  async update(cliente: Cliente): Promise<Cliente> {
    const { id, veiculos, ...rest } = cliente

    const { error } = await supabase
      .from('clientes')
      .update(clienteToRow(rest))
      .eq('id', id)
    if (error) throw error

    // Substitui veículos: apaga os antigos e insere os novos
    const { error: delErr } = await supabase
      .from('veiculos')
      .delete()
      .eq('cliente_id', id)
    if (delErr) throw delErr

    if (veiculos.length > 0) {
      const { error: insErr } = await supabase
        .from('veiculos')
        .insert(veiculos.map(v => ({
          cliente_id: id,
          placa:      v.placa,
          modelo:     v.modelo,
          ano:        v.ano   || null,
          km:         v.km    || null,
        })))
      if (insErr) throw insErr
    }

    const { data: full, error: fErr } = await supabase
      .from('clientes')
      .select('*, veiculos(*)')
      .eq('id', id)
      .single()
    if (fErr) throw fErr
    return rowToCliente(full)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
