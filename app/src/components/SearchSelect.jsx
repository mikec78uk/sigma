import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

/**
 * options: [{ value, label, meta? }]
 * allLabel: label shown for the empty/all option (default "All")
 */
export default function SearchSelect({ value, onChange, options, allLabel = 'All', width = 300 }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selected = options.find(o => o.value === value) ?? null

  const filtered = q.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(q.toLowerCase()) ||
        (o.meta || '').toLowerCase().includes(q.toLowerCase())
      )
    : options

  useEffect(() => {
    if (open) inputRef.current?.focus()
    else setQ('')
  }, [open])

  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function select(val) {
    onChange(val)
    setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width }}>
      {/* Trigger */}
      <button
        type="button"
        className="select"
        style={{ width: '100%', height: 34, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}
        onClick={() => setOpen(v => !v)}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? (selected.meta ? `${selected.meta} · ${selected.label}` : selected.label) : allLabel}
        </span>
        <Icon name="chevron-down" size={13} style={{ flexShrink: 0, marginLeft: 6, color: 'var(--ink-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: Math.max(width, 320),
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 200, overflow: 'hidden',
        }}>
          {/* Search input */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
            <div className="search">
              <span className="search__icon"><Icon name="search" size={14} /></span>
              <input
                ref={inputRef}
                className="input"
                placeholder="Search…"
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && setOpen(false)}
              />
            </div>
          </div>

          {/* Options list */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {/* All-clients option */}
            <div
              onClick={() => select(null)}
              style={{
                padding: '9px 12px', cursor: 'pointer', fontSize: 13.5,
                background: !value ? 'var(--surface-3)' : 'transparent',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = !value ? 'var(--surface-3)' : 'transparent'}
            >
              <span>{allLabel}</span>
              {!value && <Icon name="check" size={14} style={{ color: 'var(--ink)' }} />}
            </div>

            {filtered.map(o => (
              <div
                key={o.value}
                onClick={() => select(o.value)}
                style={{
                  padding: '9px 12px', cursor: 'pointer',
                  background: value === o.value ? 'var(--surface-3)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = value === o.value ? 'var(--surface-3)' : 'transparent'}
              >
                {o.meta && (
                  <span className="mono muted" style={{ fontSize: 11.5, flexShrink: 0 }}>{o.meta}</span>
                )}
                <span style={{ fontSize: 13.5, flex: 1 }}>{o.label}</span>
                {value === o.value && <Icon name="check" size={14} style={{ color: 'var(--ink)', flexShrink: 0 }} />}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="muted" style={{ padding: '12px', fontSize: 13, textAlign: 'center' }}>
                No matches for &ldquo;{q}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
