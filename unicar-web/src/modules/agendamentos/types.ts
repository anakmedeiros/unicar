export type TipoEvento = 'agendamento' | 'lembrete'

export interface Agendamento {
  id: string
  tipo: TipoEvento
  titulo: string
  descricao: string | null
  data: string // YYYY-MM-DD
  hora_inicio: string | null // HH:MM
  hora_fim: string | null
  dia_inteiro: boolean
  cliente_id: string | null
  cliente_nome?: string
  os_id: string | null
  tecnico_id: string | null
  tecnico_nome?: string
  cor: string
  criado_em: string
}

export interface AgendamentoForm {
  tipo: TipoEvento
  titulo: string
  descricao: string
  data: string
  hora_inicio: string
  hora_fim: string
  dia_inteiro: boolean
  cliente_id: string
  os_id: string
  tecnico_id: string
  cor: string
}

export const CORES = [
  { value: '#dc2626', label: 'Vermelho' },
  { value: '#1e40af', label: 'Azul' },
  { value: '#065f46', label: 'Verde' },
  { value: '#5b21b6', label: 'Roxo' },
  { value: '#c2410c', label: 'Laranja' },
]

export const EMPTY_FORM: AgendamentoForm = {
  tipo: 'agendamento',
  titulo: '',
  descricao: '',
  data: '',
  hora_inicio: '',
  hora_fim: '',
  dia_inteiro: false,
  cliente_id: '',
  os_id: '',
  tecnico_id: '',
  cor: '#dc2626',
}

// ─── Feriados nacionais 2025-2026 ─────────────────────────────────────────────

export const FERIADOS: Record<string, string> = {
  '2025-01-01': 'Confraternização Universal',
  '2025-03-03': 'Carnaval',
  '2025-03-04': 'Carnaval',
  '2025-04-18': 'Sexta-feira Santa',
  '2025-04-21': 'Tiradentes',
  '2025-05-01': 'Dia do Trabalho',
  '2025-06-19': 'Corpus Christi',
  '2025-09-07': 'Independência',
  '2025-10-12': 'Nossa Sra. Aparecida',
  '2025-11-02': 'Finados',
  '2025-11-15': 'Proclamação da República',
  '2025-12-25': 'Natal',
  '2026-01-01': 'Confraternização Universal',
  '2026-02-16': 'Carnaval',
  '2026-02-17': 'Carnaval',
  '2026-04-03': 'Sexta-feira Santa',
  '2026-04-21': 'Tiradentes',
  '2026-05-01': 'Dia do Trabalho',
  '2026-06-04': 'Corpus Christi',
  '2026-09-07': 'Independência',
  '2026-10-12': 'Nossa Sra. Aparecida',
  '2026-11-02': 'Finados',
  '2026-11-15': 'Proclamação da República',
  '2026-12-25': 'Natal',
}
