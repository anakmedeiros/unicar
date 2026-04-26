import type { OS, Cliente } from '../types'

export const MOCK_OS: OS[] = [
  { num: '#OS-2641', cliente: 'Marcos Lima',     veiculo: 'VW Gol G6 · ABC-1234',      servico: 'Revisão 40k + Troca de óleo',      tec: 'Rafael S.',    status: 'progress', valor: 'R$ 1.450,00', dias: 2 },
  { num: '#OS-2640', cliente: 'Juliana Pereira', veiculo: 'Honda Civic · DEF-5678',     servico: 'Alinhamento + Balanceamento',      tec: 'Anderson C.',  status: 'open',     valor: 'R$ 480,00',   dias: 1 },
  { num: '#OS-2639', cliente: 'Tech Logística',  veiculo: 'Ford Cargo · MEC-2K33',      servico: 'Diagnóstico motor diesel',          tec: 'Bruno T.',     status: 'waiting',  valor: 'R$ 350,00',   dias: 5 },
  { num: '#OS-2638', cliente: 'Ana Castro',      veiculo: 'Fiat Argo · QFR-9182',       servico: 'Troca de pastilhas + discos',      tec: 'Rafael S.',    status: 'progress', valor: 'R$ 920,00',   dias: 3 },
  { num: '#OS-2637', cliente: 'Eduardo Souza',   veiculo: 'Toyota Hilux · TAU-7H88',    servico: 'Suspensão dianteira completa',     tec: 'Anderson C.',  status: 'open',     valor: 'R$ 3.280,00', dias: 6 },
  { num: '#OS-2636', cliente: 'Mariana Reis',    veiculo: 'Hyundai HB20 · NPE-4421',   servico: 'Troca de embreagem',               tec: 'Bruno T.',     status: 'progress', valor: 'R$ 2.140,00', dias: 1 },
  { num: '#OS-2630', cliente: 'Patrícia Nunes',  veiculo: 'Renault Kwid · KWD-9911',   servico: 'Troca de bateria',                 tec: 'Rafael S.',    status: 'done',     valor: 'R$ 540,00',   dias: 0 },
  { num: '#OS-2628', cliente: 'Logística Sul',   veiculo: 'Iveco Daily · LOG-3K22',    servico: 'Revisão diesel',                   tec: 'Bruno T.',     status: 'done',     valor: 'R$ 1.890,00', dias: 0 },
]

export const STATUS_LABEL: Record<string, string> = {
  open: 'Aberta',
  progress: 'Em execução',
  waiting: 'Aguardando peça',
  done: 'Concluída',
}

export const KANBAN_COLUMNS = [
  { key: 'open'    as const, title: 'Abertas',         tone: '#C0192A', bg: 'rgba(227,30,45,0.05)' },
  { key: 'progress'as const, title: 'Em execução',     tone: '#B25E09', bg: 'rgba(245,158,11,0.06)' },
  { key: 'waiting' as const, title: 'Aguardando peça', tone: '#4F46D6', bg: 'rgba(99,102,241,0.05)' },
  { key: 'done'    as const, title: 'Prontas',         tone: '#0D6E3D', bg: 'rgba(16,136,74,0.05)' },
]

export const BAR_CHART_DATA = [40, 55, 38, 62, 48, 70, 52, 68, 72, 65, 80, 84]

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: 'cli-001',
    tipo: 'PF',
    nome: 'Marcos Lima',
    documento: '34512678901',
    telefone: '(11) 99876-5432',
    email: 'marcos.lima@email.com',
    cep: '01310-100',
    rua: 'Av. Paulista',
    numero: '1578',
    complemento: 'Apto 42',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    veiculos: [
      { id: 'v-001', placa: 'ABC-1234', modelo: 'VW Gol G6', ano: '2018', km: '62.400' },
    ],
  },
  {
    id: 'cli-002',
    tipo: 'PF',
    nome: 'Juliana Pereira',
    documento: '56789012345',
    telefone: '(11) 98765-4321',
    telefone2: '(11) 3344-5566',
    email: 'juliana.p@email.com',
    cep: '04038-001',
    rua: 'Rua Domingos de Morais',
    numero: '320',
    bairro: 'Vila Mariana',
    cidade: 'São Paulo',
    estado: 'SP',
    veiculos: [
      { id: 'v-002', placa: 'DEF-5678', modelo: 'Honda Civic', ano: '2021', km: '28.100' },
      { id: 'v-003', placa: 'GHI-9012', modelo: 'Toyota Corolla', ano: '2019', km: '41.900' },
    ],
  },
  {
    id: 'cli-003',
    tipo: 'PJ',
    nome: 'Tech Logística Ltda',
    documento: '12345678000190',
    nomeFantasia: 'Tech Logística',
    inscricaoEstadual: '123.456.789.110',
    responsavel: 'Roberto Alves',
    telefone: '(11) 3344-7788',
    email: 'frota@techlogistica.com.br',
    cep: '06454-000',
    rua: 'Av. das Nações Unidas',
    numero: '12901',
    bairro: 'Brooklin',
    cidade: 'São Paulo',
    estado: 'SP',
    veiculos: [
      { id: 'v-004', placa: 'MEC-2K33', modelo: 'Ford Cargo 816', ano: '2020', km: '189.400' },
      { id: 'v-005', placa: 'LOG-3K22', modelo: 'Iveco Daily', ano: '2019', km: '210.800' },
    ],
  },
  {
    id: 'cli-004',
    tipo: 'PF',
    nome: 'Ana Castro',
    documento: '78901234567',
    telefone: '(21) 97654-3210',
    email: 'ana.castro@gmail.com',
    cep: '22410-003',
    rua: 'Rua Visconde de Pirajá',
    numero: '550',
    bairro: 'Ipanema',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    veiculos: [
      { id: 'v-006', placa: 'QFR-9182', modelo: 'Fiat Argo', ano: '2022', km: '15.200' },
    ],
  },
  {
    id: 'cli-005',
    tipo: 'PF',
    nome: 'Eduardo Souza',
    documento: '90123456789',
    telefone: '(11) 96543-2109',
    email: 'edu.souza@hotmail.com',
    cep: '13330-110',
    rua: 'Av. Brasil',
    numero: '200',
    bairro: 'Centro',
    cidade: 'Indaiatuba',
    estado: 'SP',
    veiculos: [
      { id: 'v-007', placa: 'TAU-7H88', modelo: 'Toyota Hilux', ano: '2023', km: '8.700' },
    ],
  },
  {
    id: 'cli-006',
    tipo: 'PJ',
    nome: 'Logística Sul Transportes S.A.',
    documento: '98765432000112',
    nomeFantasia: 'Logística Sul',
    responsavel: 'Fernando Dias',
    telefone: '(51) 3233-4455',
    email: 'operacoes@logisticasul.com.br',
    cidade: 'Porto Alegre',
    estado: 'RS',
    veiculos: [
      { id: 'v-008', placa: 'LOG-3K22', modelo: 'Iveco Daily', ano: '2021', km: '95.300' },
    ],
  },
]
