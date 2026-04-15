// Shared UI components

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style = {} }) {
  const base = {
    border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
    transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: size === 'sm' ? '0.8rem' : '0.9rem',
    padding: size === 'sm' ? '5px 12px' : '9px 18px',
  }
  const variants = {
    primary: { background: 'var(--navy)', color: 'white' },
    danger:  { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid #fca5a5' },
    ghost:   { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' },
    success: { background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid #86efac' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

// onKeyDown prop added so Login can submit on Enter
export function Input({ label, value, onChange, type = 'text', placeholder, required, style = {}, onKeyDown }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}{required && ' *'}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        onKeyDown={onKeyDown}
        style={{
          padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
          fontSize: '0.93rem', outline: 'none', transition: 'border-color 0.15s', background: 'white', ...style,
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}

export function Select({ label, value, onChange, options, required, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}{required && ' *'}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
          fontSize: '0.93rem', outline: 'none', background: 'white', cursor: 'pointer', ...style,
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function Textarea({ label, value, onChange, placeholder, rows = 4, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}{required && ' *'}
        </label>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        style={{
          padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
          fontSize: '0.93rem', outline: 'none', resize: 'vertical', background: 'white', transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', ...style }}>
      {children}
    </div>
  )
}

export function Badge({ children, color = 'navy' }) {
  const colors = {
    navy:    { bg: 'rgba(15,32,68,0.08)',   text: 'var(--navy)' },
    saffron: { bg: 'rgba(232,131,42,0.12)', text: 'var(--saffron)' },
    green:   { bg: 'var(--success-bg)',     text: 'var(--success)' },
    red:     { bg: 'var(--danger-bg)',      text: 'var(--danger)' },
    gray:    { bg: '#f1f5f9',               text: 'var(--text-muted)' },
  }
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
      background: colors[color].bg, color: colors[color].text,
      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

export function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: '2.5px solid var(--border)',
      borderTopColor: 'var(--navy)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  )
}

// Error toasts have no auto-dismiss — must be closed manually
export function Toast({ message, type = 'success', onClose }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'success' ? 'var(--success)' : 'var(--danger)',
      color: 'white', padding: '12px 20px', borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: 10,
      fontSize: '0.9rem', fontWeight: 500, animation: 'fadeIn 0.2s ease',
      maxWidth: 360,
    }}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', marginLeft: 8, cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
    </div>
  )
}

export function Modal({ title, onClose, children, width = 600 }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,32,68,0.5)', backdropFilter: 'blur(3px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white', borderRadius: 'var(--radius)', width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
