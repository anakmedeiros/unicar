import type { OSStatus } from '../../types'

const config: Record<string, { bg: string; fg: string }> = {
  open:     { bg: 'rgba(227,30,45,0.10)',   fg: '#C0192A' },
  progress: { bg: 'rgba(245,158,11,0.12)',  fg: '#B25E09' },
  waiting:  { bg: 'rgba(99,102,241,0.10)',  fg: '#4F46D6' },
  done:     { bg: 'rgba(16,136,74,0.10)',   fg: '#0D6E3D' },
  paid:     { bg: 'rgba(16,136,74,0.10)',   fg: '#0D6E3D' },
  late:     { bg: 'rgba(227,30,45,0.10)',   fg: '#C0192A' },
  due:      { bg: 'rgba(245,158,11,0.12)',  fg: '#B25E09' },
  draft:    { bg: '#ECEBE6',                fg: '#4A4A4A' },
  inactive: { bg: '#ECEBE6',                fg: '#8A8A8A' },
}

interface StatusPillProps {
  kind: OSStatus | string
  children: string
}

export function StatusPill({ kind, children }: StatusPillProps) {
  const { bg, fg } = config[kind] ?? config.draft

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: bg,
        color: fg,
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }}
      />
      {children}
    </span>
  )
}
