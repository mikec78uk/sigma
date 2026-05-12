import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HOSPITAL_CLIENTS, CATALOGUE } from '../../data'
import { fmt } from '../../utils/format'
import Icon from '../../components/Icon'
import CataloguePanel from './CataloguePanel'
import BasketPanel from './BasketPanel'
import ReviewStep from './ReviewStep'
import SpreadsheetImportModal from './SpreadsheetImportModal'
import QuickEntryPanel from './QuickEntryPanel'

export default function BuildOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const order = location.state?.order

  const [layout, setLayout] = useState('quick')
  const [showImport, setShowImport] = useState(false)
  const [importInitialFile, setImportInitialFile] = useState(null)
  const [unmatchedImport, setUnmatchedImport] = useState([])
  const [oosImport, setOosImport] = useState([])

  function processFileQuick(file) {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target.result
      const rows = text.trim().split(/\r?\n/).filter(l => l.trim())
      if (rows.length < 2) return
      const header = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      const skuCol = header.findIndex(h => h.includes('sku') || h.includes('product code') || h.includes('item code') || h === 'code')
      const qtyCol = header.findIndex(h => h.includes('qty') || h.includes('quantity') || h.includes('units') || h.includes('amount'))
      if (skuCol === -1 || qtyCol === -1) return
      const parsed = rows.slice(1).map((line, i) => {
        const cols = line.split(',').map(c => c.trim().replace(/"/g, ''))
        return { sku: cols[skuCol] || '', qty: Math.max(0, parseInt(cols[qtyCol], 10) || 0), row: i + 2 }
      }).filter(r => r.sku && r.qty > 0)
      const matched = [], unmatched = [], oos = []
      parsed.forEach(r => {
        const product = CATALOGUE.find(p => p.sku.toLowerCase() === r.sku.toLowerCase())
        if (!product) unmatched.push(r)
        else if (product.stockState === 'out') oos.push({ ...r, product })
        else matched.push({ product, qty: r.qty })
      })
      handleImportQuick(matched, unmatched, oos)
    }
    reader.readAsText(file)
  }
  const [step, setStep] = useState(layout === 'stepped' ? 'catalogue' : 'build')

  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [stockOnly, setStockOnly] = useState(false)
  const [dtOnly, setDtOnly] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 9

  const [draftOosRemoved, setDraftOosRemoved] = useState([])

  // On load, strip any OOS lines from a draft and surface them as a banner
  const initialLines = useMemo(() => {
    if (!order?.lines) return []
    const oos = [], ok = []
    order.lines.forEach(l => {
      const current = CATALOGUE.find(p => p.sku === l.sku)
      if ((current?.stockState ?? l.stockState) === 'out') oos.push(l)
      else ok.push(l)
    })
    if (oos.length) setDraftOosRemoved(oos)
    return ok
  }, [])

  const [lines, setLines] = useState(initialLines)
  const [orderDesc, setOrderDesc] = useState(order?.description || '')
  const [poNumber, setPoNumber] = useState(order?.poNumber || '')
  const [shipDate, setShipDate] = useState(order?.shipDate || new Date().toISOString().slice(0, 10))
  const [agent, setAgent] = useState(order?.agent || 'DPDP-NXT')
  const [manualPick, setManualPick] = useState(order?.manualPick || { enabled: false, reasonCode: '', note: '' })
  const [editLineId, setEditLineId] = useState(null)

  const client = HOSPITAL_CLIENTS.find(c => c.id === order?.clientId)

  useEffect(() => {
    if (layout === 'split' || layout === 'quick') setStep('build')
    else if (step === 'build') setStep('catalogue')
  }, [layout])

  const filtered = useMemo(() => {
    let list = CATALOGUE
    if (cat !== 'All') list = list.filter(p => p.category === cat)
    if (stockOnly) list = list.filter(p => p.stockState !== 'out')
    if (dtOnly) list = list.filter(p => p.dt)
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
      )
    }
    return list
  }, [q, cat, stockOnly, dtOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0)
  const total = subtotal

  function findLine(sku) { return lines.find(l => l.sku === sku) }

  function addToBasket(p) {
    const existing = findLine(p.sku)
    if (existing) {
      setLines(lines.map(l => l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l))
    } else {
      setLines([{
        sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo,
        unit: p.promo || p.msp, qty: 1, description: '',
        stock: p.stock, stockState: p.stockState,
      }, ...lines])
    }
  }

  function addToBasketQuick(p) {
    const existing = findLine(p.sku)
    if (existing) {
      setLines(lines.map(l => l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l))
    } else {
      const unitPrice = Math.ceil(p.msp * 1.25 * 100) / 100
      setLines([{
        sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo,
        unit: unitPrice, qty: 1, description: '',
        stock: p.stock, stockState: p.stockState,
      }, ...lines])
    }
  }

  function setQty(sku, qty) {
    if (qty <= 0) { setLines(lines.filter(l => l.sku !== sku)); return }
    setLines(lines.map(l => l.sku === sku ? { ...l, qty } : l))
  }

  function setUnit(sku, unit) {
    setLines(lines.map(l => l.sku === sku ? { ...l, unit } : l))
  }

  function setLineDesc(sku, description) {
    setLines(lines.map(l => l.sku === sku ? { ...l, description } : l))
  }

  function removeLine(sku) { setLines(lines.filter(l => l.sku !== sku)) }

  function handleImport(importedLines, importedUnmatched = [], importedOos = []) {
    setLines(prev => {
      const next = [...prev]
      importedLines.forEach(({ product: p, qty }) => {
        const idx = next.findIndex(l => l.sku === p.sku)
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        } else {
          next.unshift({ sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo, unit: p.promo ?? p.msp, qty, description: '', stock: p.stock, stockState: p.stockState })
        }
      })
      return next
    })
  }

  function handleImportQuick(importedLines, importedUnmatched = [], importedOos = []) {
    setLines(prev => {
      const next = [...prev]
      importedLines.forEach(({ product: p, qty }) => {
        const idx = next.findIndex(l => l.sku === p.sku)
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        } else {
          const unitPrice = Math.ceil(p.msp * 1.25 * 100) / 100
          next.unshift({ sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo, unit: unitPrice, qty, description: '', stock: p.stock, stockState: p.stockState })
        }
      })
      return next
    })
    if (importedUnmatched.length > 0) setUnmatchedImport(importedUnmatched)
    if (importedOos.length > 0) setOosImport(importedOos)
  }

  function handleClear() {
    setLines([])
    setOrderDesc('')
    setPoNumber('')
    setShipDate(new Date().toISOString().slice(0, 10))
    setAgent('DPDP-NXT')
    setManualPick({ enabled: false, reasonCode: '', note: '' })
    setUnmatchedImport([])
  }

  function handleSubmit() {
    const orderId = 'SO-2026-' + Math.floor(40000 + Math.random() * 9000)
    navigate(`/orders/${orderId}/submitted`, {
      state: {
        order: { ...order, lines, description: orderDesc, poNumber, shipDate, agent, manualPick, total },
      },
    })
  }

  if (!order) {
    return (
      <div className="page__body">
        <div className="empty">
          <h3>No order found.</h3>
          <p><a style={{ cursor: 'pointer', color: 'var(--ink-3)' }} onClick={() => navigate('/')}>Back to orders</a></p>
        </div>
      </div>
    )
  }

  return (
    <div className={'page__body ' + (layout === 'split' || layout === 'quick' ? 'page__body--wide' : '')}>
      <div className="crumbs">
        <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Orders</a>
        <Icon name="chevron-right" size={12} className="crumbs__sep" />
        <span>New order</span>
        <Icon name="chevron-right" size={12} className="crumbs__sep" />
        <span style={{ color: 'var(--ink-2)' }}>{order.draftId || 'Draft'}</span>
      </div>

      <div className="page-h">
        <div>
          <h1 className="page-h__title">{client?.name}</h1>
          <div className="page-h__sub">
            <span className="mono">{client?.code}</span> · {client?.group} · Hospital order
            <span style={{ marginLeft: 10 }} className="badge badge--draft">Draft</span>
          </div>
        </div>
        <div className="row gap-8">
          <button className="btn" onClick={() => navigate('/', { state: { savedDraft: order.draftId || 'draft' } })}><Icon name="save" size={14} /> Save draft</button>
          <button className="btn btn--ghost" onClick={() => navigate('/')}>Discard</button>
        </div>
      </div>

      {/* Rejection notice banner */}
      {order.rejectionNote && (
        <div style={{ marginBottom: 20, background: '#fff5f5', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name="alert" size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#991b1b', marginBottom: 3 }}>This order was rejected — please review and resubmit</div>
            <div style={{ fontSize: 13, color: '#991b1b' }}>{order.rejectionNote}</div>
          </div>
        </div>
      )}

      {/* Draft OOS removal banner */}
      {draftOosRemoved.length > 0 && (
        <div style={{ marginBottom: 20, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>
              {draftOosRemoved.length} {draftOosRemoved.length === 1 ? 'item has' : 'items have'} been removed from this order
            </span>
            <button
              onClick={() => setDraftOosRemoved([])}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2 }}
            >
              <Icon name="x" size={14} />
            </button>
          </div>
          <div style={{ padding: '10px 14px', background: '#fff5f5' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Icon name="alert" size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#991b1b', marginBottom: 4 }}>
                  Out of stock — not available for this order
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {draftOosRemoved.map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 11.5, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 4, padding: '1px 6px', color: '#991b1b', flexShrink: 0 }}>
                        {l.sku}
                      </span>
                      <span style={{ fontSize: 12.5, color: '#991b1b' }}>{l.name}</span>
                      <span style={{ fontSize: 12, color: '#991b1b', opacity: 0.7, marginLeft: 'auto', flexShrink: 0 }}>Quantity ordered: {l.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === 'stepped' && (
        <div className="stepper" style={{ marginBottom: 20 }}>
          <div className={'stepper__item ' + (step === 'catalogue' ? 'is-active' : 'is-done')}>
            <span className="stepper__num">{step !== 'catalogue' ? '✓' : '1'}</span> Add products
          </div>
          <div className="stepper__sep" />
          <div className={'stepper__item ' + (step === 'basket' ? 'is-active' : (step === 'review' ? 'is-done' : ''))}>
            <span className="stepper__num">2</span> Review basket
          </div>
          <div className="stepper__sep" />
          <div className={'stepper__item ' + (step === 'review' ? 'is-active' : '')}>
            <span className="stepper__num">3</span> Shipping &amp; submit
          </div>
        </div>
      )}

      {layout === 'quick' && (
        <div className="builder">
          <QuickEntryPanel
            lines={lines}
            addToBasket={addToBasketQuick}
            setQty={setQty}
            setUnit={setUnit}
            setLineDesc={setLineDesc}
            removeLine={removeLine}
            unmatchedImport={unmatchedImport}
            onDismissUnmatched={() => setUnmatchedImport([])}
            oosImport={oosImport}
            onDismissOos={() => setOosImport([])}
            onFileSelect={processFileQuick}
            onImportClick={() => { setImportInitialFile(null); setShowImport(true) }}
          />
          <aside className="builder__basket">
            <BasketPanel
              lines={lines} setQty={setQty} removeLine={removeLine}
              editLineId={editLineId} setEditLineId={setEditLineId}
              setUnit={setUnit} setLineDesc={setLineDesc}
              subtotal={subtotal} total={total}
              orderDesc={orderDesc} setOrderDesc={setOrderDesc}
              poNumber={poNumber} setPoNumber={setPoNumber}
              shipDate={shipDate} setShipDate={setShipDate}
              agent={agent} setAgent={setAgent}
              manualPick={manualPick} setManualPick={setManualPick}
              onSubmit={handleSubmit}
              onClear={handleClear}
              showFoot
              hideLines
            />
          </aside>
        </div>
      )}

      {layout !== 'quick' && (
      <div className={'builder ' + (layout === 'stepped' ? 'builder--stacked' : '')}>
        {(layout === 'split' || step === 'catalogue') && (
          <div>
            <CataloguePanel
              q={q} setQ={v => { setQ(v); setPage(1) }}
              cat={cat} setCat={v => { setCat(v); setPage(1) }}
              stockOnly={stockOnly} setStockOnly={setStockOnly}
              dtOnly={dtOnly} setDtOnly={setDtOnly}
              filtered={filtered}
              paged={paged}
              page={page} totalPages={totalPages} setPage={setPage}
              showStock={true}
              findLine={findLine}
              addToBasket={addToBasket}
              setQty={setQty}
              lines={lines}
              total={total}
              onReview={layout === 'stepped' ? () => setStep('basket') : null}
              onCancel={() => navigate('/')}
              onImportClick={() => setShowImport(true)}
            />
            {layout === 'stepped' && (
              <div className="row end gap-8" style={{ marginTop: 18 }}>
                <button className="btn" onClick={() => navigate('/')}>Cancel</button>
                <button
                  className="btn btn--primary"
                  disabled={lines.length === 0}
                  onClick={() => setStep('basket')}
                >
                  Review {lines.length} {lines.length === 1 ? 'item' : 'items'}{lines.length > 0 ? ` (${fmt(total)})` : ''} <Icon name="arrow-right" size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {layout === 'split' && (
          <aside className="builder__basket">
            <BasketPanel
              lines={lines} setQty={setQty} removeLine={removeLine}
              editLineId={editLineId} setEditLineId={setEditLineId}
              setUnit={setUnit} setLineDesc={setLineDesc}
              subtotal={subtotal} total={total}
              orderDesc={orderDesc} setOrderDesc={setOrderDesc}
              poNumber={poNumber} setPoNumber={setPoNumber}
              shipDate={shipDate} setShipDate={setShipDate}
              agent={agent} setAgent={setAgent}
              manualPick={manualPick} setManualPick={setManualPick}
              onSubmit={handleSubmit}
              onClear={handleClear}
              showFoot
            />
          </aside>
        )}

        {layout === 'stepped' && step === 'basket' && (
          <div className="col gap-16">
            <BasketPanel
              lines={lines} setQty={setQty} removeLine={removeLine}
              editLineId={editLineId} setEditLineId={setEditLineId}
              setUnit={setUnit} setLineDesc={setLineDesc}
              subtotal={subtotal} total={total}
              orderDesc={orderDesc} setOrderDesc={setOrderDesc}
              poNumber={poNumber} setPoNumber={setPoNumber}
              shipDate={shipDate} setShipDate={setShipDate}
              agent={agent} setAgent={setAgent}
              manualPick={manualPick} setManualPick={setManualPick}
              onSubmit={() => setStep('review')}
              onClear={handleClear}
              full
            />
            <div className="row between">
              <button className="btn" onClick={() => setStep('catalogue')}>
                <Icon name="back" size={14} /> Back to catalogue
              </button>
              <button
                className="btn btn--primary"
                disabled={lines.length === 0}
                onClick={() => setStep('review')}
              >
                Continue to shipping <Icon name="arrow-right" size={14} />
              </button>
            </div>
          </div>
        )}

        {layout === 'stepped' && step === 'review' && (
          <ReviewStep
            order={{ ...order, lines, description: orderDesc, agent, manualPick, total }}
            client={client}
            onBack={() => setStep('basket')}
            onSubmit={handleSubmit}
          />
        )}
      </div>
      )}

      {showImport && (
        <SpreadsheetImportModal
          onImport={layout === 'quick' ? handleImportQuick : handleImport}
          onClose={() => { setShowImport(false); setImportInitialFile(null) }}
          initialFile={importInitialFile}
        />
      )}
    </div>
  )
}
