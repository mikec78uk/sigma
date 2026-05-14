import { useState, useRef, useEffect } from 'react'
import Icon from '../../components/Icon'

/**
 * variants: [{ code, description, priority }]
 * value: selected code string
 * onChange: (code) => void
 */
export default function VariantSelect({ variants, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selected = variants?.find(v => v.code === value) ?? null

  const filtered = q.trim()
    ? variants.filter(v =>
        v.code.toLowerCase().includes(q.toLowerCase()) ||
        v.description.toLowerCase().includes(q.toLowerCase())
      )
    : variants

  useEffect(() => {
    if (open) { inputRef.current?.focus() }
    else setQ('')
  }, [open])

  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function select(code) {
    onChange(code)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') setOpen(false)
  }

  const needsVariant = !value

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        className="select"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', height: 28, fontSize: 12.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left', padding: '0 8px',
          borderColor: needsVariant ? '#f59e0b' : 'var(--border)',
          background: needsVariant ? '#fffbeb' : 'var(--surface)',
        }}
      >
        <span className="mono" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.code : <span style={{ color: 'var(--ink-4)', fontFamily: 'inherit', fontSize: 12.5 }}>Select…</span>}
        </span>
        <Icon name="chevron-down" size={11} style={{ flexShrink: 0, marginLeft: 4, color: 'var(--ink-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          minWidth: 480, zIndex: 300,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '7px 10px', borderBottom: '1px solid var(--border)' }}>
            <div className="search">
              <span className="search__icon"><Icon name="search" size={13} /></span>
              <input
                ref={inputRef}
                className="input"
                placeholder="Search code or description…"
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ fontSize: 12.5 }}
              />
            </div>
          </div>

          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 64px',
            padding: '5px 12px', background: 'var(--surface-2)',
            borderBottom: '1px solid var(--border)',
          }}>
            <span className="label" style={{ fontSize: 10.5 }}>Code</span>
            <span className="label" style={{ fontSize: 10.5 }}>Description</span>
            <span className="label" style={{ fontSize: 10.5, textAlign: 'right' }}>Priority</span>
          </div>

          {/* Options */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.map(v => (
              <div
                key={v.code}
                onMouseDown={() => select(v.code)}
                style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr 64px',
                  padding: '8px 12px', cursor: 'pointer', alignItems: 'center',
                  background: value === v.code ? 'var(--surface-3)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => { if (value !== v.code) e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = value === v.code ? 'var(--surface-3)' : 'transparent' }}
              >
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: value === v.code ? 600 : 400 }}>{v.code}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink)' }}>{v.description}</span>
                <span style={{ fontSize: 12, textAlign: 'right', color: v.priority > 0 ? 'var(--ink-2)' : 'var(--ink-4)', fontWeight: v.priority > 0 ? 600 : 400 }}>{v.priority}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="muted" style={{ padding: '10px 12px', fontSize: 12.5, textAlign: 'center' }}>
                No variants match &ldquo;{q}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}

      {needsVariant && (
        <div style={{ fontSize: 10.5, color: '#92400e', marginTop: 2, whiteSpace: 'nowrap' }}>
          Variant required
        </div>
      )}
    </div>
  )
}
