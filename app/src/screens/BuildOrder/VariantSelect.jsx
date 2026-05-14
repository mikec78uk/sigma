import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../../components/Icon'

/**
 * variants: [{ code, description, priority }]
 * value: selected code string
 * onChange: (code) => void
 */
const VariantSelect = forwardRef(function VariantSelect({ variants, value, onChange }, ref) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const optionRefs = useRef([])
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const triggerRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focus() {
      triggerRef.current?.click()
    }
  }))

  const selected = variants?.find(v => v.code === value) ?? null

  const filtered = q.trim()
    ? variants.filter(v =>
        v.code.toLowerCase().includes(q.toLowerCase()) ||
        v.description.toLowerCase().includes(q.toLowerCase())
      )
    : variants

  // Calculate portal position from trigger rect
  function openDropdown() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      setDropdownPos({
        top: rect.bottom + 4 + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    setOpen(true)
  }

  useEffect(() => {
    if (open) {
      setCursor(0)
      inputRef.current?.focus()
    } else {
      setQ('')
    }
  }, [open])

  // Reset cursor when filtered list changes
  useEffect(() => {
    setCursor(0)
  }, [q])

  // Scroll highlighted option into view
  useEffect(() => {
    optionRefs.current[cursor]?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  useEffect(() => {
    function onMouseDown(e) {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        !document.getElementById('variant-dropdown-portal')?.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function select(code) {
    onChange(code)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor(c => Math.min(c + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor(c => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[cursor]) select(filtered[cursor].code)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const needsVariant = !value

  const dropdown = open && createPortal(
    <div
      id="variant-dropdown-portal"
      style={{
        position: 'absolute',
        top: dropdownPos.top,
        left: dropdownPos.left,
        minWidth: 480,
        zIndex: 9999,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden',
      }}
    >
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
        {filtered.map((v, i) => {
          const isActive = i === cursor
          const isSelected = v.code === value
          return (
            <div
              key={v.code}
              ref={el => { optionRefs.current[i] = el }}
              onMouseDown={() => select(v.code)}
              onMouseEnter={() => setCursor(i)}
              style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 64px',
                padding: '8px 12px', cursor: 'pointer', alignItems: 'center',
                background: isSelected ? 'var(--surface-3)' : isActive ? 'var(--surface-2)' : 'transparent',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: isSelected ? 600 : 400 }}>{v.code}</span>
              <span style={{ fontSize: 12.5, color: 'var(--ink)' }}>{v.description}</span>
              <span style={{ fontSize: 12, textAlign: 'right', color: v.priority > 0 ? 'var(--ink-2)' : 'var(--ink-4)', fontWeight: v.priority > 0 ? 600 : 400 }}>{v.priority}</span>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="muted" style={{ padding: '10px 12px', fontSize: 12.5, textAlign: 'center' }}>
            No variants match &ldquo;{q}&rdquo;
          </div>
        )}
      </div>
    </div>,
    document.body
  )

  return (
    <div ref={containerRef}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className="select"
        onClick={() => open ? setOpen(false) : openDropdown()}
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

      {dropdown}

      {needsVariant && (
        <div style={{ fontSize: 10.5, color: '#92400e', marginTop: 2, whiteSpace: 'nowrap' }}>
          Variant required
        </div>
      )}
    </div>
  )
})

export default VariantSelect
