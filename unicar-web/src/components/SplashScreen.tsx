export function SplashScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <style>{`
        @keyframes splashFadeIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <img
        src="/logo-unicar.png"
        alt="UNICAR"
        style={{ width: 200, animation: 'splashFadeIn 0.6s ease forwards' }}
      />
    </div>
  )
}
