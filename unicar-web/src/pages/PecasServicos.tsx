import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Topbar } from '../components/layout/Topbar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { CatalogoTable } from '../modules/pecas-servicos/components/CatalogoTable'
import { CatalogoDrawer } from '../modules/pecas-servicos/components/CatalogoDrawer'
import { useCatalogo } from '../modules/pecas-servicos/hooks/useCatalogo'
import { catalogoService } from '../services/catalogo'
import { ToastNotification } from '../shared/components/Toast'
import type { ToastItem } from '../shared/components/Toast'
import type { CatalogoItem } from '../types'

type TipoFilter = 'all' | 'servico' | 'peca'

export function PecasServicosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState<TipoFilter>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const { data: items = [], isLoading, isError } = useCatalogo()

  // ─── Mutations ────────────────────────────────────────────────────────────────

  const deactivateMutation = useMutation({
    mutationFn: catalogoService.deactivate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalogo'] })
      showToast('Item desativado com sucesso')
    },
    onError: () => showToast('Erro ao desativar item', 'error'),
  })

  const activateMutation = useMutation({
    mutationFn: catalogoService.activate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalogo'] })
      showToast('Item reativado com sucesso')
    },
    onError: () => showToast('Erro ao reativar item', 'error'),
  })

  // ─── Toast ────────────────────────────────────────────────────────────────────

  function showToast(message: string, variant: 'success' | 'error' = 'success') {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant, exiting: false }])
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t)), 3600)
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  // ─── Filter ───────────────────────────────────────────────────────────────────

  const filtered = items.filter(item => {
    if (filterTipo !== 'all' && item.tipo !== filterTipo) return false
    if (search) {
      const q = search.toLowerCase()
      return item.nome.toLowerCase().includes(q) || (item.codigo || '').toLowerCase().includes(q)
    }
    return true
  })

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  function openNew() {
    setEditingItem(null)
    setDrawerOpen(true)
  }

  function openEdit(item: CatalogoItem) {
    setEditingItem(item)
    setDrawerOpen(true)
  }

  function handleSaved(_saved: CatalogoItem, mode: 'new' | 'edit') {
    setDrawerOpen(false)
    showToast(mode === 'new' ? 'Item cadastrado com sucesso' : 'Item atualizado com sucesso')
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Topbar
        section="Cadastros"
        title="Peças e Serviços"
        searchPlaceholder="Buscar por nome ou código…"
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <Button variant="primary" size="md" onClick={openNew}>
            <Icon name="plus" size={13} />
            Novo item
          </Button>
        }
      />

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'inline-flex', border: '1px solid #CFCCC6', borderRadius: 6, overflow: 'hidden' }}>
              {([
                { key: 'all',     label: 'Todos'    },
                { key: 'servico', label: 'Serviços' },
                { key: 'peca',    label: 'Peças'    },
              ] as { key: TipoFilter; label: string }[]).map(({ key, label }) => (
                <button
                  key={key} type="button"
                  onClick={() => setFilterTipo(key)}
                  style={{
                    padding: '6px 14px', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: 'none',
                    background: filterTipo === key ? '#111111' : '#fff',
                    color: filterTipo === key ? '#fff' : '#4A4A4A',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {!isLoading && !isError && (
              <span style={{ fontSize: 12, color: '#8A8A8A' }}>
                <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{filtered.length}</span>
                {' '}{filtered.length === 1 ? 'item' : 'itens'}
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{ marginLeft: 8, fontSize: 11, color: '#E31E2D', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Limpar filtro ✕
                  </button>
                )}
              </span>
            )}
          </div>

          <Button variant="secondary" size="sm">
            <Icon name="download" size={12} />
            Exportar
          </Button>
        </div>

        <CatalogoTable
          items={filtered}
          isLoading={isLoading}
          isError={isError}
          onEdit={openEdit}
          onDeactivate={item => deactivateMutation.mutate(item.id)}
          onActivate={item => activateMutation.mutate(item.id)}
        />
      </div>

      <CatalogoDrawer
        open={drawerOpen}
        item={editingItem}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleSaved}
      />

      {/* Toast container */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <ToastNotification
            key={t.id} toast={t}
            onDismiss={id => setToasts(prev => prev.filter(x => x.id !== id))}
          />
        ))}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(6px) scale(0.96); }
        }
      `}</style>
    </>
  )
}
