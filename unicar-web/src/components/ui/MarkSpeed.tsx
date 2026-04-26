interface MarkSpeedProps {
  size?: number
  fill?: string
  secondary?: string
}

export function MarkSpeed({ size = 56, fill = '#E31E2D', secondary = '#111111' }: MarkSpeedProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill={secondary} />
      <path d="M14 38 a18 18 0 0 1 36 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M14 38 a18 18 0 0 1 12 -17" stroke={fill} strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="32" y1="38" x2="44" y2="22" stroke={fill} strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="38" r="3" fill="#fff" />
    </svg>
  )
}

export function LogoFull() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[30px] h-[30px] rounded-[5px] bg-red flex items-center justify-center flex-shrink-0">
        <MarkSpeed size={22} fill="#fff" secondary="#fff" />
      </div>
      <span
        style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.02em', color: '#fff' }}
      >
        UNI<span style={{ color: '#E31E2D' }}>CAR</span>
      </span>
    </div>
  )
}
