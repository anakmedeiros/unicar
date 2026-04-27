import type { OrdemServicoStatus } from '../../types'

export type StatusPagamento = 'pago' | 'pendente' | 'atrasado'

export interface Parcela {
  id: string
  numero: number
  data_vencimento: string
  valor: number
  statusBanco: 'pago' | 'pendente' | 'atrasado'
  statusEfetivo: StatusPagamento
  data_pagamento: string | null
  valor_recebido: number | null
  forma_pagamento_recebido: string | null
  // OS
  os_id: string
  os_numero: string
  os_status: OrdemServicoStatus
  // Cliente
  cliente_nome: string
  cliente_telefone: string
  // Veículo
  veiculo_modelo: string
  veiculo_placa: string
  // Pagamento
  forma_pagamento: string
  pagamento_tipo: string
  num_parcelas: number
  pagamento_id: string
}

export interface RecebimentoParcialParams {
  parcelaId: string
  osId: string
  pagamentoId: string
  valorRecebido: number
  valorEmAberto: number
  novoVencimento: string
  formaPagamento: string
  parcelaNumero: number
}

export const FORMA_LABEL: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_debito: 'Cartão débito',
  cartao_credito: 'Cartão crédito',
  boleto: 'Boleto',
}

export const STATUS_PAG_STYLE: Record<StatusPagamento, { color: string; bg: string; label: string }> = {
  pago:     { color: '#15803D', bg: 'rgba(22,163,74,0.12)',    label: 'Recebido' },
  pendente: { color: '#854D0E', bg: 'rgba(234,179,8,0.14)',    label: 'Pendente' },
  atrasado: { color: '#B91C1C', bg: 'rgba(220,38,38,0.12)',    label: 'Atrasado' },
}

export const OS_STATUS_LABEL: Record<string, string> = {
  rascunho:            'Rascunho',
  aguardando_aprovacao:'Aguard. aprovação',
  aberta:              'Aberta',
  em_execucao:         'Em execução',
  aguardando_peca:     'Aguard. peça',
  pronta:              'Pronta',
  entregue:            'Entregue',
  cancelada:           'Cancelada',
}

export const OS_STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  rascunho:            { bg: 'rgba(138,138,138,0.12)', color: '#6A6864' },
  aguardando_aprovacao:{ bg: 'rgba(234,179,8,0.14)',   color: '#854D0E' },
  aberta:              { bg: 'rgba(217,119,6,0.12)',   color: '#B45309' },
  em_execucao:         { bg: 'rgba(37,99,235,0.12)',   color: '#1D4ED8' },
  aguardando_peca:     { bg: 'rgba(124,58,237,0.12)',  color: '#6D28D9' },
  pronta:              { bg: 'rgba(22,163,74,0.12)',   color: '#15803D' },
  entregue:            { bg: 'rgba(22,101,52,0.12)',   color: '#14532D' },
  cancelada:           { bg: 'rgba(220,38,38,0.12)',   color: '#B91C1C' },
}

export function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function getDescricao(forma: string, tipo: string, numero: number, numParcelas: number): string {
  const label = FORMA_LABEL[forma] ?? forma
  if (!label) return '—'
  if (tipo === 'unico' || numParcelas <= 1) return `${label} · à vista`
  return `${label} · ${numero}/${numParcelas}`
}
