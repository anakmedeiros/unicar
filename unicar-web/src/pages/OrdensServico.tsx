import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Topbar } from '../components/layout/Topbar'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/Icon'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { ordensServicoService } from '../services/ordens-servico'
import { catalogoService } from '../services/catalogo'
import { clientesService } from '../services/clientes'
import { supabase } from '../lib/supabase'
import { ClienteEditModal } from '../components/ClienteEditModal'
import { CatalogoSearchInput } from '../shared/components/CatalogoSearchInput'
import { ToastNotification } from '../shared/components/Toast'
import type { ToastItem } from '../shared/components/Toast'
import type {
  OrdemServicoStatus,
  OrdemServico,
  OrdemServicoRow,
  Tecnico,
  CatalogoItem,
  Cliente,
} from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<OrdemServicoStatus, string> = {
  rascunho:            'Rascunho',
  aguardando_aprovacao:'Aguardando aprovação',
  aberta:              'Aberta',
  em_execucao:         'Em execução',
  aguardando_peca:     'Aguardando peça',
  pronta:              'Pronta',
  veiculo_liberado:    'Veículo Liberado',
  entregue:            'Entregue',
  cancelada:           'Cancelada',
}

const STATUS_COLOR: Record<OrdemServicoStatus, { bg: string; color: string }> = {
  rascunho:            { bg: 'rgba(138,138,138,0.12)', color: '#6A6864' },
  aguardando_aprovacao:{ bg: 'rgba(234,179,8,0.14)',   color: '#854D0E' },
  aberta:              { bg: 'rgba(217,119,6,0.12)',   color: '#B45309' },
  em_execucao:         { bg: 'rgba(37,99,235,0.12)',   color: '#1D4ED8' },
  aguardando_peca:     { bg: 'rgba(124,58,237,0.12)',  color: '#6D28D9' },
  pronta:              { bg: 'rgba(22,163,74,0.12)',   color: '#15803D' },
  veiculo_liberado:    { bg: '#d1fae5',                color: '#065f46' },
  entregue:            { bg: 'rgba(22,101,52,0.12)',   color: '#14532D' },
  cancelada:           { bg: 'rgba(220,38,38,0.12)',   color: '#B91C1C' },
}

const TIPO_SERVICO_OPTIONS = [
  { value: 'revisao_preventiva', label: 'Revisão preventiva' },
  { value: 'revisao_corretiva',  label: 'Revisão corretiva' },
  { value: 'funilaria',          label: 'Funilaria' },
  { value: 'eletrica',           label: 'Elétrica' },
  { value: 'suspensao',          label: 'Suspensão' },
  { value: 'outros',             label: 'Outros' },
]

const FORMA_PAGAMENTO_OPTIONS = [
  { value: 'dinheiro',      label: 'Dinheiro' },
  { value: 'pix',           label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão débito' },
  { value: 'cartao_credito',label: 'Cartão crédito' },
  { value: 'boleto',        label: 'Boleto' },
]

const PARCELA_STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago',     label: 'Pago' },
  { value: 'atrasado', label: 'Atrasado' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatDoc(doc: string): string {
  const d = doc.replace(/\D/g, '')
  if (d.length === 11)
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
  if (d.length === 14)
    return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
  return doc
}

function displayPlate(raw: string) {
  if (raw.length >= 7) return `${raw.slice(0,3)}-${raw.slice(3)}`
  return raw
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

function generateParcelas(total: number, n: number, firstDate: string) {
  const base = Math.floor((total / n) * 100) / 100
  const result: OSParcelaForm[] = []
  for (let i = 0; i < n; i++) {
    const isLast = i === n - 1
    result.push({
      id: crypto.randomUUID(),
      numero: i + 1,
      dataVencimento: addMonths(firstDate, i),
      valor: isLast ? (total - base * (n - 1)).toFixed(2) : base.toFixed(2),
      status: 'pendente',
    })
  }
  return result
}

// ─── Local types ──────────────────────────────────────────────────────────────

interface OSItemForm {
  id: string
  codigo: string
  descricao: string
  qtd: string
  valorUnit: string
}

interface OSParcelaForm {
  id: string
  numero: number
  dataVencimento: string
  valor: string
  status: 'pendente' | 'pago' | 'atrasado'
}

interface OSFormData {
  numero: string
  data: string
  clienteId: string
  clienteNome: string
  clienteDocumento: string
  clienteEndereco: string
  veiculoId: string
  kmAtual: string
  status: OrdemServicoStatus
  tipoServico: string
  prazoEstimado: string
  problemaRelatado: string
  servicos: OSItemForm[]
  pecas: OSItemForm[]
  observacoes: string
  pagamentoTipo: 'unico' | 'parcelado'
  pagamentoForma: string
  pagamentoDataVencimento: string
  pagamentoTotal: string
  pagamentoNumeroParcelas: string
  pagamentoPrimeiraParcela: string
  parcelas: OSParcelaForm[]
  tecnicoId: string
  auxiliares: string[]
  garantiaDias: string
  desconto: string
}

const EMPTY_FORM: OSFormData = {
  numero: '',
  data: today(),
  clienteId: '',
  clienteNome: '',
  clienteDocumento: '',
  clienteEndereco: '',
  veiculoId: '',
  kmAtual: '',
  status: 'rascunho',
  tipoServico: '',
  prazoEstimado: '',
  problemaRelatado: '',
  servicos: [],
  pecas: [],
  observacoes: '',
  pagamentoTipo: 'unico',
  pagamentoForma: '',
  pagamentoDataVencimento: '',
  pagamentoTotal: '',
  pagamentoNumeroParcelas: '',
  pagamentoPrimeiraParcela: '',
  parcelas: [],
  tecnicoId: '',
  auxiliares: [],
  garantiaDias: '90',
  desconto: '',
}

function osToForm(os: OrdemServico): OSFormData {
  return {
    numero:               os.numero,
    data:                 os.data || today(),
    clienteId:            os.cliente_id,
    clienteNome:          os.cliente_nome,
    clienteDocumento:     os.cliente_documento,
    clienteEndereco:      os.cliente_endereco,
    veiculoId:            os.veiculo_id,
    kmAtual:              os.km_atual,
    status:               os.status,
    tipoServico:          os.tipo_servico,
    prazoEstimado:        os.prazo_estimado,
    problemaRelatado:     os.problema_relatado,
    servicos:             os.servicos.map(s => ({ id: s.id, codigo: s.codigo, descricao: s.descricao, qtd: s.qtd.toString(), valorUnit: s.valor_unit.toFixed(2) })),
    pecas:                os.pecas.map(p => ({ id: p.id, codigo: p.codigo, descricao: p.descricao, qtd: p.qtd.toString(), valorUnit: p.valor_unit.toFixed(2) })),
    observacoes:          os.observacoes,
    pagamentoTipo:        os.pagamento_tipo,
    pagamentoForma:       os.pagamento_forma,
    pagamentoDataVencimento: os.pagamento_data_vencimento,
    pagamentoTotal:       os.pagamento_total > 0 ? os.pagamento_total.toFixed(2) : '',
    pagamentoNumeroParcelas: os.pagamento_num_parcelas > 0 ? os.pagamento_num_parcelas.toString() : '',
    pagamentoPrimeiraParcela: os.pagamento_primeira_parcela,
    parcelas:             os.parcelas.map(p => ({ id: p.id, numero: p.numero, dataVencimento: p.data_vencimento, valor: p.valor.toFixed(2), status: p.status })),
    tecnicoId:            os.tecnico_id,
    auxiliares:           os.auxiliares,
    garantiaDias:         os.garantia_dias > 0 ? os.garantia_dias.toString() : '90',
    desconto:             os.desconto > 0 ? os.desconto.toFixed(2) : '',
  }
}

function formToPayload(form: OSFormData, id?: string): Partial<OrdemServico> & { id?: string } {
  return {
    id,
    numero:               form.numero,
    data:                 form.data,
    cliente_id:           form.clienteId  || undefined,
    cliente_nome:         form.clienteNome,
    cliente_documento:    form.clienteDocumento,
    cliente_endereco:     form.clienteEndereco,
    veiculo_id:           form.veiculoId   || undefined,
    km_atual:             form.kmAtual,
    status:               form.status,
    tipo_servico:         form.tipoServico as OrdemServico['tipo_servico'],
    prazo_estimado:       form.prazoEstimado,
    problema_relatado:    form.problemaRelatado,
    observacoes:          form.observacoes,
    tecnico_id:           form.tecnicoId || undefined,
    auxiliares:           form.auxiliares,
    garantia_dias:        parseInt(form.garantiaDias) || 90,
    desconto:             parseFloat(form.desconto) || 0,
    servicos:             form.servicos.filter(s => s.descricao).map(s => ({ id: s.id, tipo: 'servico', codigo: s.codigo, descricao: s.descricao, qtd: parseFloat(s.qtd) || 1, valor_unit: parseFloat(s.valorUnit) || 0 })),
    pecas:                form.pecas.filter(p => p.descricao).map(p => ({ id: p.id, tipo: 'peca', codigo: p.codigo, descricao: p.descricao, qtd: parseFloat(p.qtd) || 1, valor_unit: parseFloat(p.valorUnit) || 0 })),
    pagamento_tipo:       form.pagamentoTipo,
    pagamento_forma:      form.pagamentoForma as OrdemServico['pagamento_forma'],
    pagamento_data_vencimento: form.pagamentoDataVencimento,
    pagamento_total:      parseFloat(form.pagamentoTotal) || 0,
    pagamento_num_parcelas: parseInt(form.pagamentoNumeroParcelas) || 0,
    pagamento_primeira_parcela: form.pagamentoPrimeiraParcela,
    parcelas:             form.parcelas.map(p => ({ id: p.id, numero: p.numero, data_vencimento: p.dataVencimento, valor: parseFloat(p.valor) || 0, status: p.status })),
  }
}

// ─── Small reusable components ────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: '#6A6864', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: '#EBE8E2' }} />
    </div>
  )
}

function StatusBadge({ status }: { status: OrdemServicoStatus }) {
  const { bg, color } = STATUS_COLOR[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, background: bg, color, whiteSpace: 'nowrap' }}>
      {STATUS_LABEL[status]}
    </span>
  )
}

// ─── Cliente search dropdown ──────────────────────────────────────────────────

interface ClienteResult {
  id: string
  nome: string
  documento: string
  telefone?: string
  tipo: string
  rua?: string
  bairro?: string
  cidade?: string
  estado?: string
}

interface ClienteSearchProps {
  value: string
  onSelect: (c: ClienteResult) => void
  onEditRequest?: (c: ClienteResult) => void
  onRegisterRequest?: (nome: string) => void
}

function ClienteSearch({ value, onSelect, onEditRequest, onRegisterRequest }: ClienteSearchProps) {
  const [search, setSearch] = useState(value)
  const [results,   setResults]   = useState<ClienteResult[]>([])
  const [loading,   setLoading]   = useState(false)
  const [open,      setOpen]      = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { setSearch(value) }, [value])

  async function buscarTodos() {
    setLoading(true)
    const { data } = await supabase
      .from('clientes')
      .select('id, nome, documento, telefone, tipo, rua, bairro, cidade, estado')
      .order('nome', { ascending: true })
      .limit(8)
    setResults((data ?? []) as ClienteResult[])
    setLoading(false)
  }

  async function buscarClientes(termo: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('id, nome, documento, telefone, tipo, rua, bairro, cidade, estado')
      .ilike('nome', `%${termo}%`)
      .order('nome', { ascending: true })
      .limit(8)
    if (error) console.error('Erro ao buscar clientes:', error)
    setResults((data ?? []) as ClienteResult[])
    setLoading(false)
  }

  useEffect(() => {
    if (!open) return
    const q = search.trim()
    const delay = q ? 300 : 0
    const timer = setTimeout(() => { if (q) buscarClientes(q); else buscarTodos() }, delay)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, open])

  function openDrop() {
    if (!wrapRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    setDropPos({ top: rect.bottom + 2, left: rect.left, width: rect.width })
    setOpen(true)
  }

  useEffect(() => {
    function handleOut(e: MouseEvent) {
      const t = e.target as Node
      if (wrapRef.current?.contains(t)) return
      if (dropRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleOut)
    return () => document.removeEventListener('mousedown', handleOut)
  }, [])

  const showEmpty = open && dropPos && !loading && results.length === 0 && !!search.trim()

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        value={search}
        onChange={e => { setSearch(e.target.value); openDrop() }}
        placeholder="Buscar cliente…"
        style={{ width: '100%', border: '1px solid #CFCCC6', borderRadius: 5, padding: '8px 10px', fontSize: 12.5, color: '#1A1A1A', outline: 'none', background: '#fff', fontFamily: 'inherit' }}
        onFocus={e => { e.currentTarget.style.borderColor = '#E31E2D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'; openDrop() }}
        onBlur={e => { e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.boxShadow = 'none' }}
      />
      {open && dropPos && (results.length > 0 || showEmpty) && createPortal(
        <div ref={dropRef} style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, background: '#fff', border: '1px solid #CFCCC6', borderRadius: 5, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 9999, maxHeight: 220, overflowY: 'auto' }}>
          {results.map(c => (
            <div
              key={c.id}
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onSelect(c); setSearch(c.nome); setOpen(false) }}
              style={{ borderBottom: '1px solid #F4F2ED', minHeight: 44, boxSizing: 'border-box', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F4F2ED'; setHoveredId(c.id) }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; setHoveredId(null) }}
            >
              <div style={{ flex: 1, minWidth: 0, padding: '8px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{c.nome}</div>
                {c.documento && (
                  <div style={{ fontSize: 10.5, color: '#8A8A8A', fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>
                    {formatDoc(c.documento)}
                  </div>
                )}
              </div>
              {onEditRequest && (
                <button
                  onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
                  onClick={e => { e.stopPropagation(); onEditRequest(c); setOpen(false) }}
                  title="Editar cliente"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '8px 10px', flexShrink: 0,
                    color: hoveredId === c.id ? '#9ca3af' : 'transparent',
                    display: 'grid', placeItems: 'center', borderRadius: 4,
                    transition: 'color 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#E31E2D')}
                  onMouseLeave={e => (e.currentTarget.style.color = hoveredId === c.id ? '#9ca3af' : 'transparent')}
                >
                  <Icon name="edit" size={14} />
                </button>
              )}
            </div>
          ))}
          {showEmpty && (
            <div
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setOpen(false); onRegisterRequest?.(search) }}
              style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#E31E2D', fontSize: 12, fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F5')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <span style={{ fontSize: 16, fontWeight: 700 }}>+</span>
              Cadastrar "{search}"
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

// ─── Item row (services / parts table) ───────────────────────────────────────

interface ItemRowProps {
  item: OSItemForm
  catalog: CatalogoItem[]
  showCodigo: boolean
  onChange: (updated: OSItemForm) => void
  onRemove: () => void
}

function ItemRow({ item, catalog, showCodigo, onChange, onRemove }: ItemRowProps) {
  const total = (parseFloat(item.qtd) || 0) * (parseFloat(item.valorUnit) || 0)

  const cellInput: React.CSSProperties = {
    width: '100%', border: '1px solid #CFCCC6', borderRadius: 5,
    padding: '5px 8px', fontSize: 12, color: '#1A1A1A', outline: 'none',
    background: '#fff', fontFamily: 'inherit',
  }

  function inputFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = '#E31E2D'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
  }
  function inputBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = '#CFCCC6'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <tr style={{ borderBottom: '1px solid #EBE8E2' }}>
      {showCodigo && (
        <td style={{ padding: '5px 6px', width: 88 }}>
          <input value={item.codigo} readOnly style={{ ...cellInput, fontFamily: "'JetBrains Mono', monospace", background: '#FAF9F7', color: '#6A6864' }} />
        </td>
      )}
      <td style={{ padding: '5px 6px' }}>
        <CatalogoSearchInput
          value={item.descricao}
          onChange={v => onChange({ ...item, descricao: v })}
          onSelect={ci => onChange({ ...item, descricao: ci.nome, codigo: ci.codigo || '' })}
          items={catalog}
          placeholder="Descrição"
        />
      </td>
      <td style={{ padding: '5px 6px', width: 64 }}>
        <input
          type="number" min="1" value={item.qtd}
          onChange={e => onChange({ ...item, qtd: e.target.value })}
          style={{ ...cellInput, textAlign: 'center' }}
          onFocus={inputFocus} onBlur={inputBlur}
        />
      </td>
      <td style={{ padding: '5px 6px', width: 110 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#8A8A8A', pointerEvents: 'none' }}>R$</span>
          <input
            value={item.valorUnit}
            onChange={e => onChange({ ...item, valorUnit: e.target.value })}
            style={{ ...cellInput, paddingLeft: 26 }}
            onFocus={inputFocus} onBlur={inputBlur}
          />
        </div>
      </td>
      <td style={{ padding: '5px 8px', width: 100, fontSize: 12, fontWeight: 600, color: '#1A1A1A', textAlign: 'right', whiteSpace: 'nowrap' }}>
        R$ {formatCurrency(total)}
      </td>
      <td style={{ padding: '5px 6px', width: 32 }}>
        <button
          type="button" onClick={onRemove}
          style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#8A8A8A' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(227,30,45,0.08)'; e.currentTarget.style.color = '#E31E2D' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8A8A8A' }}
        >
          <Icon name="trash" size={12} />
        </button>
      </td>
    </tr>
  )
}

// ─── Items table (services or parts) ─────────────────────────────────────────

interface ItemsTableProps {
  tipo: 'servico' | 'peca'
  items: OSItemForm[]
  catalog: CatalogoItem[]
  onChange: (items: OSItemForm[]) => void
}

function ItemsTable({ tipo, items, catalog, onChange }: ItemsTableProps) {
  const showCodigo = tipo === 'peca'
  const label = tipo === 'servico' ? 'serviço' : 'peça'

  function addItem() {
    onChange([...items, { id: crypto.randomUUID(), codigo: '', descricao: '', qtd: '1', valorUnit: '' }])
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '8px 6px',
    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
    color: '#8A8A8A', textTransform: 'uppercase',
    borderBottom: '2px solid #E3E0D9', background: '#F4F2ED',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ border: '1px solid #E3E0D9', borderRadius: 5, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {showCodigo && <th style={{ ...thStyle, width: 88 }}>Código</th>}
            <th style={thStyle}>Descrição</th>
            <th style={{ ...thStyle, width: 64 }}>Qtd</th>
            <th style={{ ...thStyle, width: 110 }}>Valor unit.</th>
            <th style={{ ...thStyle, width: 100, textAlign: 'right' }}>Total</th>
            <th style={{ ...thStyle, width: 32 }} />
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              catalog={catalog}
              showCodigo={showCodigo}
              onChange={updated => onChange(items.map(i => i.id === item.id ? updated : i))}
              onRemove={() => onChange(items.filter(i => i.id !== item.id))}
            />
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={showCodigo ? 6 : 5} style={{ padding: '12px 8px', textAlign: 'center', color: '#CFCCC6', fontSize: 11.5, fontStyle: 'italic' }}>
                Nenhum {label} adicionado
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={showCodigo ? 6 : 5} style={{ padding: '6px 8px', borderTop: '1px solid #EBE8E2' }}>
              <button
                type="button" onClick={addItem}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E31E2D')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8A8A8A')}
              >
                <Icon name="plus" size={12} />
                Adicionar {label}
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── Parcelas table ───────────────────────────────────────────────────────────

interface ParcelasTableProps {
  parcelas: OSParcelaForm[]
  onChange: (parcelas: OSParcelaForm[]) => void
}

function ParcelasTable({ parcelas, onChange }: ParcelasTableProps) {
  if (parcelas.length === 0) return null

  const cellInput: React.CSSProperties = {
    width: '100%', border: '1px solid #CFCCC6', borderRadius: 4,
    padding: '4px 7px', fontSize: 12, color: '#1A1A1A', outline: 'none',
    background: '#fff', fontFamily: 'inherit',
  }
  function inputFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = '#E31E2D'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
  }
  function inputBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = '#CFCCC6'
    e.currentTarget.style.boxShadow = 'none'
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '7px 8px',
    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
    color: '#8A8A8A', textTransform: 'uppercase',
    borderBottom: '1px solid #E3E0D9', background: '#F4F2ED',
  }

  return (
    <div style={{ border: '1px solid #E3E0D9', borderRadius: 5, overflow: 'hidden', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 36 }}>Nº</th>
            <th style={{ ...thStyle, width: 130 }}>Vencimento</th>
            <th style={{ ...thStyle, width: 120 }}>Valor</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {parcelas.map(p => {
            const statusColor: Record<string, string> = { pendente: '#B45309', pago: '#15803D', atrasado: '#B91C1C' }
            return (
              <tr key={p.id} style={{ borderBottom: '1px solid #EBE8E2' }}>
                <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: '#8A8A8A', fontSize: 11 }}>{p.numero}x</td>
                <td style={{ padding: '5px 6px' }}>
                  <input
                    type="date" value={p.dataVencimento}
                    onChange={e => onChange(parcelas.map(x => x.id === p.id ? { ...x, dataVencimento: e.target.value } : x))}
                    style={{ ...cellInput, fontFamily: "'JetBrains Mono', monospace" }}
                    onFocus={inputFocus} onBlur={inputBlur}
                  />
                </td>
                <td style={{ padding: '5px 6px' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#8A8A8A', pointerEvents: 'none' }}>R$</span>
                    <input
                      value={p.valor}
                      onChange={e => onChange(parcelas.map(x => x.id === p.id ? { ...x, valor: e.target.value } : x))}
                      style={{ ...cellInput, paddingLeft: 24 }}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                </td>
                <td style={{ padding: '5px 6px' }}>
                  <select
                    value={p.status}
                    onChange={e => onChange(parcelas.map(x => x.id === p.id ? { ...x, status: e.target.value as OSParcelaForm['status'] } : x))}
                    style={{ ...cellInput, color: statusColor[p.status] ?? '#1A1A1A', fontWeight: 600 }}
                    onFocus={inputFocus} onBlur={inputBlur}
                  >
                    {PARCELA_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Auxiliares multi-select (chips) ─────────────────────────────────────────

interface AuxiliaresProps {
  tecnicos: Tecnico[]
  selected: string[]
  excludeId: string
  onChange: (ids: string[]) => void
}

function AuxiliaresSelect({ tecnicos, selected, excludeId, onChange }: AuxiliaresProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const available = tecnicos.filter(t => t.id !== excludeId && !selected.includes(t.id))

  useEffect(() => {
    function handleOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOut)
    return () => document.removeEventListener('mousedown', handleOut)
  }, [])

  return (
    <div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {selected.map(id => {
            const t = tecnicos.find(x => x.id === id)
            if (!t) return null
            return (
              <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#F4F2ED', border: '1px solid #CFCCC6', borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#4A4A4A' }}>
                {t.nome.split(' ')[0]}
                <button
                  type="button"
                  onClick={() => onChange(selected.filter(s => s !== id))}
                  style={{ display: 'inline-flex', background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A8A', padding: 0, lineHeight: 1 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#E31E2D')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8A8A8A')}
                >
                  <Icon name="x" size={10} />
                </button>
              </span>
            )
          })}
        </div>
      )}
      <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
        {available.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8A8A8A', background: 'none', border: '1px dashed #CFCCC6', borderRadius: 4, cursor: 'pointer', padding: '3px 8px' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#E31E2D')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#CFCCC6')}
          >
            <Icon name="plus" size={11} /> Auxiliar
          </button>
        )}
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #CFCCC6', borderRadius: 5, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 160, marginTop: 2 }}>
            {available.map(t => (
              <div
                key={t.id}
                onMouseDown={e => { e.preventDefault(); onChange([...selected, t.id]); setOpen(false) }}
                style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', color: '#1A1A1A' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F4F2ED')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                {t.nome}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


// ─── Cadastro rápido de cliente ───────────────────────────────────────────────

interface CadastroRapidoModalProps {
  open: boolean
  nomeInicial: string
  onClose: () => void
  onSaved: (cliente: import('../types').Cliente) => void
}

function CadastroRapidoModal({ open, nomeInicial, onClose, onSaved }: CadastroRapidoModalProps) {
  const [nome,     setNome]     = useState('')
  const [telefone, setTelefone] = useState('')
  const [placa,    setPlaca]    = useState('')
  const [modelo,   setModelo]   = useState('')
  const [saving,   setSaving]   = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    if (open) {
      setNome(nomeInicial.toUpperCase())
      setTelefone(''); setPlaca(''); setModelo(''); setErro('')
    }
  }, [open, nomeInicial])

  async function handleSave() {
    if (!nome.trim())     { setErro('Nome é obrigatório'); return }
    if (!telefone.trim()) { setErro('Telefone é obrigatório'); return }
    setSaving(true)
    setErro('')
    try {
      const novo = await clientesService.create({
        tipo: 'PF',
        nome: nome.trim(),
        documento: '',
        telefone: telefone.replace(/\D/g, ''),
        veiculos: placa.trim()
          ? [{ id: '', placa: placa.replace(/[^A-Z0-9]/gi, '').toUpperCase(), modelo: modelo.trim().toUpperCase(), ano: '', km: '' }]
          : [],
      })
      onSaved(novo)
    } catch {
      setErro('Erro ao cadastrar cliente. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const inputSt: React.CSSProperties = {
    width: '100%', border: '1px solid #CFCCC6', borderRadius: 5,
    padding: '8px 10px', fontSize: 12.5, color: '#1A1A1A',
    outline: 'none', fontFamily: 'inherit', background: '#fff',
    textTransform: 'uppercase',
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 420, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Cadastro rápido</div>
        <div style={{ fontSize: 11.5, color: '#8A8A8A', marginBottom: 20 }}>
          Dados básicos. Complete o cadastro depois em Clientes.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', display: 'block', marginBottom: 4 }}>NOME <span style={{ color: '#E31E2D' }}>*</span></label>
            <input value={nome} onChange={e => setNome(e.target.value.toUpperCase())} style={inputSt}
              onFocus={e => { e.currentTarget.style.borderColor = '#E31E2D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', display: 'block', marginBottom: 4 }}>TELEFONE <span style={{ color: '#E31E2D' }}>*</span></label>
            <input value={formatPhone(telefone)} onChange={e => setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="(00) 00000-0000"
              style={{ ...inputSt, textTransform: 'none' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#E31E2D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', display: 'block', marginBottom: 4 }}>PLACA</label>
              <input value={placa} onChange={e => setPlaca(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7))}
                placeholder="AAA0000"
                style={{ ...inputSt, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#E31E2D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', display: 'block', marginBottom: 4 }}>MODELO</label>
              <input value={modelo} onChange={e => setModelo(e.target.value.toUpperCase())} placeholder="Ex: CIVIC" style={inputSt}
                onFocus={e => { e.currentTarget.style.borderColor = '#E31E2D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
          </div>
        </div>

        {erro && <div style={{ marginTop: 10, fontSize: 11.5, color: '#E31E2D' }}>{erro}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Cadastrar e selecionar'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── OS Modal ─────────────────────────────────────────────────────────────────

interface OSModalProps {
  open: boolean
  mode: 'new' | 'edit'
  form: OSFormData
  lastSaved: Date | null
  isSaving: boolean
  clientes: Cliente[]
  tecnicos: Tecnico[]
  catalogoServicos: CatalogoItem[]
  catalogoPecas: CatalogoItem[]
  historico: { id: string; numero: string; data: string; tipoServico: string }[]
  onFormChange: (patch: Partial<OSFormData>) => void
  onClose: () => void
  onSaveDraft: () => void
  onGerarOrcamento: () => void
  onIniciarOS: () => void
  readOnly?: boolean
  statusHistory?: { id: string; statusAnterior: string | null; statusNovo: string; createdAt: string }[]
  onToast?: (msg: string, variant?: 'success' | 'error') => void
}

function OSModal({
  open, mode, form, lastSaved, isSaving,
  clientes, tecnicos, catalogoServicos, catalogoPecas, historico,
  onFormChange, onClose, onSaveDraft, onGerarOrcamento, onIniciarOS,
  readOnly = false, statusHistory: _statusHistory = [], onToast,
}: OSModalProps) {
  const qc = useQueryClient()
  const [saveText, setSaveText] = useState('')
  const [editingCliente, setEditingCliente] = useState<ClienteResult | null>(null)
  const [quickReg, setQuickReg] = useState<{ open: boolean; nome: string }>({ open: false, nome: '' })
  const veiculoWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lastSaved) return
    const update = () => {
      const secs = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
      setSaveText(secs < 60 ? `auto-salvo há ${secs}s` : `auto-salvo há ${Math.floor(secs / 60)}min`)
    }
    update()
    const id = setInterval(update, 5000)
    return () => clearInterval(id)
  }, [lastSaved])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [open, onClose])

  // Auto-generate parcelas when payment fields change
  useEffect(() => {
    if (form.pagamentoTipo !== 'parcelado') return
    const total = parseFloat(form.pagamentoTotal)
    const n = parseInt(form.pagamentoNumeroParcelas)
    if (!total || !n || n < 2 || n > 12 || !form.pagamentoPrimeiraParcela) return
    onFormChange({ parcelas: generateParcelas(total, n, form.pagamentoPrimeiraParcela) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pagamentoTipo, form.pagamentoTotal, form.pagamentoNumeroParcelas, form.pagamentoPrimeiraParcela])

  // Financial summary
  const subtotalServicos = form.servicos.reduce((s, i) => s + (parseFloat(i.qtd) || 0) * (parseFloat(i.valorUnit) || 0), 0)
  const subtotalPecas    = form.pecas.reduce((s, i) => s + (parseFloat(i.qtd) || 0) * (parseFloat(i.valorUnit) || 0), 0)
  const desconto         = parseFloat(form.desconto) || 0
  const totalGeral       = subtotalServicos + subtotalPecas - desconto

  // Sync pagamentoTotal with totalGeral whenever items/discount change
  useEffect(() => {
    onFormChange({ pagamentoTotal: totalGeral > 0 ? totalGeral.toFixed(2) : '' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalGeral])

  // Client vehicles (direct query — independent of the clientes list cache)
  const { data: clienteVeiculos = [] } = useQuery({
    queryKey: ['veiculos-cliente', form.clienteId],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<{ id: string; placa: string; modelo: string; ano: string; km: string }[]> => {
      if (!form.clienteId) return []
      const { data } = await supabase
        .from('veiculos')
        .select('id, placa, modelo, ano, km')
        .eq('cliente_id', form.clienteId)
        .order('placa')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((v: any) => ({ id: v.id, placa: v.placa, modelo: v.modelo, ano: v.ano ?? '', km: v.km ?? '' }))
    },
    enabled: !!form.clienteId,
  })

  const subtitle = readOnly
    ? STATUS_LABEL[form.status]
    : mode === 'new'
      ? `${STATUS_LABEL[form.status]} · ${isSaving ? 'salvando…' : lastSaved ? saveText : 'não salvo'}`
      : `${STATUS_LABEL[form.status]} · ${isSaving ? 'salvando…' : lastSaved ? saveText : ''}`

  // Inline styles helpers
  const inputSm: React.CSSProperties = {
    width: '100%', border: '1px solid #CFCCC6', borderRadius: 5,
    padding: '8px 10px', fontSize: 12.5, color: '#1A1A1A',
    outline: 'none', background: '#fff', fontFamily: 'inherit',
  }
  function focusRed(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = '#E31E2D'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
  }
  function blurGray(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = '#CFCCC6'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.55)',
          zIndex: 50, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Modal centering wrapper */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, pointerEvents: 'none',
      }}>
        {/* Modal panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={mode === 'new' ? 'Nova Ordem de Serviço' : `Editar OS ${form.numero}`}
          style={{
            width: '100%',
            maxWidth: 980,
            maxHeight: 'calc(100vh - 40px)',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 24px 80px rgba(0,0,0,0.30)',
            overflow: 'hidden',
            pointerEvents: open ? 'auto' : 'none',
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0) scale(1)' : 'translateY(-16px) scale(0.97)',
            transition: 'opacity 0.22s cubic-bezier(0.16,1,0.3,1), transform 0.22s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* ── Modal header ── */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E3E0D9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, flexShrink: 0, background: '#fff',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
                {readOnly ? `OS ${form.numero}` : mode === 'new' ? 'Nova Ordem de Serviço' : `Editar OS ${form.numero}`}
              </div>
              <div style={{ fontSize: 11, color: '#8A8A8A', marginTop: 2 }}>{subtitle}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {!readOnly && (
                <>
                  <Button variant="secondary" size="sm" onClick={onSaveDraft} disabled={isSaving}>
                    <Icon name="save" size={12} />
                    Salvar rascunho
                  </Button>
                  <Button variant="secondary" size="sm" onClick={onGerarOrcamento}>
                    <Icon name="doc" size={12} />
                    Gerar Orçamento
                  </Button>
                  <Button variant="primary" size="sm" onClick={onIniciarOS} disabled={isSaving || form.status === 'entregue' || form.status === 'cancelada'}>
                    <Icon name="play" size={12} />
                    Iniciar OS
                  </Button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'transparent', border: '1px solid #CFCCC6', borderRadius: 5, cursor: 'pointer', color: '#8A8A8A', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.color = '#1A1A1A' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.color = '#8A8A8A' }}
              >
                <Icon name="x" size={13} />
              </button>
            </div>
          </div>

          {/* ── Modal body ── */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

            {/* Form column */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ── Identificação ── */}
              <section>
                <SectionHeader title="Identificação" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Row 1: Nº OS / Data / Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12 }}>
                    <Field label="Nº OS">
                      <Input
                        value={form.numero || 'Auto'}
                        readOnly
                        mono
                        style={{ background: '#FAF9F7', color: '#6A6864' }}
                      />
                    </Field>
                    <Field label="Data">
                      <Input
                        type="date"
                        value={form.data}
                        onChange={e => onFormChange({ data: e.target.value })}
                      />
                    </Field>
                    <Field label="Status">
                      <Select
                        value={form.status}
                        onChange={e => onFormChange({ status: e.target.value as OrdemServicoStatus })}
                      >
                        {(Object.keys(STATUS_LABEL) as OrdemServicoStatus[]).map(s => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  {/* Row 2: Cliente */}
                  <Field label="Cliente">
                    <ClienteSearch
                      value={form.clienteNome}
                      onSelect={c => {
                        const endereco = [c.rua, c.bairro, c.cidade, c.estado].filter(Boolean).join(', ')
                        onFormChange({
                          clienteId:        c.id,
                          clienteNome:      c.nome,
                          clienteDocumento: c.documento,
                          clienteEndereco:  endereco,
                          veiculoId: '',
                        })
                        setTimeout(() => veiculoWrapRef.current?.querySelector('select')?.focus(), 100)
                      }}
                      onEditRequest={c => setEditingCliente(c)}
                      onRegisterRequest={nome => setQuickReg({ open: true, nome })}
                    />
                  </Field>

                  {/* Row 3: Veículo / Km / Tipo serviço / Prazo */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr 130px', gap: 12 }}>
                    <Field label="Veículo / Placa">
                      <div ref={veiculoWrapRef}>
                        <Select
                          value={form.veiculoId}
                          onChange={e => onFormChange({ veiculoId: e.target.value })}
                          placeholder="Selecionar veículo"
                          disabled={!form.clienteId}
                        >
                          {clienteVeiculos.map(v => (
                            <option key={v.id} value={v.id}>
                              {displayPlate(v.placa)} · {v.modelo}{v.ano ? ` · ${v.ano}` : ''}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </Field>
                    <Field label="Km atual">
                      <div style={{ position: 'relative' }}>
                        <Input
                          value={form.kmAtual}
                          onChange={e => onFormChange({ kmAtual: e.target.value.replace(/\D/g, '') })}
                          placeholder="0"
                          mono
                          style={{ paddingRight: 28 }}
                        />
                        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10.5, color: '#8A8A8A', pointerEvents: 'none' }}>km</span>
                      </div>
                    </Field>
                    <Field label="Tipo de serviço">
                      <Select
                        value={form.tipoServico}
                        onChange={e => onFormChange({ tipoServico: e.target.value })}
                        placeholder="Selecionar…"
                      >
                        {TIPO_SERVICO_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Prazo estimado">
                      <Input
                        type="date"
                        value={form.prazoEstimado}
                        onChange={e => onFormChange({ prazoEstimado: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* ── Dados do cliente (readonly) ── */}
              {(form.clienteDocumento || form.clienteEndereco) && (
                <section>
                  <SectionHeader title="Dados do cliente" />
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', marginBottom: 5 }}>CPF / CNPJ</div>
                      <div style={{ fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", color: '#4A4A4A', background: '#FAF9F7', border: '1px solid #E3E0D9', borderRadius: 5, padding: '8px 10px' }}>
                        {form.clienteDocumento ? formatDoc(form.clienteDocumento) : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', marginBottom: 5 }}>Endereço</div>
                      <div style={{ fontSize: 12.5, color: '#4A4A4A', background: '#FAF9F7', border: '1px solid #E3E0D9', borderRadius: 5, padding: '8px 10px' }}>
                        {form.clienteEndereco || '—'}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ── Problema relatado ── */}
              <section>
                <SectionHeader title="Problema relatado" />
                <Textarea
                  value={form.problemaRelatado}
                  onChange={e => onFormChange({ problemaRelatado: e.target.value })}
                  placeholder="Descreva o problema relatado pelo cliente…"
                  style={{ minHeight: 80 }}
                />
              </section>

              {/* ── Serviços ── */}
              <section>
                <SectionHeader title="Serviços" />
                <ItemsTable
                  tipo="servico"
                  items={form.servicos}
                  catalog={catalogoServicos}
                  onChange={servicos => onFormChange({ servicos })}
                />
              </section>

              {/* ── Peças ── */}
              <section>
                <SectionHeader title="Peças utilizadas" />
                <ItemsTable
                  tipo="peca"
                  items={form.pecas}
                  catalog={catalogoPecas}
                  onChange={pecas => onFormChange({ pecas })}
                />
              </section>

              {/* ── Observações ── */}
              <section>
                <SectionHeader title="Observações" />
                <Textarea
                  value={form.observacoes}
                  onChange={e => onFormChange({ observacoes: e.target.value })}
                  placeholder="Observações internas…"
                  style={{ minHeight: 72 }}
                />
              </section>

              {/* ── Pagamento ── */}
              <section>
                <SectionHeader title="Pagamento" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Toggle */}
                  <div style={{ display: 'inline-flex', border: '1px solid #CFCCC6', borderRadius: 6, overflow: 'hidden' }}>
                    {(['unico', 'parcelado'] as const).map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => onFormChange({ pagamentoTipo: t })}
                        style={{ padding: '7px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: form.pagamentoTipo === t ? '#111111' : '#fff', color: form.pagamentoTipo === t ? '#fff' : '#4A4A4A', transition: 'background 0.15s, color 0.15s' }}
                      >
                        {t === 'unico' ? 'Pagamento único' : 'Parcelado'}
                      </button>
                    ))}
                  </div>

                  {form.pagamentoTipo === 'unico' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 130px', gap: 12 }}>
                      <Field label="Forma de pagamento">
                        <Select value={form.pagamentoForma} onChange={e => onFormChange({ pagamentoForma: e.target.value })} placeholder="Selecionar…">
                          {FORMA_PAGAMENTO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </Select>
                      </Field>
                      <Field label="Vencimento">
                        <Input type="date" value={form.pagamentoDataVencimento} onChange={e => onFormChange({ pagamentoDataVencimento: e.target.value })} />
                      </Field>
                      <Field label="Valor total">
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#8A8A8A', pointerEvents: 'none' }}>R$</span>
                          <Input value={form.pagamentoTotal} onChange={e => onFormChange({ pagamentoTotal: e.target.value })} style={{ paddingLeft: 28 }} placeholder="0,00" />
                        </div>
                      </Field>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 100px 150px', gap: 12 }}>
                        <Field label="Forma de pagamento">
                          <Select value={form.pagamentoForma} onChange={e => onFormChange({ pagamentoForma: e.target.value })} placeholder="Selecionar…">
                            {FORMA_PAGAMENTO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </Select>
                        </Field>
                        <Field label="Valor total">
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#8A8A8A', pointerEvents: 'none' }}>R$</span>
                            <Input value={form.pagamentoTotal} onChange={e => onFormChange({ pagamentoTotal: e.target.value })} style={{ paddingLeft: 28 }} placeholder="0,00" />
                          </div>
                        </Field>
                        <Field label="Parcelas">
                          <Select
                            value={form.pagamentoNumeroParcelas}
                            onChange={e => onFormChange({ pagamentoNumeroParcelas: e.target.value })}
                            placeholder="Nº"
                          >
                            {[2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x</option>)}
                          </Select>
                        </Field>
                        <Field label="1ª parcela">
                          <Input type="date" value={form.pagamentoPrimeiraParcela} onChange={e => onFormChange({ pagamentoPrimeiraParcela: e.target.value })} />
                        </Field>
                      </div>
                      <ParcelasTable
                        parcelas={form.parcelas}
                        onChange={parcelas => onFormChange({ parcelas })}
                      />
                      <button
                        type="button"
                        onClick={() => onFormChange({ pagamentoTipo: 'unico', parcelas: [], pagamentoTotal: '', pagamentoNumeroParcelas: '', pagamentoPrimeiraParcela: '' })}
                        style={{ fontSize: 11.5, color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', fontFamily: 'inherit', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        Cancelar parcelamento
                      </button>
                    </>
                  )}
                </div>
              </section>

            </div>

            {/* ── Side panel ── */}
            <div style={{
              width: 240,
              flexShrink: 0,
              borderLeft: '1px solid #E3E0D9',
              background: '#FAF9F7',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}>
              {/* Resumo financeiro */}
              <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid #E3E0D9' }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: '#6A6864', textTransform: 'uppercase', marginBottom: 10 }}>
                  Resumo financeiro
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4A4A4A' }}>
                    <span>Serviços</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>R$ {formatCurrency(subtotalServicos)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4A4A4A' }}>
                    <span>Peças</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>R$ {formatCurrency(subtotalPecas)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#4A4A4A' }}>
                    <span>Desconto</span>
                    <div style={{ position: 'relative', width: 90 }}>
                      <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 10.5, color: '#8A8A8A', pointerEvents: 'none' }}>R$</span>
                      <input
                        value={form.desconto}
                        onChange={e => onFormChange({ desconto: e.target.value })}
                        placeholder="0,00"
                        style={{ width: '100%', border: '1px solid #CFCCC6', borderRadius: 4, padding: '4px 6px 4px 22px', fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", outline: 'none', background: '#fff' }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#E31E2D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ height: 1, background: '#E3E0D9', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
                    <span style={{ color: '#1A1A1A' }}>Total</span>
                    <span style={{ color: '#E31E2D', fontFamily: "'JetBrains Mono', monospace" }}>R$ {formatCurrency(totalGeral)}</span>
                  </div>
                </div>
              </div>

              {/* Equipe */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #E3E0D9' }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: '#6A6864', textTransform: 'uppercase', marginBottom: 10 }}>
                  Equipe
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', marginBottom: 5 }}>Técnico responsável</div>
                    <select
                      value={form.tecnicoId}
                      onChange={e => onFormChange({ tecnicoId: e.target.value })}
                      style={{ ...inputSm, fontSize: 12 }}
                      onFocus={focusRed} onBlur={blurGray}
                    >
                      <option value="">Selecionar…</option>
                      {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', marginBottom: 5 }}>Auxiliares</div>
                    <AuxiliaresSelect
                      tecnicos={tecnicos}
                      selected={form.auxiliares}
                      excludeId={form.tecnicoId}
                      onChange={auxiliares => onFormChange({ auxiliares })}
                    />
                  </div>
                </div>
              </div>

              {/* Garantia */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #E3E0D9' }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: '#6A6864', textTransform: 'uppercase', marginBottom: 10 }}>
                  Garantia
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number" min="0"
                    value={form.garantiaDias}
                    onChange={e => onFormChange({ garantiaDias: e.target.value })}
                    style={{ ...inputSm, fontSize: 12, width: 80, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}
                    onFocus={focusRed} onBlur={blurGray}
                  />
                  <span style={{ fontSize: 12, color: '#4A4A4A' }}>dias</span>
                </div>
              </div>

              {/* Histórico do veículo */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: '#6A6864', textTransform: 'uppercase', marginBottom: 10 }}>
                  Histórico do veículo
                </div>
                {!form.veiculoId ? (
                  <p style={{ fontSize: 11.5, color: '#CFCCC6', fontStyle: 'italic' }}>Selecione um veículo</p>
                ) : historico.length === 0 ? (
                  <p style={{ fontSize: 11.5, color: '#CFCCC6', fontStyle: 'italic' }}>Sem histórico</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {historico.map(h => (
                      <div key={h.id} style={{ padding: '6px 8px', background: '#fff', border: '1px solid #E3E0D9', borderRadius: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#4A4A4A' }}>{h.numero}</span>
                          <span style={{ fontSize: 10.5, color: '#8A8A8A' }}>{formatDate(h.data)}</span>
                        </div>
                        {h.tipoServico && (
                          <div style={{ fontSize: 10.5, color: '#8A8A8A', marginTop: 2 }}>
                            {TIPO_SERVICO_OPTIONS.find(o => o.value === h.tipoServico)?.label ?? h.tipoServico}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1);       }
          to   { opacity: 0; transform: translateY(6px) scale(0.96);  }
        }
      `}</style>

      {editingCliente && (
        <ClienteEditModal
          clienteId={editingCliente.id}
          onClose={() => setEditingCliente(null)}
          onSaved={updated => {
            setEditingCliente(null)
            qc.invalidateQueries({ queryKey: ['clientes'] })
            qc.invalidateQueries({ queryKey: ['veiculos-cliente', updated.id] })
            if (form.clienteId === updated.id) {
              const endereco = [updated.rua, updated.bairro, updated.cidade, updated.estado].filter(Boolean).join(', ')
              onFormChange({ clienteNome: updated.nome, clienteDocumento: updated.documento, clienteEndereco: endereco })
            }
            onToast?.('Cliente atualizado')
          }}
        />
      )}

      <CadastroRapidoModal
        open={quickReg.open}
        nomeInicial={quickReg.nome}
        onClose={() => setQuickReg({ open: false, nome: '' })}
        onSaved={novo => {
          setQuickReg({ open: false, nome: '' })
          qc.invalidateQueries({ queryKey: ['clientes'] })
          const endereco = [novo.rua, novo.bairro, novo.cidade, novo.estado].filter(Boolean).join(', ')
          const primeiroVeiculo = novo.veiculos[0]
          onFormChange({
            clienteId:        novo.id,
            clienteNome:      novo.nome,
            clienteDocumento: novo.documento,
            clienteEndereco:  endereco,
            veiculoId:        primeiroVeiculo?.id || '',
          })
          qc.invalidateQueries({ queryKey: ['veiculos-cliente', novo.id] })
          onToast?.('Cliente cadastrado!')
        }}
      />

    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function OrdensServicoPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'new' | 'edit'>('new')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<OSFormData>(EMPTY_FORM)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [rowMenu, setRowMenu] = useState<string | null>(null)
  const [rowMenuPos, setRowMenuPos] = useState<{ top: number; right: number } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OrdemServicoRow | null>(null)
  const [liberarTarget, setLiberarTarget] = useState<OrdemServicoRow | null>(null)
  const [cancelarTarget, setCancelarTarget] = useState<OrdemServicoRow | null>(null)
  const [cancelarMotivo, setCancelarMotivo] = useState('')
  const [cancelarMotivoErro, setCancelarMotivoErro] = useState(false)
  const [reabrirTarget, setReabrirTarget] = useState<OrdemServicoRow | null>(null)
  const [isReabrindo, setIsReabrindo] = useState(false)
  const [activeTab, setActiveTab] = useState<'ativas' | 'canceladas' | 'liberados'>('ativas')
  const hoje = new Date()
  const [cancelAno, setCancelarAno] = useState(hoje.getFullYear())
  const [cancelMes, setCancelarMes] = useState(hoje.getMonth() + 1)
  const [liberadoAno, setLiberadoAno] = useState(hoje.getFullYear())
  const [liberadoMes, setLiberadoMes] = useState(hoje.getMonth() + 1)

  const formRef = useRef(form)
  useEffect(() => { formRef.current = form })

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data: rows = [], isLoading, isError, error: listError } = useQuery({
    queryKey: ['ordens-servico'],
    queryFn: ordensServicoService.list,
  })

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.list,
  })

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos'],
    queryFn: ordensServicoService.listTecnicos,
  })

  const { data: catalogo = [] } = useQuery({
    queryKey: ['catalogo'],
    queryFn: catalogoService.list,
  })
  const catalogoServicos = useMemo(() => catalogo.filter(i => i.tipo === 'servico' && i.ativo), [catalogo])
  const catalogoPecas    = useMemo(() => catalogo.filter(i => i.tipo === 'peca'    && i.ativo), [catalogo])

  const { data: historico = [] } = useQuery({
    queryKey: ['os-historico', form.veiculoId, editingId],
    queryFn: () => ordensServicoService.historicoVeiculo(form.veiculoId, editingId ?? undefined),
    enabled: !!form.veiculoId && modalOpen,
  })

  const { data: canceladas = [], isLoading: loadingCanceladas } = useQuery({
    queryKey: ['os-canceladas', cancelAno, cancelMes],
    queryFn: () => ordensServicoService.listCanceladas(cancelAno, cancelMes),
    enabled: activeTab === 'canceladas',
  })

  const { data: liberados = [], isLoading: loadingLiberados } = useQuery({
    queryKey: ['os-liberados', liberadoAno, liberadoMes],
    queryFn: () => ordensServicoService.listLiberados(liberadoAno, liberadoMes),
    enabled: activeTab === 'liberados',
  })

  // ─── Toast ───────────────────────────────────────────────────────────────

  function showToast(message: string, variant: 'success' | 'error' = 'success') {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant, exiting: false }])
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t)), 3600)
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  const upsertMutation = useMutation({
    mutationFn: ordensServicoService.upsert,
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['ordens-servico'] })
      setLastSaved(new Date())
      if (!editingId) {
        setEditingId(saved.id)
        setModalMode('edit')
        setForm(prev => ({ ...prev, numero: saved.numero }))
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ordensServicoService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordens-servico'] })
      qc.invalidateQueries({ queryKey: ['kanban'] })
      setDeleteTarget(null)
      showToast('OS excluída com sucesso')
    },
    onError: (err) => {
      setDeleteTarget(null)
      const msg = (err as { message?: string })?.message ?? 'Erro desconhecido'
      showToast(`Erro ao excluir OS: ${msg}`, 'error')
    },
  })

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-row-actions]')) { setRowMenu(null); setRowMenuPos(null) }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function handleDeleteClick(r: OrdemServicoRow) {
    setRowMenu(null)
    if (r.status === 'entregue') {
      showToast('OS entregue não pode ser excluída', 'error')
      return
    }
    setDeleteTarget(r)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id)
  }

  async function handleCancelarConfirm() {
    if (!cancelarTarget) return
    if (!cancelarMotivo.trim()) { setCancelarMotivoErro(true); return }
    try {
      await ordensServicoService.updateStatus(cancelarTarget.id, 'cancelada')
      try { await ordensServicoService.inserirHistorico(cancelarTarget.id, cancelarTarget.status, 'cancelada', cancelarMotivo.trim()) } catch { /* silent */ }
      try {
        const { data: pagamentos } = await supabase.from('os_pagamentos').select('id').eq('os_id', cancelarTarget.id)
        if (pagamentos?.length) {
          await supabase.from('os_parcelas')
            .update({ status: 'cancelada' })
            .in('pagamento_id', pagamentos.map((p: { id: string }) => p.id))
            .neq('status', 'pago')
        }
      } catch { /* silent */ }
      qc.invalidateQueries({ queryKey: ['ordens-servico'] })
      qc.invalidateQueries({ queryKey: ['os-canceladas'] })
      qc.invalidateQueries({ queryKey: ['kanban'] })
      qc.invalidateQueries({ queryKey: ['contas-receber'] })
      qc.invalidateQueries({ queryKey: ['resumo-receber'] })
      setCancelarTarget(null)
      setCancelarMotivo('')
      setCancelarMotivoErro(false)
      showToast(`OS ${cancelarTarget.numero} cancelada`)
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Erro desconhecido'
      showToast(`Erro ao cancelar OS: ${msg}`, 'error')
    }
  }

  async function handleReabrir() {
    if (!reabrirTarget) return
    setIsReabrindo(true)
    try {
      await ordensServicoService.updateStatus(reabrirTarget.id, 'em_execucao')
      try { await ordensServicoService.inserirHistorico(reabrirTarget.id, reabrirTarget.status, 'em_execucao', 'OS REABERTA') } catch { /* silent */ }
      if (reabrirTarget.status === 'cancelada') {
        try {
          const { data: pagamentos } = await supabase.from('os_pagamentos').select('id').eq('os_id', reabrirTarget.id)
          if (pagamentos?.length) {
            await supabase.from('os_parcelas')
              .update({ status: 'pendente' })
              .in('pagamento_id', pagamentos.map((p: { id: string }) => p.id))
              .eq('status', 'cancelada')
          }
        } catch { /* silent */ }
      }
      qc.invalidateQueries({ queryKey: ['ordens-servico'] })
      qc.invalidateQueries({ queryKey: ['os-canceladas'] })
      qc.invalidateQueries({ queryKey: ['os-liberados'] })
      qc.invalidateQueries({ queryKey: ['kanban'] })
      qc.invalidateQueries({ queryKey: ['contas-receber'] })
      qc.invalidateQueries({ queryKey: ['resumo-receber'] })
      setReabrirTarget(null)
      showToast(`OS ${reabrirTarget.numero} reaberta — Em execução`)
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Erro desconhecido'
      showToast(`Erro ao reabrir OS: ${msg}`, 'error')
    } finally {
      setIsReabrindo(false)
    }
  }

  const liberarMutation = useMutation({
    mutationFn: async (row: OrdemServicoRow) => {
      const { error } = await import('../lib/supabase').then(m =>
        m.supabase.from('ordens_servico').update({
          status: 'veiculo_liberado',
          data_liberacao: new Date().toISOString(),
        }).eq('id', row.id)
      )
      if (error) throw error
      try {
        await ordensServicoService.inserirHistorico(row.id, 'pronta', 'veiculo_liberado')
      } catch { /* silent */ }
    },
    onSuccess: (_data, row) => {
      qc.invalidateQueries({ queryKey: ['ordens-servico'] })
      qc.invalidateQueries({ queryKey: ['kanban'] })
      qc.invalidateQueries({ queryKey: ['os-liberados'] })
      setLiberarTarget(null)
      showToast(`Veículo liberado — OS #${row.numero}`)
    },
    onError: () => {
      setLiberarTarget(null)
      showToast('Erro ao liberar veículo', 'error')
    },
  })


  // ─── Auto-save every 30s ──────────────────────────────────────────────────

  const autoSaveCallback = useCallback(async () => {
    if (!editingId) return
    try {
      await ordensServicoService.upsert(formToPayload(formRef.current, editingId))
      setLastSaved(new Date())
    } catch { /* silent */ }
  }, [editingId])

  useEffect(() => {
    if (!modalOpen || !editingId) return
    const id = setInterval(autoSaveCallback, 30_000)
    return () => clearInterval(id)
  }, [modalOpen, editingId, autoSaveCallback])

  // ─── Filter ───────────────────────────────────────────────────────────────

  const filtered = rows.filter(r => {
    if (r.status === 'cancelada' || r.status === 'veiculo_liberado' || r.status === 'entregue') return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.numero.toLowerCase().includes(q) ||
      r.clienteNome.toLowerCase().includes(q) ||
      r.veiculoPlaca.toLowerCase().includes(q) ||
      r.veiculoModelo.toLowerCase().includes(q) ||
      STATUS_LABEL[r.status].toLowerCase().includes(q)
    )
  })

  // ─── Modal helpers ────────────────────────────────────────────────────────

  function openNew() {
    setForm({ ...EMPTY_FORM, data: today() })
    setEditingId(null)
    setLastSaved(null)
    setModalMode('new')
    setModalOpen(true)
  }

  async function openEdit(row: OrdemServicoRow) {
    setModalMode('edit')
    setEditingId(row.id)
    setLastSaved(null)
    setModalOpen(true)
    try {
      const os = await ordensServicoService.get(row.id)
      setForm(osToForm(os))
    } catch {
      setForm({ ...EMPTY_FORM, numero: row.numero, status: row.status })
    }
  }

  function patchForm(patch: Partial<OSFormData>) {
    setForm(prev => ({ ...prev, ...patch }))
  }

  // ─── Salvar rascunho (→ aguardando_aprovacao) ─────────────────────────────

  async function handleSaveDraft() {
    const payload = formToPayload(form, editingId ?? undefined)
    try {
      const prevStatus = editingId ? form.status : null
      const saved = await upsertMutation.mutateAsync(payload)
      try { await ordensServicoService.inserirHistorico(saved.id, prevStatus, saved.status) } catch { /* silent */ }
      patchForm({ numero: saved.numero })
      setModalOpen(false)
      showToast('OS salva com sucesso')
    } catch (err) {
      console.error('handleSaveDraft:', err)
      const msg = (err as { message?: string })?.message ?? 'Erro desconhecido'
      showToast(`Erro ao salvar OS: ${msg}`, 'error')
    }
  }

  // ─── Gerar orçamento PDF ──────────────────────────────────────────────────

  async function handleGerarOrcamento() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const M = 20
    const PW = 210
    const CW = PW - 2 * M

    const cliente = clientes.find(c => c.id === form.clienteId)
    const veiculo = cliente?.veiculos.find(v => v.id === form.veiculoId)

    const subtotalServicos = form.servicos.reduce((s, i) => s + (parseFloat(i.qtd) || 0) * (parseFloat(i.valorUnit) || 0), 0)
    const subtotalPecas    = form.pecas.reduce((s, i) => s + (parseFloat(i.qtd) || 0) * (parseFloat(i.valorUnit) || 0), 0)
    const desconto         = parseFloat(form.desconto) || 0
    const totalGeral       = subtotalServicos + subtotalPecas - desconto

    // ── Header ──
    doc.setTextColor(220, 38, 38)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('UNICAR', M, 25)

    doc.setTextColor(106, 104, 100)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Emitido em: ${formatDate(new Date().toISOString().slice(0, 10))}`, PW - M, 25, { align: 'right' })

    doc.setDrawColor(207, 204, 198)
    doc.line(M, 29, PW - M, 29)

    doc.setTextColor(26, 26, 26)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`ORÇAMENTO Nº ${form.numero || 'RASCUNHO'}`, M, 37)

    let y = 50

    // ── Cliente ──
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(106, 104, 100)
    doc.text('CLIENTE', M, y); y += 5

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(26, 26, 26)
    doc.setFontSize(10)
    doc.text(`Nome: ${form.clienteNome || '—'}`, M, y)
    doc.text(`CPF/CNPJ: ${form.clienteDocumento ? formatDoc(form.clienteDocumento) : '—'}`, M + CW / 2, y); y += 5
    doc.text(`Endereço: ${form.clienteEndereco || '—'}`, M, y)
    if (cliente?.telefone) doc.text(`Telefone: ${formatPhone(cliente.telefone)}`, M + CW / 2, y)
    y += 12

    // ── Veículo ──
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(106, 104, 100)
    doc.text('VEÍCULO', M, y); y += 5

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(26, 26, 26)
    doc.setFontSize(10)
    const veicParts = [
      veiculo ? `Placa: ${displayPlate(veiculo.placa)}` : null,
      veiculo?.modelo ? `Modelo: ${veiculo.modelo}` : null,
      veiculo?.ano ? `Ano: ${veiculo.ano}` : null,
      form.kmAtual ? `Km: ${Number(form.kmAtual).toLocaleString('pt-BR')} km` : null,
    ].filter(Boolean).join('    ')
    doc.text(veicParts || '—', M, y); y += 12

    // ── Serviços ──
    const servicosFilled = form.servicos.filter(s => s.descricao)
    if (servicosFilled.length > 0) {
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(106, 104, 100)
      doc.text('SERVIÇOS', M, y); y += 3

      autoTable(doc, {
        startY: y,
        margin: { left: M, right: M },
        head: [['Descrição', 'Qtd', 'Valor unit.', 'Total']],
        body: servicosFilled.map(s => {
          const tot = (parseFloat(s.qtd) || 0) * (parseFloat(s.valorUnit) || 0)
          return [s.descricao, s.qtd, `R$ ${formatCurrency(parseFloat(s.valorUnit) || 0)}`, `R$ ${formatCurrency(tot)}`]
        }),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [244, 242, 237], textColor: [26, 26, 26], fontStyle: 'bold' },
        columnStyles: { 1: { cellWidth: 18, halign: 'center' }, 2: { cellWidth: 32, halign: 'right' }, 3: { cellWidth: 32, halign: 'right' } },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 8
    }

    // ── Peças ──
    const pecasFilled = form.pecas.filter(p => p.descricao)
    if (pecasFilled.length > 0) {
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(106, 104, 100)
      doc.text('PEÇAS UTILIZADAS', M, y); y += 3

      autoTable(doc, {
        startY: y,
        margin: { left: M, right: M },
        head: [['Código', 'Descrição', 'Qtd', 'Valor unit.', 'Total']],
        body: pecasFilled.map(p => {
          const tot = (parseFloat(p.qtd) || 0) * (parseFloat(p.valorUnit) || 0)
          return [p.codigo || '—', p.descricao, p.qtd, `R$ ${formatCurrency(parseFloat(p.valorUnit) || 0)}`, `R$ ${formatCurrency(tot)}`]
        }),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [244, 242, 237], textColor: [26, 26, 26], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 24 }, 2: { cellWidth: 18, halign: 'center' }, 3: { cellWidth: 32, halign: 'right' }, 4: { cellWidth: 32, halign: 'right' } },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 8
    }

    // ── Resumo financeiro ──
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(74, 74, 74)
    const summaryRows: [string, string][] = [
      ['Subtotal serviços:', `R$ ${formatCurrency(subtotalServicos)}`],
      ['Subtotal peças:', `R$ ${formatCurrency(subtotalPecas)}`],
    ]
    if (desconto > 0) summaryRows.push(['Desconto:', `– R$ ${formatCurrency(desconto)}`])
    for (const [label, value] of summaryRows) {
      doc.text(label, PW - M - 72, y)
      doc.text(value, PW - M, y, { align: 'right' })
      y += 5
    }
    doc.setDrawColor(207, 204, 198)
    doc.line(PW - M - 72, y - 1, PW - M, y - 1); y += 3
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(220, 38, 38)
    doc.text('TOTAL GERAL:', PW - M - 72, y)
    doc.text(`R$ ${formatCurrency(totalGeral)}`, PW - M, y, { align: 'right' })
    y += 12

    // ── Pagamento ──
    if (form.pagamentoForma) {
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(106, 104, 100)
      doc.text('CONDIÇÕES DE PAGAMENTO', M, y); y += 5
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(26, 26, 26)
      doc.setFontSize(10)
      const formaLabel = FORMA_PAGAMENTO_OPTIONS.find(o => o.value === form.pagamentoForma)?.label ?? form.pagamentoForma
      const pagParts = [`Forma: ${formaLabel}`]
      if (form.pagamentoTipo === 'parcelado' && form.pagamentoNumeroParcelas) pagParts.push(`Parcelas: ${form.pagamentoNumeroParcelas}x`)
      if (form.pagamentoDataVencimento) pagParts.push(`Vencimento: ${formatDate(form.pagamentoDataVencimento)}`)
      doc.text(pagParts.join('    '), M, y); y += 10
    }

    // ── Observações ──
    if (form.observacoes.trim()) {
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(106, 104, 100)
      doc.text('OBSERVAÇÕES', M, y); y += 5
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(74, 74, 74)
      doc.setFontSize(9)
      const lines = doc.splitTextToSize(form.observacoes, CW)
      doc.text(lines, M, y); y += lines.length * 4.5 + 6
    }

    // ── Garantia ──
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(106, 104, 100)
    doc.text(`Garantia: ${parseInt(form.garantiaDias) || 90} dias após a entrega.`, M, y); y += 12

    // ── Assinatura ──
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(26, 26, 26)
    doc.setDrawColor(74, 74, 74)
    doc.line(M, y, M + 65, y); y += 4
    doc.setFontSize(9)
    doc.text('Assinatura do responsável', M, y); y += 12

    // ── Validade ──
    doc.setFontSize(8)
    doc.setTextColor(138, 138, 138)
    doc.setFont('helvetica', 'italic')
    doc.text('Este orçamento tem validade de 7 dias.', M, y)

    // Abrir em nova aba
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(url), 15000)

    // Muda status para aguardando_aprovacao
    const payload = { ...formToPayload(form, editingId ?? undefined), status: 'aguardando_aprovacao' as const }
    try {
      const prevStatus = editingId ? form.status : null
      const saved = await upsertMutation.mutateAsync(payload)
      try { await ordensServicoService.inserirHistorico(saved.id, prevStatus, 'aguardando_aprovacao') } catch { /* silent */ }
      qc.invalidateQueries({ queryKey: ['kanban'] })
      showToast(`Orçamento gerado — OS ${saved.numero || ''} aguardando aprovação`)
    } catch { /* silent — PDF já foi aberto */ }
  }

  // ─── Iniciar OS ───────────────────────────────────────────────────────────

  async function handleIniciarOS() {
    const payload = { ...formToPayload(form, editingId ?? undefined), status: 'aberta' as const }
    try {
      const prevStatus = editingId ? form.status : null
      const saved = await upsertMutation.mutateAsync(payload)
      try { await ordensServicoService.inserirHistorico(saved.id, prevStatus, saved.status) } catch { /* silent */ }
      qc.invalidateQueries({ queryKey: ['kanban'] })
      setModalOpen(false)
      showToast(`OS ${saved.numero || ''} iniciada com sucesso`)
      navigate('/')
    } catch (err) {
      console.error('handleIniciarOS:', err)
      const msg = (err as { message?: string })?.message ?? 'Erro desconhecido'
      showToast(`Erro ao iniciar OS: ${msg}`, 'error')
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Topbar
        section="Operação"
        title="Ordens de Serviço"
        searchPlaceholder="Buscar OS, cliente, placa…"
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="secondary" size="md">
              <Icon name="filter" size={13} />
              Filtros
            </Button>
            <Button variant="primary" size="md" onClick={openNew}>
              <Icon name="plus" size={13} />
              Nova OS
            </Button>
          </div>
        }
      />

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #E3E0D9', paddingBottom: 0 }}>
          {([
            { key: 'ativas',    label: 'Ativas' },
            { key: 'liberados', label: 'Finalizadas' },
            { key: 'canceladas',label: 'Canceladas' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '7px 16px', fontSize: 12.5, fontWeight: 600, border: 'none',
                background: 'none', cursor: 'pointer', borderRadius: '5px 5px 0 0',
                color: activeTab === key ? '#E31E2D' : '#8A8A8A',
                borderBottom: activeTab === key ? '2px solid #E31E2D' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Summary bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#8A8A8A' }}>
            {isLoading ? (
              <span>Carregando…</span>
            ) : isError ? (
              <span style={{ color: '#E31E2D' }}>Erro ao carregar ordens de serviço: {(listError as { message?: string })?.message ?? 'desconhecido'}</span>
            ) : (
              <>
                <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{filtered.length}</span>
                {' '}ordem{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
              </>
            )}
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ marginLeft: 8, fontSize: 11, color: '#E31E2D', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Limpar filtro ✕
              </button>
            )}
          </div>
        </div>

        {/* Table — só visível na aba Ativas */}
        <div style={{ display: activeTab === 'ativas' ? undefined : 'none', background: '#fff', border: '1px solid #E3E0D9', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {[
                  { label: 'Nº OS',            style: { width: 96 } },
                  { label: 'Cliente / Veículo', style: {} },
                  { label: 'Km',                style: { width: 90 } },
                  { label: 'Status',             style: { width: 140 } },
                  { label: 'Técnico',            style: { width: 80 } },
                  { label: 'Valor',              style: { width: 110 } },
                  { label: '',                   style: { width: 36 } },
                ].map((col, i) => (
                  <th key={i} style={{
                    textAlign: 'left', padding: '10px 14px',
                    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
                    color: '#8A8A8A', textTransform: 'uppercase',
                    borderBottom: '1px solid #E3E0D9', background: '#F4F2ED',
                    ...col.style,
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', color: '#8A8A8A', fontSize: 13 }}>
                    Carregando ordens de serviço…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', color: '#CFCCC6', fontSize: 13 }}>
                    Nenhuma ordem de serviço encontrada
                  </td>
                </tr>
              )}
              {filtered.map(r => (
                <tr
                  key={r.id}
                  onClick={() => openEdit(r)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F4F2ED')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  {/* Nº OS */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 11.5, color: '#1A1A1A', letterSpacing: '0.04em' }}>
                      {r.numero || '—'}
                    </span>
                  </td>

                  {/* Cliente / Veículo */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                    <div style={{ fontWeight: 600, color: '#1A1A1A' }}>{r.clienteNome || '—'}</div>
                    {r.veiculoPlaca && (
                      <div style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: '#8A8A8A', marginTop: 2, letterSpacing: '0.04em' }}>
                        {displayPlate(r.veiculoPlaca)}
                        {r.veiculoModelo ? ` · ${r.veiculoModelo}` : ''}
                      </div>
                    )}
                  </td>

                  {/* Km */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', color: '#4A4A4A' }}>
                    {r.kmAtual ? (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {Number(r.kmAtual).toLocaleString('pt-BR')} km
                      </span>
                    ) : (
                      <span style={{ color: '#CFCCC6' }}>—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                    <StatusBadge status={r.status} />
                  </td>

                  {/* Técnico */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                    {r.tecnicoNome ? (
                      <Avatar name={r.tecnicoNome} size={28} />
                    ) : (
                      <span style={{ color: '#CFCCC6' }}>—</span>
                    )}
                  </td>

                  {/* Valor */}
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: r.valorTotal > 0 ? '#1A1A1A' : '#CFCCC6' }}>
                      {r.valorTotal > 0 ? `R$ ${formatCurrency(r.valorTotal)}` : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    style={{ padding: '6px 14px', borderBottom: '1px solid #EBE8E2' }}
                    onClick={e => e.stopPropagation()}
                    data-row-actions
                  >
                    <div data-row-actions>
                      <button
                        data-row-actions
                        onClick={e => {
                          e.stopPropagation()
                          if (rowMenu === r.id) { setRowMenu(null); setRowMenuPos(null); return }
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                          const menuHeight = 120
                          const spaceBelow = window.innerHeight - rect.bottom
                          const top = spaceBelow < menuHeight ? rect.top - menuHeight - 4 : rect.bottom + 4
                          setRowMenuPos({ top, right: window.innerWidth - rect.right })
                          setRowMenu(r.id)
                        }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '4px 6px', borderRadius: 4, color: '#8A8A8A',
                          fontSize: 14, lineHeight: 1, fontWeight: 700,
                        }}
                        title="Ações"
                      >
                        ···
                      </button>
                      {rowMenu === r.id && rowMenuPos && (
                        <div
                          data-row-actions
                          style={{
                            position: 'fixed',
                            top: rowMenuPos.top,
                            right: rowMenuPos.right,
                            zIndex: 1000,
                            background: '#fff', border: '1px solid #EBE8E2',
                            borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            minWidth: 160,
                          }}
                        >
                          <button
                            data-row-actions
                            onClick={() => { setRowMenu(null); openEdit(r) }}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '8px 14px', fontSize: 12.5, background: 'none',
                              border: 'none', cursor: 'pointer', color: '#1A1A1A',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#F4F2ED')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            Editar
                          </button>
                          {r.status === 'pronta' && (
                            <button
                              data-row-actions
                              onClick={() => { setRowMenu(null); setLiberarTarget(r) }}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '8px 14px', fontSize: 12.5, background: 'none',
                                border: 'none', cursor: 'pointer', color: '#065f46',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#d1fae5')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                            >
                              Liberar Veículo
                            </button>
                          )}
                          {r.status !== 'cancelada' && r.status !== 'entregue' && (
                            <button
                              data-row-actions
                              onClick={() => { setRowMenu(null); setCancelarTarget(r); setCancelarMotivo(''); setCancelarMotivoErro(false) }}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '8px 14px', fontSize: 12.5, background: 'none',
                                border: 'none', cursor: 'pointer', color: '#B45309',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#FFFBEB')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                            >
                              Cancelar OS
                            </button>
                          )}
                          <button
                            data-row-actions
                            onClick={() => handleDeleteClick(r)}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '8px 14px', fontSize: 12.5, background: 'none',
                              border: 'none', cursor: 'pointer', color: '#DC2626',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>

              ))}
            </tbody>
          </table>
        </div>

        {/* ── Aba Finalizadas ─────────────────────────────────────── */}
        {activeTab === 'liberados' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <button
                onClick={() => { const d = new Date(liberadoAno, liberadoMes - 2); setLiberadoAno(d.getFullYear()); setLiberadoMes(d.getMonth() + 1) }}
                style={{ background: 'none', border: '1px solid #CFCCC6', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 14, color: '#4A4A4A' }}
              >‹</button>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', minWidth: 130, textAlign: 'center' }}>
                {new Date(liberadoAno, liberadoMes - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
              </span>
              <button
                onClick={() => { const d = new Date(liberadoAno, liberadoMes); setLiberadoAno(d.getFullYear()); setLiberadoMes(d.getMonth() + 1) }}
                style={{ background: 'none', border: '1px solid #CFCCC6', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 14, color: '#4A4A4A' }}
              >›</button>
              <span style={{ fontSize: 11.5, color: '#8A8A8A', marginLeft: 4 }}>
                {loadingLiberados ? 'Carregando…' : `${liberados.length} veículo${liberados.length !== 1 ? 's' : ''} liberado${liberados.length !== 1 ? 's' : ''}`}
              </span>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E3E0D9', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Nº OS', 'Cliente / Veículo', 'KM', 'Data', 'Status', 'Técnico', 'Valor'].map((col, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: '#8A8A8A', textTransform: 'uppercase', borderBottom: '1px solid #E3E0D9', background: '#F4F2ED', whiteSpace: 'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liberados.length === 0 && !loadingLiberados && (
                    <tr><td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', color: '#CFCCC6', fontSize: 13 }}>Nenhum veículo liberado neste mês</td></tr>
                  )}
                  {liberados.map(r => (
                    <tr key={r.id} onClick={() => setReabrirTarget(r)} style={{ cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                    >
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: '#065f46' }}>{r.numero}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                        <div style={{ fontWeight: 600 }}>{r.clienteNome}</div>
                        <div style={{ fontSize: 10.5, color: '#8A8A8A', fontFamily: "'JetBrains Mono', monospace" }}>{r.veiculoPlaca && `${displayPlate(r.veiculoPlaca)} · ${r.veiculoModelo}`}</div>
                      </td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', color: '#4A4A4A', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>{r.kmAtual ? `${Number(r.kmAtual).toLocaleString('pt-BR')} km` : '—'}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', color: '#4A4A4A', whiteSpace: 'nowrap' }}>{r.data ? new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                        <span style={{ ...STATUS_COLOR[r.status], padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>{r.tecnicoNome ? <Avatar name={r.tecnicoNome} size={26} /> : <span style={{ color: '#CFCCC6' }}>—</span>}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', fontWeight: 600, whiteSpace: 'nowrap' }}>R$ {r.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Aba Canceladas ─────────────────────────────────────── */}
        {activeTab === 'canceladas' && (
          <div>
            {/* Seletor mês/ano */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <button onClick={() => { const d = new Date(cancelAno, cancelMes - 2); setCancelarAno(d.getFullYear()); setCancelarMes(d.getMonth() + 1) }}
                style={{ background: 'none', border: '1px solid #CFCCC6', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 14, color: '#4A4A4A' }}>‹</button>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', minWidth: 130, textAlign: 'center' }}>
                {new Date(cancelAno, cancelMes - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
              </span>
              <button onClick={() => { const d = new Date(cancelAno, cancelMes); setCancelarAno(d.getFullYear()); setCancelarMes(d.getMonth() + 1) }}
                style={{ background: 'none', border: '1px solid #CFCCC6', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 14, color: '#4A4A4A' }}>›</button>
              <span style={{ fontSize: 11.5, color: '#8A8A8A', marginLeft: 4 }}>
                {loadingCanceladas ? 'Carregando…' : `${canceladas.length} OS cancelada${canceladas.length !== 1 ? 's' : ''}`}
              </span>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E3E0D9', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Nº OS', 'Cliente / Veículo', 'KM', 'Data', 'Técnico', 'Valor'].map((col, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: '#8A8A8A', textTransform: 'uppercase', borderBottom: '1px solid #E3E0D9', background: '#F4F2ED', whiteSpace: 'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {canceladas.length === 0 && !loadingCanceladas && (
                    <tr><td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', color: '#CFCCC6', fontSize: 13 }}>Nenhuma OS cancelada neste mês</td></tr>
                  )}
                  {canceladas.map(r => (
                    <tr key={r.id} onClick={() => setReabrirTarget(r)} style={{ cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                    >
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: '#8A8A8A' }}>{r.numero}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                        <div style={{ fontWeight: 600 }}>{r.clienteNome}</div>
                        <div style={{ fontSize: 10.5, color: '#8A8A8A', fontFamily: "'JetBrains Mono', monospace" }}>{r.veiculoPlaca && `${displayPlate(r.veiculoPlaca)} · ${r.veiculoModelo}`}</div>
                      </td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', color: '#4A4A4A', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>{r.kmAtual ? `${Number(r.kmAtual).toLocaleString('pt-BR')} km` : '—'}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', color: '#4A4A4A', whiteSpace: 'nowrap' }}>{r.data ? new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>{r.tecnicoNome ? <Avatar name={r.tecnicoNome} size={26} /> : <span style={{ color: '#CFCCC6' }}>—</span>}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', fontWeight: 600, whiteSpace: 'nowrap' }}>R$ {r.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <OSModal
        open={modalOpen}
        mode={modalMode}
        form={form}
        lastSaved={lastSaved}
        isSaving={upsertMutation.isPending}
        clientes={clientes}
        tecnicos={tecnicos}
        catalogoServicos={catalogoServicos}
        catalogoPecas={catalogoPecas}
        historico={historico}
        onFormChange={patchForm}
        onClose={() => setModalOpen(false)}
        onSaveDraft={handleSaveDraft}
        onGerarOrcamento={handleGerarOrcamento}
        onIniciarOS={handleIniciarOS}
        onToast={showToast}
      />

      {/* Liberar Veículo confirmation modal */}
      {liberarTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={e => { if (e.target === e.currentTarget) setLiberarTarget(null) }}
        >
          <div
            style={{
              background: '#fff', borderRadius: 8, width: 400, maxWidth: '100%',
              boxShadow: '0 16px 48px rgba(0,0,0,0.22)', padding: '24px 24px 20px',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>
              Liberar Veículo
            </div>
            <div style={{ fontSize: 13, color: '#4A4A4A', lineHeight: 1.5, marginBottom: 24 }}>
              Confirmar liberação do veículo para <strong>{liberarTarget.clienteNome}</strong>
              {liberarTarget.veiculoPlaca && (
                <> — <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{displayPlate(liberarTarget.veiculoPlaca)}</span></>
              )}?
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setLiberarTarget(null)}
                disabled={liberarMutation.isPending}
              >
                Cancelar
              </Button>
              <button
                onClick={() => liberarMutation.mutate(liberarTarget)}
                disabled={liberarMutation.isPending}
                style={{
                  padding: '6px 16px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: '#065f46', color: '#fff', fontSize: 12.5, fontWeight: 600,
                  fontFamily: 'inherit', opacity: liberarMutation.isPending ? 0.6 : 1,
                }}
              >
                {liberarMutation.isPending ? 'Liberando...' : 'Confirmar liberação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancelar OS confirmation modal */}
      {cancelarTarget && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) { setCancelarTarget(null); setCancelarMotivo(''); setCancelarMotivoErro(false) } }}
        >
          <div style={{ background: '#fff', borderRadius: 8, width: 440, maxWidth: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.22)', padding: '24px 24px 20px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Cancelar OS</div>
            <div style={{ fontSize: 12.5, color: '#4A4A4A', marginBottom: 18 }}>
              OS <strong>{cancelarTarget.numero}</strong> — <strong>{cancelarTarget.clienteNome}</strong>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', display: 'block', marginBottom: 5 }}>
                MOTIVO DO CANCELAMENTO <span style={{ color: '#E31E2D' }}>*</span>
              </label>
              <textarea
                value={cancelarMotivo}
                onChange={e => { setCancelarMotivo(e.target.value.toUpperCase()); setCancelarMotivoErro(false) }}
                placeholder="DESCREVA O MOTIVO DO CANCELAMENTO…"
                rows={3}
                style={{
                  width: '100%', border: `1px solid ${cancelarMotivoErro ? '#E31E2D' : '#CFCCC6'}`,
                  borderRadius: 5, padding: '8px 10px', fontSize: 12.5, color: '#1A1A1A',
                  outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box',
                  textTransform: 'uppercase',
                  boxShadow: cancelarMotivoErro ? '0 0 0 3px rgba(227,30,45,0.08)' : 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = cancelarMotivoErro ? '#E31E2D' : '#E31E2D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)' }}
                onBlur={e => { e.currentTarget.style.borderColor = cancelarMotivoErro ? '#E31E2D' : '#CFCCC6'; e.currentTarget.style.boxShadow = cancelarMotivoErro ? '0 0 0 3px rgba(227,30,45,0.08)' : 'none' }}
                autoFocus
              />
              {cancelarMotivoErro && (
                <span style={{ fontSize: 11, color: '#E31E2D', marginTop: 3, display: 'block' }}>Motivo é obrigatório</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => { setCancelarTarget(null); setCancelarMotivo(''); setCancelarMotivoErro(false) }}>Voltar</Button>
              <button
                onClick={handleCancelarConfirm}
                style={{ padding: '6px 16px', borderRadius: 5, border: 'none', cursor: 'pointer', background: '#B45309', color: '#fff', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit' }}
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reabrir / Ver OS modal (Finalizadas + Canceladas) */}
      {reabrirTarget && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setReabrirTarget(null) }}
        >
          <div style={{ background: '#fff', borderRadius: 8, width: 400, maxWidth: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.22)', padding: '24px 24px 20px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
              OS {reabrirTarget.numero}
            </div>
            <div style={{ fontSize: 12.5, color: '#4A4A4A', marginBottom: 6 }}>
              <strong>{reabrirTarget.clienteNome}</strong>
            </div>
            {reabrirTarget.veiculoPlaca && (
              <div style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", color: '#8A8A8A', marginBottom: 6 }}>
                {displayPlate(reabrirTarget.veiculoPlaca)}{reabrirTarget.veiculoModelo ? ` · ${reabrirTarget.veiculoModelo}` : ''}
              </div>
            )}
            <div style={{ marginBottom: 22 }}>
              <span style={{
                ...STATUS_COLOR[reabrirTarget.status],
                padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600,
              }}>
                {STATUS_LABEL[reabrirTarget.status]}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setReabrirTarget(null); openEdit(reabrirTarget) }}
                style={{ flex: 1 }}
              >
                Ver OS
              </Button>
              <button
                onClick={handleReabrir}
                disabled={isReabrindo}
                style={{
                  flex: 1, padding: '6px 16px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: '#1D4ED8', color: '#fff', fontSize: 12.5, fontWeight: 600,
                  fontFamily: 'inherit', opacity: isReabrindo ? 0.6 : 1,
                }}
              >
                {isReabrindo ? 'Reabrindo…' : 'Reabrir OS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}
        >
          <div
            style={{
              background: '#fff', borderRadius: 8, width: 400, maxWidth: '100%',
              boxShadow: '0 16px 48px rgba(0,0,0,0.22)', padding: '24px 24px 20px',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>
              Excluir OS
            </div>
            <div style={{ fontSize: 13, color: '#4A4A4A', lineHeight: 1.5, marginBottom: 24 }}>
              Tem certeza que deseja excluir a OS <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{deleteTarget.numero}</strong>? Esta ação não pode ser desfeita.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                style={{
                  padding: '6px 16px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: '#DC2626', color: '#fff', fontSize: 12.5, fontWeight: 600,
                  fontFamily: 'inherit', opacity: deleteMutation.isPending ? 0.6 : 1,
                }}
              >
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <ToastNotification
            key={t.id}
            toast={t}
            onDismiss={id => setToasts(prev => prev.filter(x => x.id !== id))}
          />
        ))}
      </div>
    </>
  )
}
