import { useState } from 'react'
import { supabase } from '../supabase.js'
import { Btn, Input } from '../components/ui.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
    }}>
      <div style={{
        background: 'white', borderRadius: 'var(--radius)', padding: '40px 36px',
        width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🏛️</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--navy)' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Welfare Scheme Portal</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="admin@example.com" required />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

          {error && (
            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <Btn onClick={handleLogin} disabled={loading} style={{ justifyContent: 'center', padding: '11px', marginTop: 4 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Btn>
        </div>
      </div>
    </div>
  )
}
