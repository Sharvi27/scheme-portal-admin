import { useState } from 'react'
import { supabase } from '../supabase.js'
import { Btn, Input, Select, Card, Badge, Modal, Toast } from '../components/ui.jsx'

const DATA_TYPE_OPTIONS = [
  { value: '', label: 'Select type...' },
  { value: 'boolean', label: 'Boolean (Yes/No)' },
  { value: 'range', label: 'Range (min/max number)' },
  { value: 'enum', label: 'Enum (list of options)' },
]

const emptyForm = { key: '', label: '', data_type: '', options: '' }

export default function Attributes({ attributes, onRefresh }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.key || !form.label || !form.data_type) {
      showToast('Key, label, and type are required.', 'error'); return
    }
    setSaving(true)
    // Parse options for enum type
    let options = null
    if (form.data_type === 'enum' && form.options) {
      options = form.options.split(',').map(s => s.trim()).filter(Boolean)
    }
    const { error } = await supabase.from('attribute_definitions').insert({
      key: form.key.toLowerCase().replace(/\s+/g, '_'),
      label: form.label,
      data_type: form.data_type,
      options: options ? JSON.stringify(options) : null,
    })
    setSaving(false)
    if (error) { showToast(error.message, 'error'); return }
    showToast('Attribute added successfully.')
    setShowModal(false)
    setForm(emptyForm)
    onRefresh()
  }

  const toggleActive = async (attr) => {
    const { error } = await supabase
      .from('attribute_definitions')
      .update({ is_active: !attr.is_active })
      .eq('id', attr.id)
    if (error) showToast(error.message, 'error')
    else onRefresh()
  }

  return (
    <div className="animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Eligibility Attributes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>Manage the criteria used to filter schemes</p>
        </div>
        <Btn onClick={() => setShowModal(true)}>+ Add Attribute</Btn>
      </div>

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Key', 'Label', 'Type', 'Options', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr, i) => (
              <tr key={attr.id} style={{ borderBottom: i < attributes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: 'var(--navy)' }}>{attr.key}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{attr.label}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge color={attr.data_type === 'boolean' ? 'navy' : attr.data_type === 'range' ? 'saffron' : 'gray'}>
                    {attr.data_type}
                  </Badge>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {attr.options ? (Array.isArray(attr.options) ? attr.options.join(', ') : JSON.stringify(attr.options)) : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge color={attr.is_active ? 'green' : 'red'}>{attr.is_active ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Btn size="sm" variant={attr.is_active ? 'danger' : 'success'} onClick={() => toggleActive(attr)}>
                    {attr.is_active ? 'Deactivate' : 'Activate'}
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showModal && (
        <Modal title="Add New Attribute" onClose={() => { setShowModal(false); setForm(emptyForm) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Key" value={form.key} onChange={v => setField('key', v)} placeholder="e.g. has_land_ownership" required />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: -10 }}>Lowercase, underscores only. This is the internal identifier.</p>
            <Input label="Display Label" value={form.label} onChange={v => setField('label', v)} placeholder="e.g. Has Land Ownership" required />
            <Select label="Data Type" value={form.data_type} onChange={v => setField('data_type', v)} options={DATA_TYPE_OPTIONS} required />
            {form.data_type === 'enum' && (
              <Input label="Options (comma separated)" value={form.options} onChange={v => setField('options', v)} placeholder="e.g. option1, option2, option3" />
            )}
            {form.data_type === 'boolean' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                Boolean attributes are Yes/No. When adding eligibility rules, you can set whether the scheme requires Yes, No, or doesn't care.
              </p>
            )}
            {form.data_type === 'range' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                Range attributes use min/max values. When adding eligibility rules, you can set a minimum, maximum, or both.
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Btn variant="ghost" onClick={() => { setShowModal(false); setForm(emptyForm) }}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Add Attribute'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
