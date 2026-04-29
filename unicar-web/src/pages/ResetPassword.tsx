import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres'); return }
    if (password !== confirm) { setError('As senhas não coincidem'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/login', { state: { toast: 'Senha atualizada com sucesso' }, replace: true })
  }

  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '0.5px solid #e5e7eb', borderRadius: 8,
    padding: '10px 12px', paddingRight: 40, fontSize: 14,
    color: '#111827', background: '#fff', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: 24, boxSizing: 'border-box' }}>
      <style>{`
        .rp-input:focus { border-color: #dc2626 !important; box-shadow: 0 0 0 2px rgba(220,38,38,0.08) !important; }
        .rp-input::placeholder { color: #9ca3af; }
        @keyframes rpSpin { to { transform: rotate(360deg); } }
      `}</style>

      <img src="/logo-unicar.png" alt="UNICAR" style={{ width: 160, marginBottom: 32 }} />

      <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', padding: '32px 36px', width: '100%', maxWidth: 380, boxSizing: 'border-box' }}>
        <h1 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: '#111111', letterSpacing: '-0.01em' }}>
          Criar nova senha
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Nova senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="Mínimo 6 caracteres" className="rp-input" style={inputBase}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'grid', placeItems: 'center' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Confirmar nova senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                required placeholder="Repita a senha" className="rp-input" style={inputBase}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'grid', placeItems: 'center' }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 13, color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '0.5px solid rgba(220,38,38,0.2)', borderRadius: 6, padding: '8px 12px' }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', height: 44, marginTop: 4, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s', opacity: loading ? 0.8 : 1 }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: 'rpSpin 0.8s linear infinite' }} /> Salvando...</> : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
