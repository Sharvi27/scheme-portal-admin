import { useState } from 'react'
import { supabase } from '../supabase.js'
import { Btn, Card, Badge, Modal, Toast } from '../components/ui.jsx'
import SchemeForm from './SchemeForm.jsx'

export default function Schemes({ schemes, attributes, onRefresh }) {
  const [search, setSearch] = useState('')
  const [filterBody, setFilterBody] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editScheme, setEditScheme] = useState(null)   // scheme to edit
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleActive = async (scheme) => {
    const { error } = await supabase.from('schemes').update({ is_active: !scheme.is_active }).eq('id', scheme.id)
    if (error) showToast(error.message, 'error')
    else { showToast(`Scheme ${scheme.is_active ? 'deactivated' : 'activated'}.`); onRefresh() }
  }

  const handleDelete = async (scheme) => {
    if (!confirm(`Delete "${scheme.name}"? This cannot be undone.`)) return
    const { error } = await supabase.from('schemes').delete().eq('id', scheme.id)
    if (error) showToast(error.message, 'error')
    else { showToast('Scheme deleted.'); onRefresh() }
  }

  const filtered = schemes.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchBody = filterBody === 'all' || s.issuing_body === filterBody
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? s.is_active : !s.is_active)
    return matchSearch && matchBody && matchStatus
  })

  return (
    <div className="animate">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Schemes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>{schemes.length} total schemes</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}>+ Add Scheme</Btn>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Search schemes..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', outline: 'none', minWidth: 220 }}
        />
        {[
          { key: 'filterBody', val: filterBody, set: setFilterBody, opts: [['all','All'], ['delhi','Delhi Govt'], ['central','Indian Govt'], ['haryana','Haryana Govt']] },
          { key: 'filterStatus', val: filterStatus, set: setFilterStatus, opts: [['all','All Status'], ['active','Active'], ['inactive','Inactive']] },
        ].map(({ key, val, set, opts }) => (
          <select key={key} value={val} onChange={e => set(e.target.value)}
            style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', background: 'white', cursor: 'pointer' }}>
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Name', 'Issuing Body', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No schemes found.</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500, maxWidth: 320 }}>{s.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge color={s.issuing_body === 'delhi' ? 'saffron' : s.issuing_body === 'haryana' ? 'green' : 'navy'}>
                    {s.issuing_body === 'delhi' ? '🏙️ Delhi' : s.issuing_body === 'haryana' ? '🟢 Haryana' : '🇮🇳 Indian'}
                  </Badge>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge color={s.is_active ? 'green' : 'red'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" variant="ghost" onClick={() => setEditScheme(s)}>Edit</Btn>
                    <Btn size="sm" variant={s.is_active ? 'danger' : 'success'} onClick={() => toggleActive(s)}>
                      {s.is_active ? 'Deactivate' : 'Activate'}
                    </Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDelete(s)}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add New Scheme" onClose={() => setShowAdd(false)} width={700}>
          <SchemeForm attributes={attributes} onCancel={() => setShowAdd(false)} onSave={() => { setShowAdd(false); showToast('Scheme added.'); onRefresh() }} />
        </Modal>
      )}

      {/* Edit modal */}
      {editScheme && (
        <Modal title={`Edit: ${editScheme.name}`} onClose={() => setEditScheme(null)} width={700}>
          <SchemeForm scheme={editScheme} attributes={attributes} onCancel={() => setEditScheme(null)} onSave={() => { setEditScheme(null); showToast('Scheme updated.'); onRefresh() }} />
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
