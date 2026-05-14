import { useState, useRef, useEffect } from 'react'
import { fmt } from '../../utils/format'
import { CATALOGUE, NRT_CATALOGUE, ORDER_TYPES } from '../../data'
import Modal from '../../components/Modal'
import Icon from '../../components/Icon'

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

export default function SpreadsheetImportModal({ catalogue = [], orderType = 'hospital', onImport, onClose, initialFile }) {
  const [step, setStep] = useState('upload') // 'upload' | 'preview'
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState(null)
  const [matched, setMatched] = useState([])
  const [unmatched, setUnmatched] = useState([])
  const [outOfStock, setOutOfStock] = useState([])
  const [wrongRoute, setWrongRoute] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const otherCatalogue = orderType === 'nrt' ? CATALOGUE : NRT_CATALOGUE
  const otherType = ORDER_TYPES.find(t => t.id !== orderType)
  const currentType = ORDER_TYPES.find(t => t.id === orderType)

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

      const matchedRows = []
      const unmatchedRows = []
      const oosRows = []
      const wrongRouteRows = []

      rows.forEach(r => {
        const product = catalogue.find(p => p.sku.toLowerCase() === r.sku.toLowerCase())
        if (!product) {
          // Check if it exists in the other route's catalogue
          const otherProduct = otherCatalogue.find(p => p.sku.toLowerCase() === r.sku.toLowerCase())
          if (otherProduct) {
            wrongRouteRows.push({ ...r, product: otherProduct })
          } else {
            unmatchedRows.push(r)
          }
        } else if (product.stockState === 'out' || product.stock < r.qty) {
          oosRows.push({ ...r, product, available: product.stock })
        } else {
          matchedRows.push({ ...r, product })
        }
      })

      setMatched(matchedRows)
      setUnmatched(unmatchedRows)
      setOutOfStock(oosRows)
      setWrongRoute(wrongRouteRows)
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

  return (
    <Modal onClose={onClose} size="lg">
      <div className="modal__head">
        <div className="row between">
          <div>
            <div className="label" style={{ marginBottom: 4 }}>Import spreadsheet</div>
            <h2>{step === 'upload' ? 'Upload spreadsheet' : `Preview — ${fileName}`}</h2>
          </div>
          <button className="btn btn--ghost btn--icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
      </div>

      <div className="modal__body">
        {step === 'upload' && (
          <div className="col gap-16">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--ink-3)' : 'var(--border)'}`,
                borderRadius: 10,
                padding: '40px 24px',
                textAlign: 'center',
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

            {/* Format hint */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
              <div className="label" style={{ marginBottom: 8 }}>Expected column format</div>
              <table className="tbl" style={{ fontSize: 12.5 }}>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="mono">SC-04128</td><td className="mono">10</td></tr>
                  <tr><td className="mono">SC-04227</td><td className="mono">4</td></tr>
                </tbody>
              </table>
              <div className="row between" style={{ alignItems: 'center', marginTop: 10 }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  Column headers are flexible — any column containing "SKU", "Code", "Qty" or "Quantity" will be detected automatically.
                </div>
                <button
                  className="btn btn--sm btn--ghost"
                  onClick={downloadTemplate}
                  style={{ fontSize: 12, color: 'var(--ink-3)', gap: 5, flexShrink: 0, marginLeft: 12 }}
                >
                  <Icon name="download" size={12} /> Download example file
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="col gap-16">
            {/* Summary strip */}
            <div className="row gap-12" style={{ alignItems: 'stretch' }}>
              <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#166534' }}>{matched.length}</div>
                <div style={{ fontSize: 13, color: '#166534', marginTop: 2 }}>lines matched</div>
              </div>
              {outOfStock.length > 0 && (
                <div style={{ flex: 1, background: '#fff5f5', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#991b1b' }}>{outOfStock.length}</div>
                  <div style={{ fontSize: 13, color: '#991b1b', marginTop: 2 }}>insufficient stock</div>
                </div>
              )}
              {wrongRoute.length > 0 && (
                <div style={{ flex: 1, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0c4a6e' }}>{wrongRoute.length}</div>
                  <div style={{ fontSize: 13, color: '#0369a1', marginTop: 2 }}>
                    {orderType === 'nrt' ? 'Non NRT product codes' : 'Non Hospital / Bulk / MLD product codes'}
                  </div>
                </div>
              )}
              {unmatched.length > 0 && (
                <div style={{ flex: 1, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#92400e' }}>{unmatched.length}</div>
                  <div style={{ fontSize: 13, color: '#92400e', marginTop: 2 }}>lines not recognised</div>
                </div>
              )}
            </div>

            {/* Out of stock lines */}
            {outOfStock.length > 0 && (
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Insufficient stock — will not be added</div>
                <div style={{ border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, overflow: 'hidden', background: '#fff5f5' }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th style={{ width: 48 }}>Row</th>
                        <th style={{ textAlign: 'left' }}>SKU</th>
                        <th>Product</th>
                        <th className="right">Requested</th>
                        <th className="right">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outOfStock.map((r, i) => (
                        <tr key={i}>
                          <td className="mono muted" style={{ fontSize: 12 }}>{r.row ?? '—'}</td>
                          <td className="mono" style={{ fontSize: 12, color: '#991b1b' }}>{r.sku}</td>
                          <td>
                            <div style={{ fontSize: 13, color: '#991b1b' }}>{r.product.name}</div>
                          </td>
                          <td className="right mono tnum" style={{ color: '#991b1b' }}>{r.qty}</td>
                          <td className="right mono tnum" style={{ color: r.available === 0 ? '#991b1b' : '#92400e', fontWeight: 600 }}>{r.available}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: 12, color: '#991b1b', marginTop: 6, opacity: 0.8 }}>
                  These products have insufficient stock and cannot be fulfilled at the requested quantity.
                </div>
              </div>
            )}

            {/* Wrong route lines */}
            {wrongRoute.length > 0 && (
              <div style={{ border: '1px solid #bae6fd', borderRadius: 8, overflow: 'hidden', background: '#f0f9ff' }}>
                {/* Header */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0c4a6e' }}>
                      Available via {otherType?.short ?? 'a different route'}, not {currentType?.short ?? 'this route'}
                    </div>
                    <div style={{ fontSize: 12, color: '#0369a1', marginTop: 2 }}>
                      These {wrongRoute.length === 1 ? 'product is' : 'products are'} only available on the {otherType?.short} order route and won't be added here.
                    </div>
                  </div>
                </div>
                {/* Table */}
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>Row</th>
                      <th style={{ textAlign: 'left' }}>SKU</th>
                      <th>Product</th>
                      <th className="right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wrongRoute.map((r, i) => (
                      <tr key={i}>
                        <td className="mono muted" style={{ fontSize: 12 }}>{r.row ?? '—'}</td>
                        <td className="mono" style={{ fontSize: 12, color: '#0369a1' }}>{r.sku}</td>
                        <td>
                          <div style={{ fontSize: 13, color: '#0c4a6e' }}>{r.product.name}</div>
                          <div style={{ fontSize: 11.5, color: '#0369a1', marginTop: 1 }}>{r.product.pack}</div>
                        </td>
                        <td className="right mono tnum" style={{ color: '#0369a1' }}>{r.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Unrecognised lines */}
            {unmatched.length > 0 && (
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Unrecognised lines — will be skipped</div>
                <div style={{ border: '1px solid #fde68a', borderRadius: 8, overflow: 'hidden', background: '#fefce8' }}>
                  <table className="tbl">
                    <thead>
                      <tr><th style={{ width: 48 }}>Row</th><th style={{ textAlign: 'left' }}>SKU from file</th><th className="right">Qty</th></tr>
                    </thead>
                    <tbody>
                      {unmatched.map((r, i) => (
                        <tr key={i}>
                          <td className="mono muted" style={{ fontSize: 12 }}>{r.row ?? '—'}</td>
                          <td className="mono" style={{ fontSize: 13 }}>{r.sku}</td>
                          <td className="right mono tnum">{r.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  These SKUs were not found in any product catalogue. Check for typos.
                </div>
              </div>
            )}

            {/* Matched lines */}
            {matched.length > 0 && (
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Matched products</div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    <table className="tbl">
                      <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-2)', zIndex: 1 }}>
                        <tr>
                          <th>SKU</th>
                          <th>Product</th>
                          <th className="right">Qty</th>
                          <th className="right">Unit price</th>
                          <th className="right">Line total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matched.map(r => (
                          <tr key={r.sku}>
                            <td className="mono muted" style={{ fontSize: 12 }}>{r.sku}</td>
                            <td>
                              <div style={{ fontSize: 13.5 }}>{r.product.name}</div>
                              <div className="muted" style={{ fontSize: 11.5 }}>{r.product.pack}</div>
                            </td>
                            <td className="right mono tnum">{r.qty}</td>
                            <td className="right mono tnum">{fmt(r.product.promo ?? r.product.msp)}</td>
                            <td className="right mono tnum" style={{ fontWeight: 600 }}>{fmt((r.product.promo ?? r.product.msp) * r.qty)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="modal__foot">
        <div className="muted" style={{ fontSize: 12.5 }}>
          {step === 'upload' && 'Upload a spreadsheet to pre-fill the order basket'}
          {step === 'preview' && matched.length > 0 && (
            <>Adding <b style={{ color: 'var(--ink-2)' }}>{matched.length} {matched.length === 1 ? 'product' : 'products'}</b> — estimated total <b style={{ color: 'var(--ink-2)' }}>{fmt(matched.reduce((s, r) => s + (r.product.promo ?? r.product.msp) * r.qty, 0))}</b></>
          )}
          {step === 'preview' && matched.length === 0 && 'No products could be matched — nothing will be added'}
        </div>
        <div className="row gap-8">
          {step === 'preview' && (
            <button className="btn" onClick={() => { setStep('upload'); setParseError(null) }}>
              <Icon name="back" size={14} /> Upload different file
            </button>
          )}
          <button className="btn" onClick={onClose}>Cancel</button>
          {step === 'preview' && (
            <button className="btn btn--primary" disabled={matched.length === 0} onClick={handleConfirm}>
              Add {matched.length} {matched.length === 1 ? 'product' : 'products'} to basket <Icon name="arrow-right" size={14} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
