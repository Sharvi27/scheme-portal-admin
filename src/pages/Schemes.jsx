import { useState, useMemo } from 'react'
import { supabase } from '../supabase.js'
import { Btn, Card, Badge, Modal, Toast } from '../components/ui.jsx'
import SchemeForm from './SchemeForm.jsx'

// ─── Issuing body config — kept in sync with public site ─────────────────────
const ISSUING_BODY_CONFIG = {
  central:     { label: '🇮🇳 Central',     badgeColor: 'navy' },
  delhi:       { label: '🏙️ Delhi',        badgeColor: 'saffron' },
  haryana:     { label: '🟢 Haryana',      badgeColor: 'green' },
  karnataka:   { label: '🟠 Karnataka',    badgeColor: 'orange' },
  maharashtra: { label: '🟣 Maharashtra',  badgeColor: 'purple' },
  tamil_nadu:  { label: '🔵 Tamil Nadu',   badgeColor: 'blue' },
  telangana:   { label: '🟡 Telangana',    badgeColor: 'yellow' },
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel} width={420}>
      <p style={{ fontSize: '0.93rem', color: 'var(--text)', marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn variant="danger" onClick={onConfirm}>Delete</Btn>
      </div>
    </Modal>
  )
}

export default function Schemes({ schemes, attributes, onRefresh }) {
  const [search, setSearch] = useState('')
  const [filterBody, setFilterBody] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editScheme, setEditScheme] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), type === 'error' ? 0 : 3000)
  }

  const toggleActive = async (scheme) => {
    const { error } = await supabase.from('schemes').update({ is_active: !scheme.is_active }).eq('id', scheme.id)
    if (error) showToast(error.message, 'error')
    else { showToast(`Scheme ${scheme.is_active ? 'deactivated' : 'activated'}.`); onRefresh() }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await supabase.from('scheme_eligibility').delete().eq('scheme_id', deleteTarget.id)
    const { error } = await supabase.from('schemes').delete().eq('id', deleteTarget.id)
    setDeleteTarget(null)
    if (error) showToast(error.message, 'error')
    else { showToast('Scheme deleted.'); onRefresh() }
  }

  const filtered = useMemo(() => schemes.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchBody   = filterBody === 'all' || s.issuing_body === filterBody
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? s.is_active : !s.is_active)
    return matchSearch && matchBody && matchStatus
  }), [schemes, search, filterBody, filterStatus])

  return (
    <div className="animate">
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
        <select value={filterBody} onChange={e => setFilterBody(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', background: 'white', cursor: 'pointer' }}>
          <option value="all">All Bodies</option>
          {Object.entries(ISSUING_BODY_CONFIG).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', background: 'white', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Name', 'Issuing Body', 'Type', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No schemes found.</td></tr>
            ) : filtered.map((s, i) => {
              const bodyConf = ISSUING_BODY_CONFIG[s.issuing_body] || ISSUING_BODY_CONFIG.central
              return (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, maxWidth: 320 }}>{s.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge color={bodyConf.badgeColor}>{bodyConf.label}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {s.scheme_type
                      ? <Badge color={s.scheme_type === 'DBT' ? 'navy' : 'gray'}>{s.scheme_type}</Badge>
                      : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>}
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
                      <Btn size="sm" variant="danger" onClick={() => setDeleteTarget(s)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {showAdd && (
        <Modal title="Add New Scheme" onClose={() => setShowAdd(false)} width={700}>
          <SchemeForm
            attributes={attributes}
            onCancel={() => setShowAdd(false)}
            onSave={() => { setShowAdd(false); showToast('Scheme added.'); onRefresh() }}
          />
        </Modal>
      )}

      {editScheme && (
        <Modal title={`Edit: ${editScheme.name}`} onClose={() => setEditScheme(null)} width={700}>
          <SchemeForm
            scheme={editScheme}
            attributes={attributes}
            onCancel={() => setEditScheme(null)}
            onSave={() => { setEditScheme(null); showToast('Scheme updated.'); onRefresh() }}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will also remove all its eligibility rules and cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
