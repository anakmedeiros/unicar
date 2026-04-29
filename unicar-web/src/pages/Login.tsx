import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const [forgotMode,    setForgotMode]    = useState(false)
  const [forgotEmail,   setForgotEmail]   = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent,    setForgotSent]    = useState(false)

  const successMsg = (location.state as { toast?: string } | null)?.toast ?? ''

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard', { replace: true })
    })
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [navigate])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid') || msg.includes('credential') || msg.includes('email') || msg.includes('password')) {
        setError('E-mail ou senha incorretos')
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('connect')) {
        setError('Erro de conexão. Tente novamente.')
      } else {
        setError(error.message)
      }
      return
    }
    navigate('/dashboard', { replace: true })
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setForgotLoading(true)
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setForgotLoading(false)
    setForgotSent(true)
  }

  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '0.5px solid #e5e7eb', borderRadius: 8,
    padding: '10px 12px 10px 38px', fontSize: 14,
    color: '#111827', background: '#fff',
    outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <style>{`
        .uni-input:focus {
          border-color: #dc2626 !important;
          box-shadow: 0 0 0 2px rgba(220,38,38,0.08) !important;
        }
        .uni-input::placeholder { color: #9ca3af; }
        .uni-btn-primary:hover:not(:disabled) { background: #b91c1c !important; }
        @keyframes uniSpin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Left column ─────────────────────────────────────────────────────── */}
      {!isMobile && (
        <div style={{
          width: '55%', flexShrink: 0, background: '#000000',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <img src="/logo-unicar.png" alt="UNICAR" style={{ maxWidth: 280, width: '100%' }} />
            <p style={{
              margin: 0, color: '#9ca3af', fontSize: 14,
              letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>
              Sistema de Gestão para Oficinas
            </p>
          </div>
          <span style={{ position: 'absolute', bottom: 24, fontSize: 11, color: '#374151' }}>
            v1.0
          </span>
        </div>
      )}

      {/* ── Right column ────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, background: '#ffffff',
        borderLeft: isMobile ? 'none' : '0.5px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '24px' : '48px', boxSizing: 'border-box',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile logo */}
          {isMobile && (
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <img src="/logo-unicar.png" alt="UNICAR" style={{ maxWidth: 140, width: '100%' }} />
            </div>
          )}

          {/* Logo text (desktop only) */}
          {!isMobile && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em' }}>
                <span style={{ color: '#374151' }}>UNI</span>
                <span style={{ color: '#dc2626' }}>CAR</span>
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 3 }}>
                Auto Service
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#111111', letterSpacing: '-0.02em' }}>
              Bem-vindo de volta
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
              Faça login para acessar o sistema
            </p>
          </div>

          {/* Success message (from reset-password redirect) */}
          {successMsg && (
            <div style={{ marginBottom: 14, fontSize: 13, color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '0.5px solid rgba(22,163,74,0.3)', borderRadius: 6, padding: '8px 12px' }}>
              {successMsg}
            </div>
          )}

          {/* ── Login form ──────────────────────────────────────────────────── */}
          {!forgotMode ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  E-mail
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com" required
                    className="uni-input" style={inputBase}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="uni-input" style={{ ...inputBase, paddingRight: 40 }}
                  />
                  <button
                    type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'grid', placeItems: 'center', padding: 2 }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: '#dc2626', width: 14, height: 14 }} />
                <span style={{ fontSize: 13, color: '#6b7280' }}>Manter conectado</span>
              </label>

              {error && (
                <div style={{ fontSize: 13, color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '0.5px solid rgba(220,38,38,0.2)', borderRadius: 6, padding: '8px 12px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="uni-btn-primary"
                style={{
                  width: '100%', height: 44, marginTop: 2,
                  background: '#dc2626', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.15s',
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'uniSpin 0.8s linear infinite' }} /> Entrando...</>
                  : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => { setForgotMode(true); setForgotEmail(email); setError('') }}
                style={{ background: 'none', border: 'none', fontSize: 13, color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0, textAlign: 'center' }}
              >
                Esqueci minha senha
              </button>
            </form>

          ) : (

            /* ── Forgot password ─────────────────────────────────────────── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
                Informe seu e-mail para receber o link de redefinição de senha.
              </p>

              {forgotSent ? (
                <div style={{ fontSize: 13, color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '0.5px solid rgba(22,163,74,0.3)', borderRadius: 6, padding: '10px 12px' }}>
                  Link enviado para <strong>{forgotEmail}</strong>
                </div>
              ) : (
                <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                    <input
                      type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      placeholder="seu@email.com" required
                      className="uni-input" style={inputBase}
                    />
                  </div>
                  <button
                    type="submit" disabled={forgotLoading}
                    style={{ width: '100%', height: 44, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: forgotLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}
                  >
                    {forgotLoading ? <><Loader2 size={15} style={{ animation: 'uniSpin 0.8s linear infinite' }} /> Enviando...</> : 'Enviar link'}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setForgotMode(false); setForgotSent(false) }}
                style={{ background: 'none', border: 'none', fontSize: 13, color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0, textAlign: 'left' }}
              >
                ← Voltar ao login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
