import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Agendamento, AgendamentoForm, ParcelaCalendario } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Agendamento {
  const cliente = Array.isArray(row.clientes) ? row.clientes[0] : row.clientes
  const tecnico = Array.isArray(row.tecnicos) ? row.tecnicos[0] : row.tecnicos
  return {
    id: row.id,
    tipo: row.tipo,
    titulo: row.titulo,
    descricao: row.descricao ?? null,
    data: row.data,
    hora_inicio: row.hora_inicio ?? null,
    hora_fim: row.hora_fim ?? null,
    dia_inteiro: row.dia_inteiro ?? false,
    cliente_id: row.cliente_id ?? null,
    cliente_nome: cliente?.nome ?? undefined,
    os_id: row.os_id ?? null,
    tecnico_id: row.tecnico_id ?? null,
    tecnico_nome: tecnico?.nome ?? undefined,
    cor: row.cor ?? '#dc2626',
    valor: row.valor ?? null,
    criado_em: row.criado_em ?? '',
  }
}

export function useAgendamentos(ano: number, mes: number) {
  const qc = useQueryClient()

  const firstDay = `${ano}-${String(mes).padStart(2, '0')}-01`
  const lastDay = new Date(ano, mes, 0).toISOString().slice(0, 10)

  const query = useQuery({
    queryKey: ['agendamentos', ano, mes],
    queryFn: async (): Promise<Agendamento[]> => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id, tipo, titulo, descricao, data, hora_inicio, hora_fim,
          dia_inteiro, cliente_id, os_id, tecnico_id, cor, valor, criado_em,
          clientes (nome),
          tecnicos (nome)
        `)
        .gte('data', firstDay)
        .lte('data', lastDay)
        .order('data', { ascending: true })
        .order('hora_inicio', { ascending: true })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`agendamentos-rt-${ano}-${mes}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agendamentos' }, () => {
        qc.invalidateQueries({ queryKey: ['agendamentos', ano, mes] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc, ano, mes])

  return query
}

export function useCreateAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: AgendamentoForm) => {
      const payload = {
        tipo: form.tipo,
        titulo: form.titulo,
        descricao: form.descricao || null,
        data: form.data,
        hora_inicio: form.hora_inicio || null,
        hora_fim: form.hora_fim || null,
        dia_inteiro: form.dia_inteiro,
        cliente_id: form.cliente_id || null,
        os_id: form.os_id || null,
        tecnico_id: form.tecnico_id || null,
        cor: form.cor,
        valor: form.valor ? parseFloat(form.valor.replace(',', '.')) : null,
      }
      const { error } = await supabase.from('agendamentos').insert(payload)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}

export function useUpdateAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: AgendamentoForm }) => {
      const payload = {
        tipo: form.tipo,
        titulo: form.titulo,
        descricao: form.descricao || null,
        data: form.data,
        hora_inicio: form.hora_inicio || null,
        hora_fim: form.hora_fim || null,
        dia_inteiro: form.dia_inteiro,
        cliente_id: form.cliente_id || null,
        os_id: form.os_id || null,
        tecnico_id: form.tecnico_id || null,
        cor: form.cor,
        valor: form.valor ? parseFloat(form.valor.replace(',', '.')) : null,
      }
      const { error } = await supabase.from('agendamentos').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}

export function useParcelasCalendario(ano: number, mes: number) {
  const firstDay = `${ano}-${String(mes).padStart(2, '0')}-01`
  const lastDay = new Date(ano, mes, 0).toISOString().slice(0, 10)

  return useQuery({
    queryKey: ['parcelas-calendario', ano, mes],
    queryFn: async (): Promise<ParcelaCalendario[]> => {
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from('os_parcelas')
        .select(`
          id, data_vencimento, valor, status,
          os_pagamentos (
            ordens_servico (
              numero, status,
              clientes (nome)
            )
          )
        `)
        .gte('data_vencimento', firstDay)
        .lte('data_vencimento', lastDay)
        .in('status', ['pendente', 'atrasado'])
      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => {
        const pag = Array.isArray(row.os_pagamentos) ? row.os_pagamentos[0] : row.os_pagamentos
        const os  = pag ? (Array.isArray(pag.ordens_servico) ? pag.ordens_servico[0] : pag.ordens_servico) : null
        const cli = os  ? (Array.isArray(os.clientes) ? os.clientes[0] : os.clientes) : null
        return {
          id: row.id,
          data_vencimento: row.data_vencimento ?? '',
          valor: row.valor ?? 0,
          os_numero: os?.numero ?? '—',
          cliente_nome: cli?.nome ?? '—',
          os_status: os?.status ?? 'aberta',
          status: (row.data_vencimento ?? '') < today ? 'atrasado' : 'pendente',
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).filter((p: any) => p.os_status !== 'cancelada') as ParcelaCalendario[]
    },
  })
}

export function useDeleteAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agendamentos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}
