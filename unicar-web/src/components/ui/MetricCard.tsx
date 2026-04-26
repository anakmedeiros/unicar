import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

interface MetricCardProps {
  label: string
  value: string
  sub?: ReactNode
  icon?: IconName
  accent?: string
  progress?: number
}

export function MetricCard({ label, value, sub, icon, accent, progress }: MetricCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E3E0D9',
        borderRadius: 6,
        padding: '14px 16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: '#8A8A8A',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
        {icon && <Icon name={icon} size={14} style={{ color: accent ?? '#8A8A8A' }} />}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#1A1A1A',
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>

      {progress != null && (
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              height: 6,
              background: '#EBE8E2',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#E31E2D',
                borderRadius: 999,
              }}
            />
          </div>
          {sub && (
            <div style={{ fontSize: 11, color: '#8A8A8A', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              {sub}
            </div>
          )}
        </div>
      )}

      {progress == null && sub && (
        <div style={{ fontSize: 11, color: '#8A8A8A', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          {sub}
        </div>
      )}
    </div>
  )
}
