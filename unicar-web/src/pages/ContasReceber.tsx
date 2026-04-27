import { useState, useMemo } from 'react'
import { Topbar } from '../components/layout/Topbar'
import { ToastNotification } from '../shared/components/Toast'
import type { ToastItem } from '../shared/components/Toast'
import { FiltrosFinanceiro } from '../modules/financeiro/components/FiltrosFinanceiro'
import { ContasReceberTable } from '../modules/financeiro/components/ContasReceberTable'
import { ModalRecebimentoParcial } from '../modules/financeiro/components/ModalRecebimentoParcial'
import {
  useContasReceber,
  useMarcarRecebido,
  useRecebimentoParcial,
  useDesfazerRecebimento,
} from '../modules/financeiro/hooks/useContasReceber'
import type { StatusPagamento, Parcela } from '../modules/financeiro/types'

export function ContasReceberPage() {
  // Calendar month navigation
  const [calAno, setCalAno] = useState(() => new Date().getFullYear())
  const [calMes, setCalMes] = useState(() => new Date().getMonth() + 1)

  // Date range filter
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)

  // Status filter
  const [statusFiltros, setStatusFiltros] = useState<Set<StatusPagamento>>(
    new Set(['pago', 'pendente', 'atrasado'])
  )

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
  const desfazerMutation = useDesfazerRecebimento()

  // Period parcelas: range if set, else full displayed month
  const periodParcelas = useMemo(() => {
    if (rangeStart && rangeEnd)
      return allParcelas.filter(p => p.data_vencimento >= rangeStart && p.data_vencimento <= rangeEnd)
    if (rangeStart)
      return allParcelas.filter(p => p.data_vencimento === rangeStart)
    const monthStr = `${calAno}-${String(calMes).padStart(2, '0')}`
    return allParcelas.filter(p => p.data_vencimento.startsWith(monthStr))
  }, [allParcelas, rangeStart, rangeEnd, calAno, calMes])

  // Table data: period filtered by status
  const filteredParcelas = useMemo(
    () => periodParcelas.filter(p => statusFiltros.has(p.statusEfetivo)),
    [periodParcelas, statusFiltros]
  )

  // Handlers
  function handleRangeChange(start: string | null, end: string | null) {
    setRangeStart(start)
    setRangeEnd(end)
    setSelectedIds(new Set())
  }

  function handleMonthChange(ano: number, mes: number) {
    setCalAno(ano)
    setCalMes(mes)
    // Clear range when navigating to a different month
    setRangeStart(null)
    setRangeEnd(null)
    setSelectedIds(new Set())
  }

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

  async function handleDesfazerRecebimento(id: string) {
    try {
      await desfazerMutation.mutateAsync(id)
      showToast('Recebimento desfeito')
    } catch {
      showToast('Erro ao desfazer recebimento', 'error')
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
        {/* Left panel: Calendar + Filters */}
        <FiltrosFinanceiro
          allParcelas={allParcelas}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          calAno={calAno}
          calMes={calMes}
          statusFiltros={statusFiltros}
          onRangeChange={handleRangeChange}
          onMonthChange={handleMonthChange}
          onStatusToggle={handleStatusToggle}
        />

        {/* Right panel: Table */}
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
          <ContasReceberTable
            parcelas={filteredParcelas}
            selectedIds={selectedIds}
            isLoading={isLoading}
            onSelectToggle={handleSelectToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onMarcarRecebido={handleMarcarRecebido}
            onRecebimentoParcial={setModalParcela}
            onDesfazerRecebimento={handleDesfazerRecebimento}
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
