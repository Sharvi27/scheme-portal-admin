import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import Login from './pages/Login.jsx'
import Schemes from './pages/Schemes.jsx'
import Attributes from './pages/Attributes.jsx'
import { Spinner } from './components/ui.jsx'

function Sidebar({ page, setPage, onLogout, user }) {
  const navItem = (id, icon, label) => (
    <button onClick={() => setPage(id)} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
      width: '100%', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
      background: page === id ? 'rgba(255,255,255,0.12)' : 'transparent',
      color: page === id ? 'white' : 'rgba(255,255,255,0.65)',
      fontWeight: page === id ? 600 : 400, fontSize: '0.92rem', textAlign: 'left',
      transition: 'all 0.15s',
    }}>
      <span style={{ fontSize: '1rem' }}>{icon}</span> {label}
    </button>
  )

  return (
    <div style={{
      width: 220, background: 'linear-gradient(180deg, var(--navy) 0%, var(--navy-light) 100%)',
      display: 'flex', flexDirection: 'column', padding: '24px 12px', flexShrink: 0,
      minHeight: '100vh',
    }}>
      <div style={{ marginBottom: 32, padding: '0 4px' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>🏛️ Admin Panel</div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Scheme Portal</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {navItem('schemes', '📋', 'Schemes')}
        {navItem('attributes', '🏷️', 'Attributes')}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', padding: '0 4px', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
          width: '100%', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)',
          fontSize: '0.88rem', transition: 'all 0.15s',
        }}>
          ↩ Sign Out
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [page, setPage] = useState('schemes')
  const [schemes, setSchemes] = useState([])
  const [attributes, setAttributes] = useState([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadData = async () => {
    setDataLoading(true)
    const [{ data: s }, { data: a }] = await Promise.all([
      supabase.from('schemes').select('*').order('name'),
      supabase.from('attribute_definitions').select('*').order('label'),
    ])
    setSchemes(s || [])
    setAttributes(a || [])
    setDataLoading(false)
  }

  useEffect(() => {
    if (session) loadData()
  }, [session])

  const handleLogout = () => supabase.auth.signOut()

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} user={session.user} />

      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', minWidth: 0 }}>
        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Schemes', value: schemes.length, icon: '📋' },
            { label: 'Active', value: schemes.filter(s => s.is_active).length, icon: '✅' },
            { label: 'Delhi Schemes', value: schemes.filter(s => s.issuing_body === 'delhi').length, icon: '🏙️' },
            { label: 'Indian Govt', value: schemes.filter(s => s.issuing_body === 'central').length, icon: '🇮🇳' },
            { label: 'Haryana Schemes', value: schemes.filter(s => s.issuing_body === 'haryana').length, icon: '🟢' },
            { label: 'Attributes', value: attributes.length, icon: '🏷️' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: 'var(--shadow)', minWidth: 140,
            }}>
              <span style={{ fontSize: '1.3rem' }}>{icon}</span>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {dataLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
        ) : page === 'schemes' ? (
          <Schemes schemes={schemes} attributes={attributes} onRefresh={loadData} />
        ) : (
          <Attributes attributes={attributes} onRefresh={loadData} />
        )}
      </main>
    </div>
  )
}
