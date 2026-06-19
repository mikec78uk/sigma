import { useState, useRef, useEffect, useMemo } from 'react'
import { fmt } from '../../utils/format'
import { CATALOGUE, ORDER_TYPES } from '../../data'
import Icon from '../../components/Icon'

const PAGE_SIZE = 10

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { rows: [], error: 'File appears to be empty.' }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))

  const skuCol = header.findIndex(h =>
    h.includes('sku') || h.includes('product code') || h.includes('item code') || h === 'code'
  )
  const qtyCol = header.findIndex(h =>
    h.includes('qty') || h.includes('quantity') || h.includes('units') || h.includes('amount')
  )

  if (skuCol === -1 || qtyCol === -1) {
    return {
      rows: [],
      error: `Could not detect required columns. Found: "${header.join('", "')}". Expected a SKU/Code column and a Qty/Quantity column.`,
    }
  }

  const rows = lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.trim().replace(/"/g, ''))
    return { sku: cols[skuCol] || '', qty: Math.max(0, parseInt(cols[qtyCol], 10) || 0), row: i + 2 }
  }).filter(r => r.sku && r.qty > 0)

  return { rows, error: null }
}

const REASON_STYLES = {
  oos:        { bg: '#fff5f5', color: '#991b1b', border: '#fecaca' },
  wrongRoute: { bg: '#f0f9ff', color: '#0c4a6e', border: '#bae6fd' },
  unmatched:  { bg: '#fefce8', color: '#78350f', border: '#fef08a' },
}

function ReasonBadge({ type, label }) {
  const s = REASON_STYLES[type]
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: 4,
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {label}
    </span>
  )
}

export default function SpreadsheetImportModal({ catalogue = [], orderType = 'hospital', onImport, onClose, initialFile }) {
  const [step, setStep] = useState('upload') // 'upload' | 'preview'
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState(null)
  const [matched, setMatched] = useState([])
  const [unmatched, setUnmatched] = useState([])
  const [outOfStock, setOutOfStock] = useState([])
  const [wrongRoute, setWrongRoute] = useState([])
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const inputRef = useRef(null)

  const otherCatalogue = orderType === 'nrt' ? CATALOGUE : []

  useEffect(() => {
    if (initialFile) processFile(initialFile)
  }, [])

  function processFile(file) {
    if (!file) return
    setFileName(file.name)
    setParseError(null)

    const reader = new FileReader()
    reader.onload = e => {
      const { rows, error } = parseCSV(e.target.result)
      if (error) { setParseError(error); return }

      const matchedRows = [], unmatchedRows = [], oosRows = [], wrongRouteRows = []

      rows.forEach(r => {
        const product = catalogue.find(p => p.sku.toLowerCase() === r.sku.toLowerCase())
        if (!product) {
          const otherProduct = otherCatalogue.find(p => p.sku.toLowerCase() === r.sku.toLowerCase())
          if (otherProduct) wrongRouteRows.push({ ...r, product: otherProduct })
          else unmatchedRows.push(r)
        } else if (product.stockState === 'out' || product.stock < r.qty) {
          oosRows.push({ ...r, product, available: product.stock })
        } else {
          matchedRows.push({ ...r, product })
        }
      })

      // Bypass preview when all lines are cleanly matched
      if (matchedRows.length > 0 && unmatchedRows.length === 0 && oosRows.length === 0 && wrongRouteRows.length === 0) {
        onImport(matchedRows.map(r => ({ product: r.product, qty: r.qty })), [], [])
        onClose()
        return
      }

      setMatched(matchedRows)
      setUnmatched(unmatchedRows)
      setOutOfStock(oosRows)
      setWrongRoute(wrongRouteRows)
      setSearch('')
      setPage(1)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  function handleFileInput(e) { processFile(e.target.files[0]) }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  function downloadTemplate() {
    const csv = 'SKU,Product Name,Qty\nSC-04128,Amoxicillin 250mg/5ml Oral Suspension,10\nSC-07811,Paracetamol 500mg Tablets,20\nSC-04341,Clarithromycin 500mg Tablets,10\nSC-04219,Co-amoxiclav 625mg Tablets,100\n'
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'sigma-order-template.csv'
    a.click()
  }

  function handleConfirm() {
    onImport(matched.map(r => ({ product: r.product, qty: r.qty })), unmatched, outOfStock)
    onClose()
  }

  const estimatedTotal = matched.reduce((s, r) => s + (r.product.listPrice ?? r.product.msp) * r.qty, 0)

  const wrongRouteLabel = orderType === 'nrt' ? 'Non-NRT item' : 'Non-hospital item'

  // Combined problem rows, sorted by original row number
  const allProblems = useMemo(() => [
    ...outOfStock.map(r => ({ ...r, issueType: 'oos' })),
    ...wrongRoute.map(r => ({ ...r, issueType: 'wrongRoute' })),
    ...unmatched.map(r => ({ ...r, issueType: 'unmatched' })),
  ].sort((a, b) => (a.row ?? 0) - (b.row ?? 0)), [outOfStock, wrongRoute, unmatched])

  // Filter + paginate
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allProblems
    return allProblems.filter(r => r.sku.toLowerCase().includes(q))
  }, [allProblems, search])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const clampedPage = Math.min(page, totalPages)
  const pageRows = filteredRows.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE)

  function pageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = [1]
    if (clampedPage > 3) pages.push('…')
    for (let i = Math.max(2, clampedPage - 1); i <= Math.min(totalPages - 1, clampedPage + 1); i++) pages.push(i)
    if (clampedPage < totalPages - 2) pages.push('…')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="panel" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div className="panel__head" style={{ padding: 0, background: step === 'preview' ? '#fff5f5' : undefined, borderBottom: step === 'preview' ? '1px solid #fecaca' : undefined }}>
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: step === 'preview' ? '18px 0' : '14px 0' }}>

          {step === 'upload' ? (
            <>
              <div>
                <div className="label" style={{ marginBottom: 4 }}>Import spreadsheet</div>
                <h3 style={{ fontSize: 18 }}>Upload spreadsheet</h3>
              </div>
              <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                <Icon name="alert" size={24} style={{ color: '#991b1b', flexShrink: 0, alignSelf: 'center' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 3 }}>There was an issue with your upload</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                    {matched.length > 0
                      ? <>We matched <b style={{ color: 'var(--ink-2)' }}>{matched.length} {matched.length === 1 ? 'product line' : 'product lines'}</b>, but identified <b style={{ color: 'var(--ink-2)' }}>{allProblems.length} {allProblems.length === 1 ? 'product line' : 'product lines'}</b> with issues</>
                      : 'None of the items in this file could be matched'}
                  </div>
                </div>
              </div>
              <div className="row gap-8">
                <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
                <button className="btn btn--primary" disabled={matched.length === 0} onClick={handleConfirm}>
                  Add {matched.length} matching {matched.length === 1 ? 'line' : 'lines'} to order <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Upload step */}
          {step === 'upload' && (
            <div className="col gap-16">
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--ink-3)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '40px 24px', textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'var(--surface-2)' : 'var(--surface)',
                  transition: 'all 0.15s',
                }}
              >
                <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileInput} />
                <Icon name="doc" size={28} style={{ color: 'var(--ink-3)', marginBottom: 12 }} />
                <div style={{ fontWeight: 500, marginBottom: 6 }}>Drop a CSV file here, or click to browse</div>
                <div className="muted" style={{ fontSize: 13 }}>Accepts .csv files exported from Excel or other systems</div>
              </div>

              {parseError && (
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#92400e' }}>
                  <b>Could not read file —</b> {parseError}
                </div>
              )}

              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                <div className="label" style={{ marginBottom: 8 }}>Expected column format</div>
                <table className="tbl" style={{ fontSize: 12.5 }}>
                  <thead><tr><th>SKU</th><th>Qty</th></tr></thead>
                  <tbody>
                    <tr><td className="mono">SC-04128</td><td className="mono">10</td></tr>
                    <tr><td className="mono">SC-04227</td><td className="mono">4</td></tr>
                  </tbody>
                </table>
                <div className="row between" style={{ alignItems: 'center', marginTop: 10 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Column headers are flexible — any column containing "SKU", "Code", "Qty" or "Quantity" will be detected automatically.
                  </div>
                  <button className="btn btn--sm btn--ghost" onClick={downloadTemplate} style={{ fontSize: 12, color: 'var(--ink-3)', gap: 5, flexShrink: 0, marginLeft: 12 }}>
                    <Icon name="download" size={12} /> Download example file
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview step */}
          {step === 'preview' && (
            <div className="col gap-0">

              {/* Search + count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                  <b style={{ color: 'var(--ink-2)' }}>{allProblems.length}</b> {allProblems.length === 1 ? 'line' : 'lines'} with issues
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search by product code…"
                  className="input"
                  style={{ width: 240, fontSize: 13 }}
                />
              </div>

              {/* Unified problems table */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface)' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>Row</th>
                      <th style={{ width: 110, textAlign: 'left' }}>SKU</th>
                      <th>Product</th>
                      <th style={{ width: 160 }}>Reason</th>
                      <th className="right" style={{ width: 60 }}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-3)', fontSize: 13 }}>
                          No results match your search.
                        </td>
                      </tr>
                    )}
                    {pageRows.map((r, i) => (
                      <tr key={i}>
                        <td className="mono muted" style={{ fontSize: 12 }}>{r.row ?? '—'}</td>
                        <td className="mono" style={{ fontSize: 12 }}>{r.sku}</td>
                        <td>
                          {r.product ? (
                            <>
                              <div style={{ fontSize: 13 }}>{r.product.name}</div>
                              <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{r.product.pack}</div>
                            </>
                          ) : (
                            <span className="muted" style={{ fontSize: 13 }}>—</span>
                          )}
                        </td>
                        <td>
                          <ReasonBadge
                            type={r.issueType}
                            label={
                              r.issueType === 'oos' ? 'Insufficient stock'
                              : r.issueType === 'wrongRoute' ? wrongRouteLabel
                              : 'Unrecognised code'
                            }
                          />
                        </td>
                        <td className="right mono tnum">{r.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 12 }}>
                  <button
                    className="btn btn--sm btn--ghost"
                    disabled={clampedPage === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{ minWidth: 32, padding: '4px 8px' }}
                  >‹</button>
                  {pageNumbers().map((n, i) =>
                    n === '…'
                      ? <span key={`e${i}`} style={{ padding: '4px 2px', fontSize: 13, color: 'var(--ink-3)', alignSelf: 'center' }}>…</span>
                      : <button
                          key={n}
                          className={`btn btn--sm ${n === clampedPage ? 'btn--primary' : 'btn--ghost'}`}
                          onClick={() => setPage(n)}
                          style={{ minWidth: 32, padding: '4px 8px' }}
                        >{n}</button>
                  )}
                  <button
                    className="btn btn--sm btn--ghost"
                    disabled={clampedPage === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    style={{ minWidth: 32, padding: '4px 8px' }}
                  >›</button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ── Footer (preview only) ── */}
      {step === 'preview' && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 24px', background: 'var(--surface)', flexShrink: 0 }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {matched.length > 0 ? (
                <>We matched <b style={{ color: 'var(--ink-2)' }}>{matched.length} product {matched.length === 1 ? 'line' : 'lines'}</b> — estimated total <b style={{ color: 'var(--ink-2)' }}>{fmt(estimatedTotal)}</b></>
              ) : (
                'No products could be matched — nothing will be added'
              )}
            </div>
            <div className="row gap-8">
              <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn--primary" disabled={matched.length === 0} onClick={handleConfirm}>
                Add {matched.length} matching {matched.length === 1 ? 'line' : 'lines'} to order <Icon name="arrow-right" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
