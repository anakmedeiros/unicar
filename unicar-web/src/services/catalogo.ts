import { supabase } from '../lib/supabase'
import type { CatalogoItem } from '../types'

export const catalogoService = {
  async list(): Promise<CatalogoItem[]> {
    const { data, error } = await supabase
      .from('catalogo_itens')
      .select('id, tipo, codigo, nome, ativo')
      .order('nome')
    if (error) throw error
    return (data ?? []) as CatalogoItem[]
  },

  async upsert(item: Partial<CatalogoItem> & { id?: string }): Promise<CatalogoItem> {
    const row = {
      tipo:   item.tipo  ?? 'servico',
      codigo: item.codigo || null,
      nome:   item.nome  ?? '',
      ativo:  item.ativo ?? true,
    }
    if (item.id) {
      const { data, error } = await supabase
        .from('catalogo_itens')
        .update(row)
        .eq('id', item.id)
        .select('id, tipo, codigo, nome, ativo')
        .single()
      if (error) throw error
      return data as CatalogoItem
    } else {
      const { data, error } = await supabase
        .from('catalogo_itens')
        .insert(row)
        .select('id, tipo, codigo, nome, ativo')
        .single()
      if (error) throw error
      return data as CatalogoItem
    }
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('catalogo_itens')
      .update({ ativo: false })
      .eq('id', id)
    if (error) throw error
  },

  async activate(id: string): Promise<void> {
    const { error } = await supabase
      .from('catalogo_itens')
      .update({ ativo: true })
      .eq('id', id)
    if (error) throw error
  },
}
