import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Parcela, RecebimentoParcialParams } from '../types'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function computeStatus(status: string, data_vencimento: string): 'pago' | 'pendente' | 'atrasado' {
  if (status === 'pago') return 'pago'
  if (data_vencimento < todayStr()) return 'atrasado'
  return 'pendente'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Parcela {
  const pag = Array.isArray(row.os_pagamentos) ? row.os_pagamentos[0] : row.os_pagamentos
  const os = pag ? (Array.isArray(pag.ordens_servico) ? pag.ordens_servico[0] : pag.ordens_servico) : null
  const cliente = os ? (Array.isArray(os.clientes) ? os.clientes[0] : os.clientes) : null
  const veiculo = os ? (Array.isArray(os.veiculos) ? os.veiculos[0] : os.veiculos) : null

  const dv = row.data_vencimento ?? ''
  const statusEfetivo = computeStatus(row.status ?? 'pendente', dv)

  return {
    id: row.id,
    numero: row.numero ?? 1,
    data_vencimento: dv,
    valor: row.valor ?? 0,
    statusBanco: row.status ?? 'pendente',
    statusEfetivo,
    data_pagamento: row.data_pagamento ?? null,
    valor_recebido: row.valor_recebido ?? null,
    forma_pagamento_recebido: row.forma_pagamento_recebido ?? null,
    os_id: pag?.os_id ?? '',
    os_numero: os?.numero ?? '',
    os_status: os?.status ?? 'aberta',
    cliente_nome: cliente?.nome ?? '',
    cliente_telefone: cliente?.telefone ?? '',
    veiculo_modelo: veiculo?.modelo ?? '',
    veiculo_placa: veiculo?.placa ?? '',
    forma_pagamento: pag?.forma ?? '',
    pagamento_tipo: pag?.tipo ?? '',
    num_parcelas: pag?.num_parcelas ?? 1,
    pagamento_id: row.pagamento_id ?? '',
  }
}

export function useContasReceber() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['contas-receber'],
    queryFn: async (): Promise<Parcela[]> => {
      const { data, error } = await supabase
        .from('os_parcelas')
        .select(`
          id, numero, data_vencimento, valor, status,
          data_pagamento, valor_recebido, forma_pagamento_recebido,
          pagamento_id,
          os_pagamentos (
            tipo, forma, num_parcelas, os_id,
            ordens_servico (
              numero, status,
              clientes (nome, telefone),
              veiculos (modelo, placa)
            )
          )
        `)
        .order('data_vencimento', { ascending: true })
      if (error) throw error
      return (data ?? []).map(mapRow)
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('contas-receber-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'os_parcelas' }, () => {
        qc.invalidateQueries({ queryKey: ['contas-receber'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])

  return query
}

export function useMarcarRecebido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('os_parcelas')
        .update({ status: 'pago', data_pagamento: todayStr() })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contas-receber'] }),
  })
}

export function useDesfazerRecebimento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('os_parcelas')
        .update({ status: 'pendente', data_pagamento: null, valor_recebido: null, forma_pagamento_recebido: null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contas-receber'] })
      qc.invalidateQueries({ queryKey: ['resumo-receber'] })
    },
  })
}

export function useRecebimentoParcial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: RecebimentoParcialParams) => {
      const hoje = todayStr()

      const { error: e1 } = await supabase
        .from('os_parcelas')
        .update({
          status: 'pago',
          data_pagamento: hoje,
          valor_recebido: p.valorRecebido,
          forma_pagamento_recebido: p.formaPagamento,
        })
        .eq('id', p.parcelaId)
      if (e1) throw e1

      const { error: e2 } = await supabase
        .from('os_parcelas')
        .insert({
          os_id: p.osId,
          pagamento_id: p.pagamentoId,
          numero: p.parcelaNumero + 1,
          data_vencimento: p.novoVencimento,
          valor: p.valorEmAberto,
          status: 'pendente',
        })
      if (e2) throw e2
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contas-receber'] }),
  })
}
