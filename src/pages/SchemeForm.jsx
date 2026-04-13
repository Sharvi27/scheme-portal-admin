import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { Btn, Input, Select, Textarea, Badge } from '../components/ui.jsx'

const emptyScheme = { name: '', description: '', benefits: '', issuing_body: 'central', is_active: true }

function RuleEditor({ attribute, rule, onChange, onRemove }) {
  const { key, label, data_type } = attribute

  if (data_type === 'boolean') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem', minWidth: 130 }}>{label}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ v: true, l: 'Must be Yes' }, { v: false, l: 'Must be No' }].map(({ v, l }) => (
            <button key={String(v)} onClick={() => onChange({ required: v })} style={{
              padding: '4px 12px', borderRadius: 20, border: '1.5px solid',
              fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
              borderColor: rule?.required === v ? 'var(--navy)' : 'var(--border)',
              background: rule?.required === v ? 'var(--navy)' : 'white',
              color: rule?.required === v ? 'white' : 'var(--text-muted)',
            }}>{l}</button>
          ))}
        </div>
        <Btn size="sm" variant="danger" onClick={onRemove} style={{ marginLeft: 'auto' }}>Remove</Btn>
      </div>
    )
  }

  if (data_type === 'range') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem', minWidth: 130 }}>{label}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="number" placeholder="Min" value={rule?.min ?? ''} onChange={e => onChange({ ...rule, min: e.target.value === '' ? undefined : Number(e.target.value) })}
            style={{ width: 80, padding: '5px 8px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
          <input type="number" placeholder="Max" value={rule?.max ?? ''} onChange={e => onChange({ ...rule, max: e.target.value === '' ? undefined : Number(e.target.value) })}
            style={{ width: 80, padding: '5px 8px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem' }} />
        </div>
        <Btn size="sm" variant="danger" onClick={onRemove} style={{ marginLeft: 'auto' }}>Remove</Btn>
      </div>
    )
  }

  if (data_type === 'enum') {
    const opts = Array.isArray(attribute.options) ? attribute.options : (attribute.options ? JSON.parse(attribute.options) : [])
    // income_category uses "required" key
    const isIncome = key === 'income_category'
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem', minWidth: 130 }}>{label}</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {opts.filter(o => o !== 'any').map(opt => {
            const selected = isIncome ? rule?.required === opt : rule?.allowed?.includes(opt)
            return (
              <button key={opt} onClick={() => {
                if (isIncome) {
                  onChange({ required: opt })
                } else {
                  const cur = rule?.allowed || []
                  const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt]
                  onChange({ allowed: next })
                }
              }} style={{
                padding: '4px 12px', borderRadius: 20, border: '1.5px solid', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                borderColor: selected ? 'var(--navy)' : 'var(--border)',
                background: selected ? 'var(--navy)' : 'white',
                color: selected ? 'white' : 'var(--text-muted)',
                textTransform: 'capitalize',
              }}>{opt}</button>
            )
          })}
        </div>
        <Btn size="sm" variant="danger" onClick={onRemove} style={{ marginLeft: 'auto' }}>Remove</Btn>
      </div>
    )
  }

  return null
}

export default function SchemeForm({ scheme, attributes, onSave, onCancel }) {
  const isEdit = !!scheme
  const [form, setForm] = useState(isEdit ? {
    name: scheme.name, description: scheme.description || '',
    benefits: scheme.benefits || '', issuing_body: scheme.issuing_body || 'central',
    is_active: scheme.is_active,
  } : emptyScheme)

  const [eligibility, setEligibility] = useState([]) // [{attribute_id, attribute, rule}]
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load existing eligibility if editing
  useEffect(() => {
    if (!isEdit) return
    supabase.from('scheme_eligibility')
      .select('id, attribute_id, rule')
      .eq('scheme_id', scheme.id)
      .then(({ data }) => {
        if (!data) return
        const mapped = data.map(e => ({
          db_id: e.id,
          attribute_id: e.attribute_id,
          attribute: attributes.find(a => a.id === e.attribute_id),
          rule: e.rule,
        })).filter(e => e.attribute)
        setEligibility(mapped)
      })
  }, [scheme, attributes, isEdit])

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addAttribute = (attrId) => {
    if (!attrId) return
    if (eligibility.find(e => e.attribute_id === attrId)) return
    const attr = attributes.find(a => a.id === attrId)
    if (!attr) return
    setEligibility(prev => [...prev, { attribute_id: attrId, attribute: attr, rule: {} }])
  }

  const updateRule = (attrId, rule) => {
    setEligibility(prev => prev.map(e => e.attribute_id === attrId ? { ...e, rule } : e))
  }

  const removeRule = (attrId) => {
    setEligibility(prev => prev.filter(e => e.attribute_id !== attrId))
  }

  const handleSave = async () => {
    if (!form.name || !form.issuing_body) { setError('Name and issuing body are required.'); return }
    setSaving(true); setError('')

    try {
      let schemeId = scheme?.id

      if (isEdit) {
        const { error: err } = await supabase.from('schemes').update({
          name: form.name, description: form.description,
          benefits: form.benefits, issuing_body: form.issuing_body, is_active: form.is_active,
        }).eq('id', schemeId)
        if (err) throw err

        // Delete all existing eligibility rules and re-insert
        await supabase.from('scheme_eligibility').delete().eq('scheme_id', schemeId)
      } else {
        const { data, error: err } = await supabase.from('schemes').insert({
          name: form.name, description: form.description,
          benefits: form.benefits, issuing_body: form.issuing_body, is_active: form.is_active,
        }).select().single()
        if (err) throw err
        schemeId = data.id
      }

      // Insert eligibility rules
      if (eligibility.length > 0) {
        const rows = eligibility.map(e => ({
          scheme_id: schemeId, attribute_id: e.attribute_id, rule: e.rule,
        }))
        const { error: err } = await supabase.from('scheme_eligibility').insert(rows)
        if (err) throw err
      }

      onSave()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const unusedAttrs = attributes.filter(a => a.is_active && !eligibility.find(e => e.attribute_id === a.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Basic info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Scheme Name" value={form.name} onChange={v => setField('name', v)} placeholder="e.g. Delhi Old Age Pension" required style={{ gridColumn: '1 / -1' }} />
        <Select label="Issuing Body" value={form.issuing_body} onChange={v => setField('issuing_body', v)}
          options={[{ value: 'central', label: '🇮🇳 Indian Government' }, { value: 'delhi', label: '🏙️ Delhi Government' }, { value: 'haryana', label: '🟢 Haryana Government' }]} />
        <Select label="Status" value={String(form.is_active)} onChange={v => setField('is_active', v === 'true')}
          options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} />
      </div>
      <Textarea label="Description" value={form.description} onChange={v => setField('description', v)} placeholder="Brief description of the scheme..." rows={3} />
      <Textarea label="Benefits" value={form.benefits} onChange={v => setField('benefits', v)} placeholder="What benefits does this scheme provide?" rows={4} />

      {/* Eligibility rules */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Eligibility Rules
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {eligibility.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', fontStyle: 'italic' }}>No eligibility rules — this scheme will show for everyone.</p>
          )}
          {eligibility.map(e => (
            <RuleEditor key={e.attribute_id} attribute={e.attribute} rule={e.rule}
              onChange={rule => updateRule(e.attribute_id, rule)}
              onRemove={() => removeRule(e.attribute_id)} />
          ))}
        </div>

        {unusedAttrs.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Add rule:</span>
            {unusedAttrs.map(a => (
              <button key={a.id} onClick={() => addAttribute(a.id)} style={{
                padding: '4px 12px', borderRadius: 20, border: '1.5px dashed var(--border)',
                background: 'white', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--saffron)'; e.target.style.color = 'var(--saffron)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}>
                + {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.87rem' }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Scheme'}</Btn>
      </div>
    </div>
  )
}
