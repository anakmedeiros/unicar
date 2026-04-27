export type OSStatus = 'open' | 'progress' | 'waiting' | 'done'

export interface OS {
  num: string
  cliente: string
  veiculo: string
  servico: string
  tec: string
  status: OSStatus
  valor: string
  dias?: number
}

// ─── Ordens de Serviço ────────────────────────────────────────────────────────

export type OrdemServicoStatus =
  | 'rascunho'
  | 'aguardando_aprovacao'
  | 'aberta'
  | 'em_execucao'
  | 'aguardando_peca'
  | 'pronta'
  | 'entregue'
  | 'cancelada'

export type TipoServico =
  | 'revisao_preventiva'
  | 'revisao_corretiva'
  | 'funilaria'
  | 'eletrica'
  | 'suspensao'
  | 'outros'

export type FormaPagamento =
  | 'dinheiro'
  | 'pix'
  | 'cartao_debito'
  | 'cartao_credito'
  | 'boleto'

export interface Tecnico {
  id: string
  nome: string
}

export interface CatalogoItem {
  id: string
  tipo: 'servico' | 'peca'
  codigo: string | null
  nome: string
  ativo: boolean
}

export interface OSItem {
  id: string
  tipo: 'servico' | 'peca'
  codigo: string
  descricao: string
  qtd: number
  valor_unit: number
}

export interface OSParcela {
  id: string
  numero: number
  data_vencimento: string
  valor: number
  status: 'pendente' | 'pago' | 'atrasado'
}

export interface OrdemServico {
  id: string
  numero: string
  data: string
  cliente_id: string
  cliente_nome: string
  cliente_documento: string
  cliente_endereco: string
  veiculo_id: string
  veiculo_placa: string
  veiculo_modelo: string
  veiculo_ano: string
  km_atual: string
  status: OrdemServicoStatus
  tipo_servico: TipoServico | ''
  prazo_estimado: string
  problema_relatado: string
  observacoes: string
  tecnico_id: string
  auxiliares: string[]
  garantia_dias: number
  desconto: number
  servicos: OSItem[]
  pecas: OSItem[]
  pagamento_tipo: 'unico' | 'parcelado'
  pagamento_forma: FormaPagamento | ''
  pagamento_data_vencimento: string
  pagamento_total: number
  pagamento_num_parcelas: number
  pagamento_primeira_parcela: string
  parcelas: OSParcela[]
}

export interface OrdemServicoRow {
  id: string
  numero: string
  status: OrdemServicoStatus
  clienteNome: string
  clienteDocumento: string
  veiculoPlaca: string
  veiculoModelo: string
  kmAtual: string
  tecnicoNome: string
  tecnicoId: string
  valorTotal: number
  data: string
}

export interface KanbanOS {
  id: string
  numero: string
  status: OrdemServicoStatus
  data: string
  problema_relatado: string
  valor_total: number
  cliente_nome: string
  veiculo_modelo: string
  veiculo_placa: string
  veiculo_id: string | null
  tecnico_nome: string
  tecnico_id: string | null
}

export interface NavItem {
  id: string
  label: string
  icon: string
  section?: string | null
}

export interface Veiculo {
  id: string
  placa: string
  modelo: string
  ano: string
  km: string
}

export interface Cliente {
  id: string
  tipo: 'PF' | 'PJ'
  nome: string
  documento: string          // CPF (11 dígitos) ou CNPJ (14 dígitos), só números
  nomeFantasia?: string
  inscricaoEstadual?: string
  responsavel?: string
  telefone: string
  telefone2?: string
  email?: string
  cep?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  veiculos: Veiculo[]
}
