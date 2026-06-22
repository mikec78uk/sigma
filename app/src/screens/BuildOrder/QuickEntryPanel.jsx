import { useState, useRef, useEffect, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { fmt } from '../../utils/format'
import { ORDER_TYPES } from '../../data'
import Icon from '../../components/Icon'
import StockDot from '../../components/StockDot'
import TypeBadge from '../../components/TypeBadge'
import VariantSelect from './VariantSelect'

export default function QuickEntryPanel({
  catalogue = [],
  lines,
  addToBasket,
  setQty,
  setUnit,
  setLineDesc,
  setVariant,
  setMld,
  removeLine,
  replaceLine,
  unmatchedImport,
  onDismissUnmatched,
  oosImport,
  onDismissOos,
  insufficientImport,
  onDismissInsufficient,
  wrongRouteImport,
  onDismissWrongRoute,
  orderType = 'hospital',
  ediErrors = [],
  onStartOtherOrder,
  onFileSelect,
  onImportClick,
}) {
  // Single active search row — null | 'new' | lineId
  const [activeSearchRow, setActiveSearchRow] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [searchAllResults, setSearchAllResults] = useState([])
  const [searchCursor, setSearchCursor] = useState(-1)
  const [dropdownRect, setDropdownRect] = useState(null)

  const [showAllModal, setShowAllModal] = useState(false)
  const [modalPage, setModalPage] = useState(1)
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [openNotes, setOpenNotes] = useState({})
  const [editingUnit, setEditingUnit] = useState({})
  const [hoveredNote, setHoveredNote] = useState(null)
  const [hoveredReset, setHoveredReset] = useState(null)
  const [qtyCapped, setQtyCapped] = useState({})

  const dropFileRef = useRef(null)
  const variantRefs = useRef({})
  const qtyRefs = useRef({})
  // product input refs keyed by lineId, plus 'new' for the add row
  const productInputRefs = useRef({})
  const prevLinesRef = useRef([])

  // Auto-focus qty (or variant) when a new line is added
  useEffect(() => {
    const prevIds = new Set(prevLinesRef.current.map(l => l.lineId))
    const newVariantLine = lines.find(l => l.variants?.length > 0 && !l.variant && !prevIds.has(l.lineId))
    if (newVariantLine) {
      variantRefs.current[newVariantLine.lineId]?.focus()
    } else {
      const newLine = lines.find(l => !prevIds.has(l.lineId))
      if (newLine) {
        qtyRefs.current[newLine.lineId]?.focus()
        qtyRefs.current[newLine.lineId]?.select()
      }
    }
    prevLinesRef.current = lines
  }, [lines])

  // Filter catalogue whenever search query changes
  useEffect(() => {
    if (!activeSearchRow || !searchQ.trim()) {
      setSearchSuggestions([])
      setSearchAllResults([])
      setSearchCursor(-1)
      return
    }
    const s = searchQ.toLowerCase()
    const results = catalogue.filter(p =>
      p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
    )
    setSearchSuggestions(results.slice(0, 5))
    setSearchAllResults(results)
    setSearchCursor(-1)
    setModalPage(1)
  }, [searchQ, catalogue, activeSearchRow])

  // Track the bounding rect of the active input for the portal dropdown
  useEffect(() => {
    if (!activeSearchRow) { setDropdownRect(null); return }
    function updateRect() {
      const el = productInputRefs.current[activeSearchRow]
      if (el) setDropdownRect(el.getBoundingClientRect())
    }
    // Small delay for existing-row activations where the search input renders after state change
    const timer = setTimeout(updateRect, 10)
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [activeSearchRow])

  function activateSearch(rowId) {
    setActiveSearchRow(rowId)
    setSearchQ('')
    setSearchSuggestions([])
    setSearchCursor(-1)
  }

  function deactivateSearch() {
    setActiveSearchRow(prev => {
      if (prev) {
        setSearchQ('')
        setSearchSuggestions([])
        setDropdownRect(null)
        setSearchCursor(-1)
      }
      return null
    })
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Tab') {
      deactivateSearch()
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      deactivateSearch()
      return
    }
    if (searchSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSearchCursor(c => Math.min(c + 1, searchSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSearchCursor(c => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const pick = searchSuggestions[searchCursor >= 0 ? searchCursor : 0]
      if (pick && pick.stockState !== 'out' && !pick.exportRestricted) handleSelectProduct(pick)
    }
  }

  function handleSelectProduct(p) {
    if (!p || p.exportRestricted) return
    const rowId = activeSearchRow
    deactivateSearch()
    if (rowId === 'new') {
      addToBasket(p)
    } else if (rowId) {
      replaceLine(rowId, p)
    }
  }

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function SortCaret({ col }) {
    if (sortCol !== col) return <span style={{ marginLeft: 3, opacity: 0.28, fontSize: 9, verticalAlign: 'middle' }}>⬍</span>
    return <span style={{ marginLeft: 3, fontSize: 9, verticalAlign: 'middle', color: 'var(--ink-2)' }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
  }

  function sortedLines() {
    if (!sortCol) return lines
    const arr = [...lines]
    arr.sort((a, b) => {
      let av, bv
      switch (sortCol) {
        case 'name':     av = a.name;          bv = b.name;          break
        case 'qty':      av = a.qty;           bv = b.qty;           break
        case 'msp':      av = a.msp;           bv = b.msp;           break
        case 'discount': av = a.discount || 0; bv = b.discount || 0; break
        case 'unit':     av = a.unit;          bv = b.unit;          break
        default:         return 0
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return arr
  }

  function startEditUnit(lineId, val) {
    setEditingUnit(prev => ({ ...prev, [lineId]: (Math.round(val * 100) / 100).toFixed(2) }))
  }

  function commitUnit(l) {
    const draft = editingUnit[l.lineId]
    setEditingUnit(prev => { const { [l.lineId]: _, ...rest } = prev; return rest })
    if (draft === undefined) return
    const raw = parseFloat(draft)
    if (isNaN(raw) || raw <= 0) return
    setUnit(l.lineId, Math.round(raw * 100) / 100)
  }

  function downloadTemplate() {
    const csv = 'SKU,Product Name,Qty\nSC-04128,Amoxicillin 250mg/5ml Oral Suspension,10\nSC-07811,Paracetamol 500mg Tablets,20\nSC-04341,Clarithromycin 500mg Tablets,10\nSC-04219,Co-amoxiclav 625mg Tablets,100\n'
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'sigma-order-template.csv'
    a.click()
  }

  const hasItems = lines.length > 0
  const ediErrorSkus = new Set((ediErrors || []).map(e => e.sku))
  const hasVariantLines = lines.some(l => l.variants?.length > 0)

  const COLS = [
    { col: 'name',          label: 'Product',     right: false },
    ...(hasVariantLines ? [{ col: 'variant', label: 'Variant', right: false }] : []),
    { col: 'qty',           label: 'Qty',         right: true  },
    { col: 'listPrice',     label: 'Unit',        right: true  },
    { col: 'discount',      label: 'Disc.',       right: true  },
    { col: 'mld',           label: 'MLD',         right: true  },
    { col: 'unit',          label: 'Contract',    right: true  },
    { col: 'totalDiscount', label: 'Total Disc.', right: true  },
  ]
  const totalCols = COLS.length + 1

  // Portal dropdown — rendered at body level to escape any overflow clipping
  const dropdownPortal = searchSuggestions.length > 0 && dropdownRect && createPortal(
    <div style={{
      position: 'fixed',
      top: dropdownRect.bottom + 2,
      left: dropdownRect.left,
      minWidth: Math.max(dropdownRect.width, 420),
      zIndex: 9999,
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 8,
      boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
      overflow: 'hidden',
    }}>
      {searchSuggestions.map((p, i) => {
        const isOos = p.stockState === 'out'
        const isExportRestricted = !!p.exportRestricted
        const isBlocked = isOos || isExportRestricted
        return (
          <div
            key={p.sku}
            onMouseDown={isBlocked ? undefined : e => { e.preventDefault(); handleSelectProduct(p) }}
            onMouseEnter={() => !isBlocked && setSearchCursor(i)}
            style={{
              padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10,
              cursor: isBlocked ? 'default' : 'pointer',
              opacity: isOos ? 0.45 : 1,
              background: !isBlocked && searchCursor === i ? 'var(--surface-2)' : '#fff',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span className="mono muted" style={{ fontSize: 11.5, minWidth: 74, opacity: isExportRestricted ? 0.45 : 1 }}>{p.sku}</span>
            <span style={{ flex: 1, fontSize: 13.5, opacity: isExportRestricted ? 0.45 : 1 }}>{p.name}</span>
            {isExportRestricted ? (
              <span style={{ fontSize: 11.5, fontWeight: 500, color: '#92400e', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Not available for export
              </span>
            ) : (
              <>
                <span className="muted" style={{ fontSize: 11.5 }}>{p.pack}</span>
                <StockDot state={p.stockState} />
                {!isOos && (
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: searchCursor === i ? 'var(--ink)' : 'var(--ink-3)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    + Add
                  </span>
                )}
              </>
            )}
          </div>
        )
      })}
      {searchAllResults.length > 5 && (
        <div
          onMouseDown={e => { e.preventDefault(); setSearchSuggestions([]); setModalPage(1); setShowAllModal(true) }}
          style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--surface-2)', fontSize: 13, color: 'var(--ink-2)' }}
        >
          <span style={{ fontWeight: 500 }}>View more results</span>
          <span className="muted" style={{ fontSize: 12 }}>{searchAllResults.length} matching products <Icon name="chevron-right" size={12} /></span>
        </div>
      )}
    </div>,
    document.body
  )

  return (
    <>
    <div className="panel" style={{ flex: 1, minWidth: 0 }}>
      <div className="panel__head">
        <div>
          <h3 style={{ fontSize: 18 }}>Create order</h3>
        </div>
        <div className="row gap-8" style={{ alignItems: 'center' }}>
          <TypeBadge type={orderType ?? 'hospital'} style={{ fontSize: 11.5, padding: '2px 8px' }} />
          <span className="badge badge--draft">Draft</span>
        </div>
      </div>

      {/* Wrong route banner */}
      {wrongRouteImport?.length > 0 && (() => {
        const otherType = ORDER_TYPES.find(t => t.id !== orderType)
        const currentType = ORDER_TYPES.find(t => t.id === orderType)
        return (
          <div style={{ margin: '12px 16px 12px', border: '1px solid #bae6fd', borderRadius: 8, overflow: 'hidden', background: '#f0f9ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icon name="info" size={13} style={{ color: '#0369a1', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0c4a6e' }}>
                  Available via {otherType?.short ?? 'another route'}, not {currentType?.short ?? 'this route'}
                </span>
              </div>
              <button onClick={onDismissWrongRoute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7dd3fc', padding: 2 }}>
                <Icon name="x" size={14} />
              </button>
            </div>
            <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {wrongRouteImport.map((r, i) => (
                <span key={i} className="mono" style={{ fontSize: 11.5, background: 'rgba(186,230,253,0.3)', border: '1px solid #bae6fd', borderRadius: 4, padding: '1px 6px', color: '#0369a1' }}>
                  {r.row != null && <span style={{ opacity: 0.6, marginRight: 4 }}>row {r.row}</span>}
                  {r.sku}
                </span>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Combined import issues banner */}
      {(oosImport?.length > 0 || insufficientImport?.length > 0 || unmatchedImport?.length > 0) && (
        <div style={{ margin: '12px 16px 12px', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>
              {(oosImport?.length || 0) + (insufficientImport?.length || 0) + (unmatchedImport?.length || 0)} {((oosImport?.length || 0) + (insufficientImport?.length || 0) + (unmatchedImport?.length || 0)) === 1 ? 'item' : 'items'} from your spreadsheet could not be added
            </span>
            <button onClick={() => { onDismissOos?.(); onDismissInsufficient?.(); onDismissUnmatched?.() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2, flexShrink: 0 }}>
              <Icon name="x" size={14} />
            </button>
          </div>
          {(oosImport?.length > 0 || insufficientImport?.length > 0) && (
            <div style={{ padding: '10px 12px', background: '#fff5f5', borderBottom: unmatchedImport?.length > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="alert" size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#991b1b', marginBottom: 4 }}>Insufficient stock — not added</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[...(oosImport || []), ...(insufficientImport || [])].map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span className="mono" style={{ fontSize: 11.5, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 4, padding: '1px 6px', color: '#991b1b', flexShrink: 0 }}>{r.sku}</span>
                        <span style={{ fontSize: 12.5, color: '#991b1b', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.product?.name}</span>
                        <span style={{ fontSize: 11.5, color: '#991b1b', opacity: 0.8, flexShrink: 0 }}>Requested: {r.qty} · Available: {r.available ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {unmatchedImport?.length > 0 && (
            <div style={{ padding: '10px 12px', background: '#fefce8' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="alert" size={13} style={{ color: '#92400e', flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>SKU not recognised — check for typos</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {unmatchedImport.map((r, i) => (
                      <span key={i} className="mono" style={{ fontSize: 11.5, background: 'rgba(252,211,77,0.2)', border: '1px solid #fde68a', borderRadius: 4, padding: '1px 6px', color: '#78350f' }}>
                        {r.row != null && <span style={{ opacity: 0.6, marginRight: 4 }}>row {r.row}</span>}
                        {r.sku}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="panel__body panel__body--flush" style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ minWidth: 860 }}>
          <thead>
            <tr>
              {COLS.map(({ col, label, right }) => (
                <th key={col} className={right ? 'right' : ''} onClick={() => toggleSort(col)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  {label}<SortCaret col={col} />
                </th>
              ))}
              <th style={{ width: 68 }} />
            </tr>
          </thead>
          <tbody>
            {sortedLines().map(l => {
              const isActive = activeSearchRow === l.lineId
              const noteOpen = openNotes[l.lineId]
              const unitDraft = editingUnit[l.lineId]
              const displayUnit = unitDraft !== undefined ? unitDraft : (Math.round(l.unit * 100) / 100).toFixed(2)
              const isOos = l.stockState === 'out'
              const hasMld = l.mld !== '' && !isNaN(parseFloat(l.mld)) && parseFloat(l.mld) > 0
              const hasEdiError = ediErrorSkus.has(l.sku)
              return (
                <Fragment key={l.lineId}>
                  <tr style={hasEdiError ? { background: 'rgba(251,146,60,0.08)' } : isOos ? { background: 'rgba(239,68,68,0.04)' } : hasMld ? { background: 'rgba(16,185,129,0.06)' } : {}}>

                    {/* Combined Product column */}
                    <td style={{ minWidth: 220, maxWidth: 300 }}>
                      <input
                        ref={el => { productInputRefs.current[l.lineId] = el }}
                        className="input"
                        value={isActive ? searchQ : l.name}
                        placeholder="Search for a product…"
                        onChange={e => {
                          if (!isActive) activateSearch(l.lineId)
                          setSearchQ(e.target.value)
                        }}
                        onFocus={() => {
                          if (!isActive) setTimeout(() => productInputRefs.current[l.lineId]?.select(), 0)
                        }}
                        onKeyDown={e => {
                          if (!isActive && e.key !== 'Tab') activateSearch(l.lineId)
                          handleSearchKeyDown(e)
                        }}
                        onBlur={() => {
                          if (isActive) setTimeout(() => { if (activeSearchRow === l.lineId) deactivateSearch() }, 150)
                        }}
                        style={{ width: '100%', fontSize: 13 }}
                      />
                      {hasEdiError && !isActive && (
                        <div style={{ fontSize: 11, color: '#c2410c', marginTop: 2, whiteSpace: 'nowrap' }}>⚠ EDI price mismatch — verify unit price</div>
                      )}
                      {isOos && !isActive && (
                        <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2, whiteSpace: 'nowrap' }}>⚠ Out of stock — fulfilment not guaranteed</div>
                      )}
                    </td>

                    {/* Variant */}
                    {hasVariantLines && (
                      <td style={{ minWidth: 130 }}>
                        {l.variants?.length > 0 ? (
                          <VariantSelect
                            ref={el => { variantRefs.current[l.lineId] = el }}
                            variants={l.variants}
                            value={l.variant || ''}
                            onChange={code => setVariant(l.lineId, code)}
                          />
                        ) : (
                          <span className="muted" style={{ fontSize: 12 }}>—</span>
                        )}
                      </td>
                    )}

                    {/* Qty */}
                    <td className="right" style={{ minWidth: 60 }}>
                      <input
                        ref={el => { qtyRefs.current[l.lineId] = el }}
                        className="input"
                        type="number"
                        min="1"
                        style={{ width: 50, textAlign: 'right', fontSize: 12.5, padding: '3px 6px', borderColor: qtyCapped[l.lineId] ? '#dc2626' : undefined }}
                        value={l.qty}
                        onChange={e => {
                          const v = parseInt(e.target.value, 10)
                          if (!isNaN(v) && v > 0) {
                            const maxStock = l.stock
                            if (maxStock != null && maxStock > 0 && v > maxStock) {
                              setQty(l.lineId, maxStock)
                              setQtyCapped(prev => ({ ...prev, [l.lineId]: maxStock }))
                            } else {
                              setQty(l.lineId, v)
                              setQtyCapped(prev => { const { [l.lineId]: _, ...rest } = prev; return rest })
                            }
                          }
                        }}
                      />
                      {qtyCapped[l.lineId] != null && (
                        <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2, whiteSpace: 'nowrap' }}>Only {qtyCapped[l.lineId]} in stock</div>
                      )}
                    </td>

                    {/* Unit Price */}
                    <td className="right mono tnum" style={{ fontSize: 12.5 }}>{fmt(l.listPrice || l.msp)}</td>

                    {/* Disc. */}
                    <td className="right mono tnum" style={{ fontSize: 12.5, color: l.discount > 0 ? '#059669' : 'var(--ink-3)' }}>
                      {l.discount > 0 ? `${l.discount}%` : '—'}
                    </td>

                    {/* MLD */}
                    <td className="right" style={{ minWidth: 80 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="—"
                          style={{ width: 52, textAlign: 'right', fontSize: 12.5, padding: '3px 6px' }}
                          value={l.mld ?? ''}
                          onChange={e => {
                            const raw = e.target.value
                            if (raw === '') { setMld(l.lineId, ''); return }
                            const v = parseFloat(raw)
                            if (!isNaN(v) && v >= 0 && v <= 100) setMld(l.lineId, raw)
                          }}
                          onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setMld(l.lineId, (Math.round(v * 10) / 10).toString()) }}
                        />
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>%</span>
                      </div>
                    </td>

                    {/* Contract — editable unit price */}
                    {(() => {
                      const mldPct = parseFloat(l.mld) || 0
                      const calculatedUnit = Math.round((l.listPrice || l.msp) * (1 - ((l.discount || 0) + mldPct) / 100) * 100) / 100
                      const liveVal = unitDraft !== undefined ? parseFloat(unitDraft) : l.unit
                      const unitChanged = Math.abs((isNaN(liveVal) ? l.unit : liveVal) - calculatedUnit) > 0.001
                      return (
                        <td className="right" style={{ minWidth: 100 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>£</span>
                            <input
                              className="input"
                              style={{ width: 64, textAlign: 'right', fontSize: 12.5, padding: '3px 6px' }}
                              value={displayUnit}
                              onChange={e => setEditingUnit(prev => ({ ...prev, [l.lineId]: e.target.value }))}
                              onFocus={() => startEditUnit(l.lineId, l.unit)}
                              onBlur={() => commitUnit(l)}
                            />
                            {unitChanged && (
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                <button
                                  onMouseDown={e => { e.preventDefault(); setUnit(l.lineId, calculatedUnit); setEditingUnit(prev => { const { [l.lineId]: _, ...rest } = prev; return rest }); setHoveredReset(null) }}
                                  onMouseEnter={() => setHoveredReset(l.lineId)}
                                  onMouseLeave={() => setHoveredReset(null)}
                                  style={{ background: 'none', border: 'none', padding: '2px 3px', cursor: 'pointer', color: hoveredReset === l.lineId ? 'var(--ink)' : 'var(--ink-3)', lineHeight: 1, display: 'flex', alignItems: 'center' }}
                                >
                                  <Icon name="undo" size={13} />
                                </button>
                                {hoveredReset === l.lineId && (
                                  <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, zIndex: 300, background: 'var(--ink)', color: '#fff', fontSize: 12, lineHeight: 1.4, padding: '5px 9px', borderRadius: 6, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', pointerEvents: 'none' }}>
                                    Reset to {fmt(calculatedUnit)}
                                    <div style={{ position: 'absolute', top: '100%', right: 8, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--ink)' }} />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })()}

                    {/* Total Disc. */}
                    {(() => {
                      const base = l.listPrice || l.msp
                      const mldPct = parseFloat(l.mld) || 0
                      const totalDiscPct = (l.discount || 0) + mldPct
                      const calculatedUnit = Math.round(base * (1 - totalDiscPct / 100) * 100) / 100
                      const isManualOverride = Math.abs(l.unit - calculatedUnit) > 0.005
                      const showWarning = isManualOverride && l.unit < base
                      const displayPct = isManualOverride
                        ? (base > 0 ? Math.ceil((1 - l.unit / base) * 100) : 0)
                        : Math.round(totalDiscPct * 10) / 10
                      return (
                        <td className="right" style={{ fontSize: 12.5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                            {showWarning && <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center' }}><Icon name="alert" size={12} /></span>}
                            <span className="mono tnum" style={{ color: displayPct > 0 ? (showWarning ? '#dc2626' : '#059669') : 'var(--ink-3)' }}>
                              {displayPct > 0 ? `${displayPct}%` : '—'}
                            </span>
                          </div>
                        </td>
                      )
                    })()}

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <div style={{ position: 'relative' }}>
                          <button
                            className="btn btn--ghost btn--icon btn--sm"
                            style={{ color: l.description ? 'var(--ink)' : noteOpen ? 'var(--ink-2)' : 'var(--ink-3)', background: l.description && !noteOpen ? 'var(--surface-2)' : undefined, borderColor: l.description && !noteOpen ? 'var(--border)' : undefined }}
                            onClick={() => setOpenNotes(n => ({ ...n, [l.lineId]: !n[l.lineId] }))}
                            onMouseEnter={() => l.description && !noteOpen && setHoveredNote(l.lineId)}
                            onMouseLeave={() => setHoveredNote(null)}
                          >
                            <Icon name="edit" size={13} />
                            {l.description && !noteOpen && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-2)', flexShrink: 0 }} />}
                          </button>
                          {hoveredNote === l.lineId && l.description && (
                            <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, zIndex: 300, background: 'var(--ink)', color: '#fff', fontSize: 12, lineHeight: 1.4, padding: '6px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', maxWidth: 260, minWidth: 120, wordBreak: 'break-word', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', pointerEvents: 'none' }}>
                              {l.description}
                              <div style={{ position: 'absolute', top: '100%', right: 10, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--ink)' }} />
                            </div>
                          )}
                        </div>
                        <button className="btn btn--ghost btn--icon btn--sm" title="Remove line" style={{ color: 'var(--ink-3)' }} onClick={() => removeLine(l.lineId)}>
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Line note row */}
                  {noteOpen && (
                    <tr key={l.lineId + '-note'}>
                      <td colSpan={totalCols} style={{ paddingTop: 0, paddingBottom: 10, background: 'var(--surface)' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              className="input"
                              placeholder="Line note…"
                              value={l.description || ''}
                              onChange={e => setLineDesc(l.lineId, e.target.value)}
                              style={{ fontSize: 12.5, width: '100%', paddingRight: l.description ? 28 : undefined }}
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Enter') setOpenNotes(n => ({ ...n, [l.lineId]: false })) }}
                            />
                            {l.description && (
                              <button
                                onMouseDown={e => { e.preventDefault(); setLineDesc(l.lineId, '') }}
                                style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2, lineHeight: 1, display: 'flex' }}
                              >
                                <Icon name="x" size={12} />
                              </button>
                            )}
                          </div>
                          <button className="btn btn--sm btn--primary" onClick={() => setOpenNotes(n => ({ ...n, [l.lineId]: false }))}>Save note</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {/* Add row — looks like a new empty table row; search input sits in the Product column */}
            <tr>
              <td style={{ minWidth: 220, maxWidth: 300, padding: '6px 8px' }}>
                <input
                  ref={el => { productInputRefs.current['new'] = el }}
                  className="input"
                  placeholder="Search by product name or SKU code…"
                  value={activeSearchRow === 'new' ? searchQ : ''}
                  onFocus={() => { if (activeSearchRow !== 'new') activateSearch('new') }}
                  onChange={e => { if (activeSearchRow !== 'new') activateSearch('new'); setSearchQ(e.target.value) }}
                  onKeyDown={e => { if (activeSearchRow !== 'new') activateSearch('new'); handleSearchKeyDown(e) }}
                  onBlur={() => { if (activeSearchRow === 'new') setTimeout(() => { if (activeSearchRow === 'new') deactivateSearch() }, 150) }}
                  autoFocus={!hasItems}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </td>
              {Array.from({ length: totalCols - 1 }).map((_, i) => <td key={i} />)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Blank state — upload option when no items yet */}
      {!hasItems && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0', color: 'var(--ink-3)', fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span>or upload a spreadsheet</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <input
            ref={dropFileRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) onFileSelect(e.target.files[0]); e.target.value = '' }}
          />
          <div
            onClick={() => dropFileRef.current?.click()}
            style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '28px 24px', textAlign: 'center', cursor: 'pointer', background: 'var(--surface)', transition: 'border-color 0.15s, background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink-3)'; e.currentTarget.style.background = 'var(--surface-2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
          >
            <Icon name="doc" size={28} style={{ color: 'var(--ink-3)', marginBottom: 10 }} />
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Upload a spreadsheet to populate the order</div>
            <div className="muted" style={{ fontSize: 13 }}>Drop a .csv file here, or click to browse</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <button className="btn btn--sm btn--ghost" onClick={downloadTemplate} style={{ fontSize: 12, color: 'var(--ink-3)', gap: 5 }}>
              <Icon name="download" size={12} /> Download order template
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Dropdown portal — escapes overflow clipping */}
    {dropdownPortal}

    {/* All results modal */}
    {showAllModal && (() => {
      const modalPageSize = 10
      const modalTotalPages = Math.max(1, Math.ceil(searchAllResults.length / modalPageSize))
      const modalPaged = searchAllResults.slice((modalPage - 1) * modalPageSize, modalPage * modalPageSize)

      function pageNumbers() {
        if (modalTotalPages <= 7) return Array.from({ length: modalTotalPages }, (_, i) => i + 1)
        const pages = [1]
        if (modalPage > 3) pages.push('…')
        for (let i = Math.max(2, modalPage - 1); i <= Math.min(modalTotalPages - 1, modalPage + 1); i++) pages.push(i)
        if (modalPage < modalTotalPages - 2) pages.push('…')
        pages.push(modalTotalPages)
        return pages
      }

      return (
        <div className="scrim">
          <div className="modal" style={{ maxWidth: 860, display: 'flex', flexDirection: 'column' }}>
            <div className="modal__head">
              <div className="row between">
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>Search results</div>
                  <h2 style={{ fontSize: 18 }}>{searchAllResults.length} matching {searchAllResults.length === 1 ? 'item' : 'items'}</h2>
                </div>
                <button className="btn btn--ghost btn--icon" onClick={() => setShowAllModal(false)}><Icon name="x" size={16} /></button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', height: 580 }}>
              {modalPaged.map(p => {
                const isOos = p.stockState === 'out'
                const isExportRestricted = !!p.exportRestricted
                const isBlocked = isOos || isExportRestricted
                return (
                  <div key={p.sku} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', opacity: isBlocked ? 0.5 : 1 }}>
                    <span className="mono muted" style={{ fontSize: 11.5, minWidth: 74, flexShrink: 0 }}>{p.sku}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5 }}>{p.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{p.pack}</div>
                    </div>
                    <StockDot state={p.stockState} />
                    {isExportRestricted ? (
                      <span style={{ fontSize: 11.5, color: '#92400e', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap' }}>Not available for export</span>
                    ) : (
                      <button className="btn btn--sm btn--primary" disabled={isOos} onClick={() => { handleSelectProduct(p); setShowAllModal(false) }}>+ Add</button>
                    )}
                  </div>
                )
              })}
            </div>
            {modalTotalPages > 1 && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'var(--surface-2)', flexShrink: 0 }}>
                <button className="btn btn--sm" disabled={modalPage === 1} onClick={() => setModalPage(p => p - 1)}><Icon name="arrow-left" size={13} /> Previous</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {pageNumbers().map((n, i) =>
                    n === '…'
                      ? <span key={'e' + i} style={{ padding: '0 4px', fontSize: 13, color: 'var(--ink-3)' }}>…</span>
                      : <button key={n} className={'btn btn--sm' + (n === modalPage ? ' btn--primary' : '')} style={{ minWidth: 32, padding: '0 8px' }} onClick={() => setModalPage(n)}>{n}</button>
                  )}
                </div>
                <button className="btn btn--sm" disabled={modalPage === modalTotalPages} onClick={() => setModalPage(p => p + 1)}>Next <Icon name="arrow-right" size={13} /></button>
              </div>
            )}
          </div>
        </div>
      )
    })()}
    </>
  )
}
