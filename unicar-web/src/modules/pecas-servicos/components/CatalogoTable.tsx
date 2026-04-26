import { Icon } from '../../../components/ui/Icon'
import type { CatalogoItem } from '../../../types'

const TIPO_STYLE = {
  peca:    { bg: 'rgba(124,58,237,0.12)',  color: '#6D28D9', label: 'Peça'    },
  servico: { bg: 'rgba(22,163,74,0.12)',   color: '#15803D', label: 'Serviço' },
} as const

interface CatalogoTableProps {
  items: CatalogoItem[]
  isLoading: boolean
  isError: boolean
  onEdit: (item: CatalogoItem) => void
  onDeactivate: (item: CatalogoItem) => void
  onActivate: (item: CatalogoItem) => void
}

export function CatalogoTable({
  items, isLoading, isError, onEdit, onDeactivate, onActivate,
}: CatalogoTableProps) {
  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '10px 14px',
    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
    color: '#8A8A8A', textTransform: 'uppercase',
    borderBottom: '1px solid #E3E0D9', background: '#F4F2ED',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #E3E0D9', borderRadius: 8,
      overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 100 }}>Tipo</th>
            <th style={{ ...thStyle, width: 130 }}>Código</th>
            <th style={thStyle}>Nome</th>
            <th style={{ ...thStyle, width: 100 }}>Situação</th>
            <th style={{ ...thStyle, width: 80, textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={5} style={{ padding: '40px 14px', textAlign: 'center', color: '#8A8A8A', fontSize: 13 }}>
                Carregando catálogo…
              </td>
            </tr>
          )}
          {isError && (
            <tr>
              <td colSpan={5} style={{ padding: '40px 14px', textAlign: 'center', color: '#E31E2D', fontSize: 13 }}>
                Erro ao carregar itens do catálogo
              </td>
            </tr>
          )}
          {!isLoading && !isError && items.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '40px 14px', textAlign: 'center', color: '#CFCCC6', fontSize: 13 }}>
                Nenhum item encontrado
              </td>
            </tr>
          )}
          {items.map(item => {
            const tipo = TIPO_STYLE[item.tipo]
            return (
              <tr
                key={item.id}
                style={{ opacity: item.ativo ? 1 : 0.6 }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F4F2ED')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Tipo */}
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '2px 8px', borderRadius: 999,
                    fontSize: 10.5, fontWeight: 600,
                    background: tipo.bg, color: tipo.color,
                  }}>
                    {tipo.label}
                  </span>
                </td>

                {/* Código */}
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5,
                    color: item.codigo ? '#1A1A1A' : '#CFCCC6',
                  }}>
                    {item.codigo || '—'}
                  </span>
                </td>

                {/* Nome */}
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2', fontWeight: 600, color: '#1A1A1A' }}>
                  {item.nome}
                </td>

                {/* Situação */}
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                  {item.ativo ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, background: 'rgba(22,163,74,0.12)', color: '#15803D' }}>
                      Ativo
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, background: 'rgba(138,138,138,0.12)', color: '#6A6864' }}>
                      Inativo
                    </span>
                  )}
                </td>

                {/* Ações */}
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #EBE8E2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="Editar"
                      style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'transparent', border: '1px solid #CFCCC6', borderRadius: 5, cursor: 'pointer', color: '#8A8A8A' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.color = '#1A1A1A' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.color = '#8A8A8A' }}
                    >
                      <Icon name="edit" size={12} />
                    </button>

                    {item.ativo ? (
                      <button
                        type="button"
                        onClick={() => onDeactivate(item)}
                        title="Desativar"
                        style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'transparent', border: '1px solid #CFCCC6', borderRadius: 5, cursor: 'pointer', color: '#8A8A8A' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(227,30,45,0.08)'; e.currentTarget.style.borderColor = 'rgba(227,30,45,0.3)'; e.currentTarget.style.color = '#E31E2D' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.color = '#8A8A8A' }}
                      >
                        <Icon name="eye-off" size={12} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onActivate(item)}
                        title="Reativar"
                        style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'transparent', border: '1px solid #CFCCC6', borderRadius: 5, cursor: 'pointer', color: '#8A8A8A' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(22,163,74,0.08)'; e.currentTarget.style.borderColor = 'rgba(22,163,74,0.3)'; e.currentTarget.style.color = '#15803D' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#CFCCC6'; e.currentTarget.style.color = '#8A8A8A' }}
                      >
                        <Icon name="eye" size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
