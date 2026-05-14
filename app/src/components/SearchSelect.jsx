import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

/**
 * options: [{ value, label, meta?, sub? }]
 * allLabel: label shown for the empty/all option (default "All")
 */
export default function SearchSelect({ value, onChange, options, allLabel = 'All', width = 300 }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(-1) // -1 = "All" row, 0..n = filtered options
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const selected = options.find(o => o.value === value) ?? null

  const filtered = q.trim()
    ? options.filter(o => {
        const s = q.toLowerCase()
        return o.label.toLowerCase().includes(s) ||
          (o.meta || '').toLowerCase().includes(s) ||
          (o.sub || '').toLowerCase().includes(s)
      })
    : options

  useEffect(() => {
    if (open) { inputRef.current?.focus(); setCursor(-1) }
    else setQ('')
  }, [open])

  // Reset cursor when search changes
  useEffect(() => { setCursor(-1) }, [q])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return
    const idx = cursor + 1 // +1 because "All" is first child
    const item = listRef.current.children[idx]
    item?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

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

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    const total = filtered.length // "All" is index -1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor(c => Math.min(c + 1, total - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor(c => Math.max(c - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (cursor === -1) select(null)
      else if (filtered[cursor]) select(filtered[cursor].value)
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width }}>
      {/* Trigger */}
      <button
        type="button"
        className="select"
        style={{ width: '100%', height: 34, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}
        onClick={() => setOpen(v => !v)}
        onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Options list */}
          <div ref={listRef} style={{ maxHeight: 280, overflowY: 'auto' }}>
            {/* All option */}
            <div
              onClick={() => select(null)}
              style={{
                padding: '9px 12px', cursor: 'pointer', fontSize: 13.5,
                background: cursor === -1 ? 'var(--surface-2)' : (!value ? 'var(--surface-3)' : 'transparent'),
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
              onMouseEnter={() => setCursor(-1)}
            >
              <span>{allLabel}</span>
              {!value && <Icon name="check" size={14} style={{ color: 'var(--ink)' }} />}
            </div>

            {filtered.map((o, i) => (
              <div
                key={o.value}
                onClick={() => select(o.value)}
                style={{
                  padding: '9px 12px', cursor: 'pointer',
                  background: cursor === i ? 'var(--surface-2)' : (value === o.value ? 'var(--surface-3)' : 'transparent'),
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
                onMouseEnter={() => setCursor(i)}
              >
                {o.meta && (
                  <span className="mono muted" style={{ fontSize: 11.5, flexShrink: 0 }}>{o.meta}</span>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5 }}>{o.label}</div>
                  {o.sub && <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{o.sub}</div>}
                </div>
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
