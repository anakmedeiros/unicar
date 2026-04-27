import { useState, useMemo } from 'react'
import { Topbar } from '../components/layout/Topbar'
import { ToastNotification } from '../shared/components/Toast'
import type { ToastItem } from '../shared/components/Toast'
import { FiltrosFinanceiro } from '../modules/financeiro/components/FiltrosFinanceiro'
import { CalendarioVencimentos } from '../modules/financeiro/components/CalendarioVencimentos'
import { ContasReceberTable } from '../modules/financeiro/components/ContasReceberTable'
import { ModalRecebimentoParcial } from '../modules/financeiro/components/ModalRecebimentoParcial'
import {
  useContasReceber,
  useMarcarRecebido,
  useRecebimentoParcial,
} from '../modules/financeiro/hooks/useContasReceber'
import type { StatusPagamento, Parcela } from '../modules/financeiro/types'

function firstDayOfMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function lastDayOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
}

export function ContasReceberPage() {
  // Filters
  const [dataInicio, setDataInicio] = useState(firstDayOfMonth)
  const [dataFim, setDataFim] = useState(lastDayOfMonth)
  const [statusFiltros, setStatusFiltros] = useState<Set<StatusPagamento>>(
    new Set(['pago', 'pendente', 'atrasado'])
  )
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modal
  const [modalParcela, setModalParcela] = useState<Parcela | null>(null)

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function showToast(message: string, variant: 'success' | 'error' = 'success') {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant, exiting: false }])
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t)), 3600)
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400)
  }

  // Data
  const { data: allParcelas = [], isLoading } = useContasReceber()

  const marcarMutation = useMarcarRecebido()
  const parcialMutation = useRecebimentoParcial()

  // Compute periodo parcelas (for filters panel and calendar dots)
  const periodParcelas = useMemo(
    () => allParcelas.filter(p => p.data_vencimento >= dataInicio && p.data_vencimento <= dataFim),
    [allParcelas, dataInicio, dataFim]
  )

  // Final filtered parcelas for the table
  const filteredParcelas = useMemo(() => {
    let list = periodParcelas.filter(p => statusFiltros.has(p.statusEfetivo))
    if (diaSelecionado) list = list.filter(p => p.data_vencimento === diaSelecionado)
    return list
  }, [periodParcelas, statusFiltros, diaSelecionado])

  // Calendar month derived from dataInicio
  const calAno = parseInt(dataInicio.slice(0, 4))
  const calMes = parseInt(dataInicio.slice(5, 7))

  // Handlers
  function handleStatusToggle(s: StatusPagamento) {
    setStatusFiltros(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  function handleSelectToggle(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSelectAll() {
    setSelectedIds(new Set(filteredParcelas.map(p => p.id)))
  }

  function handleDeselectAll() {
    setSelectedIds(new Set())
  }

  async function handleMarcarRecebido(ids: string[]) {
    try {
      await marcarMutation.mutateAsync(ids)
      setSelectedIds(new Set())
      showToast(ids.length === 1 ? 'Pagamento registrado' : `${ids.length} pagamentos registrados`)
    } catch {
      showToast('Erro ao registrar pagamento', 'error')
    }
  }

  async function handleRecebimentoParcial(params: Parameters<typeof parcialMutation.mutateAsync>[0]) {
    try {
      await parcialMutation.mutateAsync(params)
      setModalParcela(null)
      showToast('Recebimento parcial registrado')
    } catch {
      showToast('Erro ao registrar recebimento parcial', 'error')
    }
  }

  return (
    <>
      <Topbar title="Financeiro" subtitle="Contas a Receber" hideSearch />

      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          padding: 16,
          gap: 12,
        }}
      >
        {/* Left panel: Filters */}
        <FiltrosFinanceiro
          dataInicio={dataInicio}
          dataFim={dataFim}
          statusFiltros={statusFiltros}
          parcelas={periodParcelas}
          onDataInicioChange={setDataInicio}
          onDataFimChange={setDataFim}
          onStatusToggle={handleStatusToggle}
        />

        {/* Right panel: Calendar + Table */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <CalendarioVencimentos
            ano={calAno}
            mes={calMes}
            parcelas={periodParcelas}
            diaSelecionado={diaSelecionado}
            onDiaClick={setDiaSelecionado}
          />

          <ContasReceberTable
            parcelas={filteredParcelas}
            selectedIds={selectedIds}
            isLoading={isLoading}
            onSelectToggle={handleSelectToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onMarcarRecebido={handleMarcarRecebido}
            onRecebimentoParcial={setModalParcela}
          />
        </div>
      </div>

      <ModalRecebimentoParcial
        parcela={modalParcela}
        open={!!modalParcela}
        onClose={() => setModalParcela(null)}
        onConfirm={handleRecebimentoParcial}
        isSaving={parcialMutation.isPending}
      />

      {/* Toasts */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 9999,
        }}
      >
        {toasts.map(t => (
          <ToastNotification key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </>
  )
}
