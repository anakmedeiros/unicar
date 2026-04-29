import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
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
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return []
    return items.filter(i =>
      i.nome.toLowerCase().includes(q) ||
      (i.codigo || '').toLowerCase().includes(q)
    ).slice(0, 8)
  }, [items, value])

  function openDrop() {
    if (!wrapRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    setDropPos({ top: rect.bottom + 2, left: rect.left, width: rect.width })
    setOpen(true)
  }

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
        onChange={e => { onChange(e.target.value); openDrop() }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#E31E2D'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
          openDrop()
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
      {open && dropPos && filtered.length > 0 && createPortal(
        <div style={{
          position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width,
          background: '#fff', border: '1px solid #CFCCC6', borderRadius: 5,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 9999,
          maxHeight: 240, overflowY: 'auto',
        }}>
          {filtered.map(item => (
            <div
              key={item.id}
              onMouseDown={e => { e.preventDefault(); onSelect(item); setOpen(false) }}
              style={{
                padding: '10px 12px', cursor: 'pointer',
                borderBottom: '1px solid #F4F2ED', minHeight: 44, boxSizing: 'border-box',
              }}
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
        </div>,
        document.body
      )}
    </div>
  )
}
