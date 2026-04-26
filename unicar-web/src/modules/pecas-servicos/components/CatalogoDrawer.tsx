import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { Field, Input, Select } from '../../../components/ui/Field'
import { catalogoService } from '../../../services/catalogo'
import type { CatalogoItem } from '../../../types'

interface DrawerForm {
  tipo: 'servico' | 'peca'
  codigo: string
  nome: string
  ativo: boolean
}

const EMPTY_FORM: DrawerForm = {
  tipo: 'servico',
  codigo: '',
  nome: '',
  ativo: true,
}

interface CatalogoDrawerProps {
  open: boolean
  item: CatalogoItem | null
  onClose: () => void
  onSaved: (item: CatalogoItem, mode: 'new' | 'edit') => void
}

export function CatalogoDrawer({ open, item, onClose, onSaved }: CatalogoDrawerProps) {
  const mode: 'new' | 'edit' = item ? 'edit' : 'new'
  const [form, setForm] = useState<DrawerForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const qc = useQueryClient()

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({ tipo: item.tipo, codigo: item.codigo || '', nome: item.nome, ativo: item.ativo })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
    }
  }, [open, item])

  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [open, onClose])

  const upsertMutation = useMutation({
    mutationFn: (payload: Partial<CatalogoItem> & { id?: string }) => catalogoService.upsert(payload),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['catalogo'] })
      onSaved(saved, mode)
    },
    onError: (err) => { console.error('CatalogoDrawer upsert error:', err) },
  })

  function patch(p: Partial<DrawerForm>) { setForm(prev => ({ ...prev, ...p })) }

  function validate(): boolean {
    const errs: Partial<Record<string, string>> = {}
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    upsertMutation.mutate({
      id:     item?.id,
      tipo:   form.tipo,
      codigo: form.codigo.trim() || null,
      nome:   form.nome.trim(),
      ativo:  form.ativo,
    })
  }

  const isSaving = upsertMutation.isPending

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(20,20,20,0.45)',
          zIndex: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'new' ? 'Novo item do catálogo' : `Editar ${item?.nome ?? 'item'}`}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
          background: '#fff', zIndex: 50,
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #E3E0D9',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
              {mode === 'new' ? 'Novo item' : 'Editar item'}
            </div>
            <div style={{ fontSize: 11.5, color: '#8A8A8A', marginTop: 2 }}>
              {mode === 'new'
                ? 'Cadastre uma peça ou serviço no catálogo'
                : `Editando: ${item?.nome}`}
            </div>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Fechar"
            style={{
              width: 28, height: 28, display: 'grid', placeItems: 'center',
              background: 'transparent', border: '1px solid #CFCCC6',
              borderRadius: 5, cursor: 'pointer', color: '#8A8A8A', flexShrink: 0,
            }}
          >
            <Icon name="plus" size={13} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Toggle Peça / Serviço */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#4A4A4A', marginBottom: 6 }}>
                Tipo
              </div>
              <div style={{ display: 'inline-flex', border: '1px solid #CFCCC6', borderRadius: 6, overflow: 'hidden' }}>
                {(['servico', 'peca'] as const).map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => patch({ tipo: t })}
                    style={{
                      padding: '7px 18px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', border: 'none',
                      background: form.tipo === t ? '#111111' : '#fff',
                      color: form.tipo === t ? '#fff' : '#4A4A4A',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {t === 'servico' ? 'Serviço' : 'Peça'}
                  </button>
                ))}
              </div>
            </div>

            {/* Código */}
            <Field label="Código" hint="Opcional — deixe em branco se não houver">
              <Input
                value={form.codigo}
                onChange={e => patch({ codigo: e.target.value })}
                placeholder="Ex: SRV-001"
                mono
              />
            </Field>

            {/* Nome */}
            <Field label="Nome" required error={errors.nome}>
              <Input
                value={form.nome}
                onChange={e => patch({ nome: e.target.value })}
                placeholder={form.tipo === 'servico' ? 'Ex: Troca de óleo' : 'Ex: Filtro de óleo'}
                error={!!errors.nome}
              />
            </Field>

            {/* Situação */}
            <Field label="Situação">
              <Select
                value={form.ativo ? 'true' : 'false'}
                onChange={e => patch({ ativo: e.target.value === 'true' })}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </Select>
            </Field>

            {upsertMutation.isError && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '8px 12px',
                background: 'rgba(227,30,45,0.06)',
                border: '1px solid rgba(227,30,45,0.2)',
                borderRadius: 5,
              }}>
                <Icon name="alert" size={13} style={{ color: '#E31E2D', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: '#C0192A' }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Erro ao salvar</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, wordBreak: 'break-word' }}>
                    {(upsertMutation.error as { message?: string })?.message ?? 'Erro desconhecido — veja o console do navegador'}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #E3E0D9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, background: '#FAF9F7', gap: 12,
        }}>
          <span style={{ fontSize: 11, color: '#8A8A8A' }}>
            <span style={{ color: '#E31E2D' }}>*</span> Campo obrigatório
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando…' : mode === 'new' ? 'Salvar item' : 'Salvar alterações'}
              {!isSaving && <Icon name="chevron" size={13} />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
