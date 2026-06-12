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

// Problem tabs only — matched items are surfaced in the header/footer, not as a tab
const PROBLEM_TABS = {
  oos:        { color: '#991b1b', activeBg: '#fff5f5',  activeBorder: '#fecaca' },
  wrongRoute: { color: '#0c4a6e', activeBg: '#f0f9ff',  activeBorder: '#bae6fd' },
  unmatched:  { color: '#78350f', activeBg: '#fefce8',  activeBorder: '#fef08a' },
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
  const [activeTab, setActiveTab] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const inputRef = useRef(null)

  const otherCatalogue = orderType === 'nrt' ? CATALOGUE : []
  const otherType = ORDER_TYPES.find(t => t.id !== orderType)

  useEffect(() => {
    if (initialFile) processFile(initialFile)
  }, [])

  function switchTab(id) {
    setActiveTab(id)
    setSearch('')
    setPage(1)
  }

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

      const firstTab = oosRows.length > 0 ? 'oos'
        : wrongRouteRows.length > 0 ? 'wrongRoute'
        : 'unmatched'
      setActiveTab(firstTab)
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

  // Problem tabs only (shown in the tab strip)
  const problemTabs = [
    outOfStock.length > 0 && { id: 'oos', count: outOfStock.length, label: 'insufficient stock', data: outOfStock, ...PROBLEM_TABS.oos },
    wrongRoute.length > 0 && { id: 'wrongRoute', count: wrongRoute.length, label: orderType === 'nrt' ? 'non-NRT codes' : 'non-hospital codes', data: wrongRoute, ...PROBLEM_TABS.wrongRoute },
    unmatched.length > 0 && { id: 'unmatched', count: unmatched.length, label: 'unrecognised', data: unmatched, ...PROBLEM_TABS.unmatched },
  ].filter(Boolean)

  const activeTabDef = problemTabs.find(t => t.id === activeTab) || problemTabs[0]

  // Tab heading / description
  const tabMeta = {
    oos: {
      heading: 'Insufficient stock',
      description: 'These products cannot be fulfilled at the requested quantity and will not be added to the basket.',
    },
    wrongRoute: {
      heading: orderType === 'nrt' ? 'Available via Hospital, not NRT' : 'Available via NRT, not Hospital',
      description: `These ${wrongRoute.length === 1 ? 'product is' : 'products are'} only available on the ${otherType?.short ?? 'other'} order route and won't be added here.`,
    },
    unmatched: {
      heading: 'Unrecognised codes',
      description: 'These SKUs were not found in any product catalogue. Check for typos. They will be skipped.',
    },
  }

  // Filter + paginate
  const filteredRows = useMemo(() => {
    if (!activeTabDef) return []
    const q = search.trim().toLowerCase()
    if (!q) return activeTabDef.data
    return activeTabDef.data.filter(r => r.sku.toLowerCase().includes(q))
  }, [activeTabDef, search])

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
                      ? <>We matched <b style={{ color: 'var(--ink-2)' }}>{matched.length} {matched.length === 1 ? 'product line' : 'product lines'}</b>, but identified the following issues</>
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

              {/* Tab strip */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
                {problemTabs.map(tab => {
                  const isActive = (activeTab || problemTabs[0]?.id) === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => switchTab(tab.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '10px 18px',
                        border: 'none',
                        borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                        background: isActive ? tab.activeBg : 'transparent',
                        cursor: 'pointer',
                        marginBottom: -1,
                        borderRadius: '6px 6px 0 0',
                        transition: 'background 0.12s',
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700, color: tab.color, lineHeight: 1 }}>{tab.count}</span>
                      <span style={{ fontSize: 13, color: isActive ? tab.color : 'var(--ink-3)', fontWeight: isActive ? 600 : 400 }}>
                        {tab.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Tab heading row: title + description left, search right */}
              {activeTabDef && tabMeta[activeTab] && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: activeTabDef.color, marginBottom: 4 }}>
                      {tabMeta[activeTab].heading}
                    </div>
                    <div style={{ fontSize: 13, color: activeTabDef.color, opacity: 0.8 }}>
                      {tabMeta[activeTab].description}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search by product code…"
                    className="input"
                    style={{ width: 240, fontSize: 13, flexShrink: 0 }}
                  />
                </div>
              )}

              {/* Table */}
              {activeTabDef && (
                <div style={{ border: `1px solid ${activeTabDef?.activeBorder ?? 'var(--border)'}`, borderRadius: 8, overflow: 'hidden', background: activeTabDef?.activeBg ?? 'var(--surface)' }}>
                  <table className="tbl">
                    <thead>
                      {activeTab === 'oos' && (
                        <tr>
                          <th style={{ width: 48 }}>Row</th>
                          <th style={{ width: 110, textAlign: 'left' }}>SKU</th>
                          <th>Product</th>
                          <th className="right" style={{ width: 90 }}>Requested</th>
                          <th className="right" style={{ width: 90 }}>Available</th>
                        </tr>
                      )}
                      {activeTab === 'wrongRoute' && (
                        <tr>
                          <th style={{ width: 48 }}>Row</th>
                          <th style={{ width: 110, textAlign: 'left' }}>SKU</th>
                          <th>Product</th>
                          <th className="right" style={{ width: 60 }}>Qty</th>
                        </tr>
                      )}
                      {activeTab === 'unmatched' && (
                        <tr>
                          <th style={{ width: 48 }}>Row</th>
                          <th style={{ textAlign: 'left' }}>SKU from file</th>
                          <th className="right" style={{ width: 60 }}>Qty</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {pageRows.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-3)', fontSize: 13 }}>
                            No results match your search.
                          </td>
                        </tr>
                      )}
                      {activeTab === 'oos' && pageRows.map((r, i) => (
                        <tr key={i}>
                          <td className="mono muted" style={{ fontSize: 12 }}>{r.row ?? '—'}</td>
                          <td className="mono" style={{ fontSize: 12 }}>{r.sku}</td>
                          <td><div style={{ fontSize: 13 }}>{r.product.name}</div></td>
                          <td className="right mono tnum">{r.qty}</td>
                          <td className="right mono tnum" style={{ color: r.available === 0 ? '#991b1b' : '#92400e', fontWeight: 600 }}>{r.available}</td>
                        </tr>
                      ))}
                      {activeTab === 'wrongRoute' && pageRows.map((r, i) => (
                        <tr key={i}>
                          <td className="mono muted" style={{ fontSize: 12 }}>{r.row ?? '—'}</td>
                          <td className="mono" style={{ fontSize: 12 }}>{r.sku}</td>
                          <td>
                            <div style={{ fontSize: 13 }}>{r.product.name}</div>
                            <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{r.product.pack}</div>
                          </td>
                          <td className="right mono tnum">{r.qty}</td>
                        </tr>
                      ))}
                      {activeTab === 'unmatched' && pageRows.map((r, i) => (
                        <tr key={i}>
                          <td className="mono muted" style={{ fontSize: 12 }}>{r.row ?? '—'}</td>
                          <td className="mono" style={{ fontSize: 13 }}>{r.sku}</td>
                          <td className="right mono tnum">{r.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
