interface DayPillProps {
  days: number
}

export function DayPill({ days }: DayPillProps) {
  const tone =
    days <= 1
      ? { bg: 'rgba(16,136,74,0.12)', fg: '#0D6E3D' }
      : days <= 3
      ? { bg: 'rgba(245,158,11,0.16)', fg: '#B25E09' }
      : { bg: 'rgba(227,30,45,0.14)', fg: '#C0192A' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 26,
        height: 22,
        padding: '0 6px',
        borderRadius: 4,
        fontSize: 10.5,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        background: tone.bg,
        color: tone.fg,
        flexShrink: 0,
      }}
    >
      {days}d
    </span>
  )
}
