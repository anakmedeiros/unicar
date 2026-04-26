import { Topbar } from '../components/layout/Topbar'

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <>
      <Topbar title={title} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8A8A8A',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#CFCCC6',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 11 }}>Em construção</div>
      </div>
    </>
  )
}
