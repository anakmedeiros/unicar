const TONES = ['#3a3a3a', '#4a4a4a', '#2a2a2a']

interface AvatarProps {
  name: string
  size?: number
  tone?: string
}

export function Avatar({ name, size = 24, tone }: AvatarProps) {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
  const bg = tone ?? TONES[name.length % 3]

  return (
    <span
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'inline-grid',
        placeItems: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  )
}
