import { useState, useEffect, useRef, useMemo } from 'react'
import type { CatalogoItem } from '../../types'

interface CatalogoSearchInputProps {
  value: string
  onChange: (v: string) => void
  onSelect: (item: CatalogoItem) => void
  items: CatalogoItem[]
  placeholder?: string
  style?: React.CSSProperties
}

export function CatalogoSearchInput({
  value, onChange, onSelect, items, placeholder, style,
}: CatalogoSearchInputProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() =>
    items.filter(i =>
      i.nome.toLowerCase().includes(value.toLowerCase()) ||
      (i.codigo || '').toLowerCase().includes(value.toLowerCase())
    ).slice(0, 8),
    [items, value]
  )

  useEffect(() => {
    function handleOut(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOut)
    return () => document.removeEventListener('mousedown', handleOut)
  }, [])

  return (
    <div ref={wrapRef} style={{ position: 'relative', ...style }}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#E31E2D'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
          setOpen(true)
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#CFCCC6'
          e.currentTarget.style.boxShadow = 'none'
        }}
        placeholder={placeholder}
        style={{
          width: '100%', border: '1px solid #CFCCC6', borderRadius: 5,
          padding: '6px 8px', fontSize: 12, color: '#1A1A1A',
          outline: 'none', background: '#fff', fontFamily: 'inherit',
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#fff', border: '1px solid #CFCCC6', borderRadius: 5,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200,
          maxHeight: 180, overflowY: 'auto', marginTop: 2,
        }}>
          {filtered.map(item => (
            <div
              key={item.id}
              onMouseDown={e => { e.preventDefault(); onSelect(item); setOpen(false) }}
              style={{ padding: '7px 10px', cursor: 'pointer', borderBottom: '1px solid #F4F2ED' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F4F2ED')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A' }}>{item.nome}</div>
              {item.codigo && (
                <div style={{ fontSize: 10.5, color: '#8A8A8A', fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>
                  {item.codigo}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
