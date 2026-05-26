import { useState, useMemo, useEffect, useRef } from 'react' // useRef kept for prevDraftIdRef
import { useNavigate, useLocation } from 'react-router-dom'
import { HOSPITAL_CLIENTS, CATALOGUE, NRT_CATALOGUE, NRT_CATEGORIES, CATEGORIES } from '../../data'
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
  const [insufficientImport, setInsufficientImport] = useState([])
  const [wrongRouteImport, setWrongRouteImport] = useState([])

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
      const matched = [], unmatched = [], oos = [], insufficient = [], wrongRoute = []
      // Only NRT orders have wrong-route items; hospital orders accept all products
      const otherCatalogue = isNrt ? CATALOGUE : []
      parsed.forEach(r => {
        const product = activeCatalogue.find(p => p.sku.toLowerCase() === r.sku.toLowerCase())
        if (!product) {
          const otherProduct = otherCatalogue.find(p => p.sku.toLowerCase() === r.sku.toLowerCase())
          if (otherProduct) wrongRoute.push({ ...r, product: otherProduct })
          else unmatched.push(r)
        } else if (product.stockState === 'out') oos.push({ ...r, product, available: 0 })
        else if (product.stock < r.qty) insufficient.push({ ...r, product, available: product.stock })
        else matched.push({ product, qty: r.qty })
      })
      handleImportQuick(matched, unmatched, oos, insufficient, wrongRoute)
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

  const lineIdRef = useRef(0)
  function nextLineId() { return ++lineIdRef.current }

  // On load, strip any OOS lines from a draft and surface them as a banner
  const initialLines = useMemo(() => {
    if (!order?.lines) return []
    const oos = [], ok = []
    order.lines.forEach(l => {
      const fullCatalogue = order?.type === 'nrt' ? NRT_CATALOGUE : [...CATALOGUE, ...NRT_CATALOGUE]
      const current = fullCatalogue.find(p => p.sku === l.sku)
      const withId = l.lineId ? l : { ...l, lineId: nextLineId() }
      if ((current?.stockState ?? l.stockState) === 'out') oos.push(withId)
      else ok.push(withId)
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
  const isNrt = order?.type === 'nrt'
  // Hospital orders include all NRT products; NRT orders are restricted to NRT catalogue only
  const activeCatalogue = isNrt ? NRT_CATALOGUE : [...CATALOGUE, ...NRT_CATALOGUE]
  const activeCategories = isNrt ? NRT_CATEGORIES : ['All', ...CATEGORIES.slice(1), ...NRT_CATEGORIES.slice(1)]

  // When the same component instance is reused for a different order (e.g. switching route type),
  // reset all state to match the incoming order so stale banners and lines don't bleed through.
  const prevDraftIdRef = useRef(order?.draftId)
  useEffect(() => {
    if (order?.draftId && order.draftId !== prevDraftIdRef.current) {
      prevDraftIdRef.current = order.draftId
      const catalogue = order.type === 'nrt' ? NRT_CATALOGUE : [...CATALOGUE, ...NRT_CATALOGUE]
      const newLines = (order.lines || []).filter(l => {
        const current = catalogue.find(p => p.sku === l.sku)
        return (current?.stockState ?? l.stockState) !== 'out'
      })
      setLines(newLines)
      setOrderDesc(order.description || '')
      setPoNumber(order.poNumber || '')
      setShipDate(order.shipDate || new Date().toISOString().slice(0, 10))
      setAgent(order.agent || 'DPDP-NXT')
      setManualPick(order.manualPick || { enabled: false, reasonCode: '', note: '' })
      setOosImport([])
      setInsufficientImport([])
      setUnmatchedImport([])
      setWrongRouteImport([])
      setDraftOosRemoved([])
      setStep('build')
    }
  }, [order?.draftId])

  useEffect(() => {
    if (layout === 'split' || layout === 'quick') setStep('build')
    else if (step === 'build') setStep('catalogue')
  }, [layout])

  const filtered = useMemo(() => {
    let list = activeCatalogue
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
  }, [q, cat, stockOnly, dtOnly, activeCatalogue])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0)
  const total = subtotal

  function addToBasket(p) {
    // Variant products can have multiple lines (one per variant); non-variant products increment
    const hasVariants = p.variants?.length > 0
    if (!hasVariants) {
      const existing = lines.find(l => l.sku === p.sku)
      if (existing) {
        setLines(lines.map(l => l.lineId === existing.lineId ? { ...l, qty: l.qty + 1 } : l))
        return
      }
    }
    const listPrice = p.listPrice || Math.round(p.msp * 1.25 * 100) / 100
    const contractPrice = Math.round(listPrice * (1 - (p.discount || 0) / 100) * 100) / 100
    setLines([{
      lineId: nextLineId(),
      sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, listPrice,
      discount: p.discount || 0,
      unit: contractPrice,
      qty: 1, description: '',
      stock: p.stock, stockState: p.stockState,
      variants: p.variants || null, variant: '', mld: '',
    }, ...lines])
  }

  function addToBasketQuick(p) {
    const hasVariants = p.variants?.length > 0
    if (!hasVariants) {
      const existing = lines.find(l => l.sku === p.sku)
      if (existing) {
        setLines(lines.map(l => l.lineId === existing.lineId ? { ...l, qty: l.qty + 1 } : l))
        return
      }
    }
    const listPrice = p.listPrice || Math.round(p.msp * 1.25 * 100) / 100
    const contractPrice = Math.round(listPrice * (1 - (p.discount || 0) / 100) * 100) / 100
    setLines([{
      lineId: nextLineId(),
      sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, listPrice,
      discount: p.discount || 0,
      unit: contractPrice,
      qty: 1, description: '',
      stock: p.stock, stockState: p.stockState,
      variants: p.variants || null, variant: '', mld: '',
    }, ...lines])
  }

  function setVariant(lineId, variant) {
    setLines(lines.map(l => l.lineId === lineId ? { ...l, variant } : l))
  }

  function setMld(lineId, mld) {
    setLines(lines.map(l => {
      if (l.lineId !== lineId) return l
      const mldPct = parseFloat(mld)
      const basePrice = l.listPrice || l.msp
      const totalPct = (l.discount || 0) + (isNaN(mldPct) || mldPct < 0 ? 0 : mldPct)
      const newUnit = Math.round(basePrice * (1 - totalPct / 100) * 100) / 100
      return { ...l, mld, unit: Math.max(0, newUnit) }
    }))
  }

  function setQty(lineId, qty) {
    if (qty <= 0) { setLines(lines.filter(l => l.lineId !== lineId)); return }
    setLines(lines.map(l => l.lineId === lineId ? { ...l, qty } : l))
  }

  function setUnit(lineId, unit) {
    setLines(lines.map(l => l.lineId === lineId ? { ...l, unit } : l))
  }

  function setLineDesc(lineId, description) {
    setLines(lines.map(l => l.lineId === lineId ? { ...l, description } : l))
  }

  function removeLine(lineId) { setLines(lines.filter(l => l.lineId !== lineId)) }

  function handleImport(importedLines, importedUnmatched = [], importedOos = []) {
    setLines(prev => {
      const next = [...prev]
      importedLines.forEach(({ product: p, qty }) => {
        const hasVariants = p.variants?.length > 0
        const idx = hasVariants ? -1 : next.findIndex(l => l.sku === p.sku)
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        } else {
          const listPrice = p.listPrice || Math.round(p.msp * 1.25 * 100) / 100
          const contractPrice = Math.round(listPrice * (1 - (p.discount || 0) / 100) * 100) / 100
          next.unshift({ lineId: nextLineId(), sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, listPrice, discount: p.discount || 0, unit: contractPrice, qty, description: '', stock: p.stock, stockState: p.stockState, variants: p.variants || null, variant: '', mld: '' })
        }
      })
      return next
    })
    // User reviewed issues in the modal — clear any on-page banners
    setOosImport([])
    setInsufficientImport([])
    setUnmatchedImport([])
    setWrongRouteImport([])
  }

  function handleImportQuick(importedLines, importedUnmatched = [], importedOos = [], importedInsufficient = [], importedWrongRoute = []) {
    setLines(prev => {
      const next = [...prev]
      importedLines.forEach(({ product: p, qty }) => {
        const hasVariants = p.variants?.length > 0
        const idx = hasVariants ? -1 : next.findIndex(l => l.sku === p.sku)
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        } else {
          const listPrice = p.listPrice || Math.round(p.msp * 1.25 * 100) / 100
          const contractPrice = Math.round(listPrice * (1 - (p.discount || 0) / 100) * 100) / 100
          next.unshift({ lineId: nextLineId(), sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, listPrice, discount: p.discount || 0, unit: contractPrice, qty, description: '', stock: p.stock, stockState: p.stockState, variants: p.variants || null, variant: '', mld: '' })
        }
      })
      return next
    })
    if (importedUnmatched.length > 0) setUnmatchedImport(importedUnmatched)
    if (importedOos.length > 0) setOosImport(importedOos)
    if (importedInsufficient.length > 0) setInsufficientImport(importedInsufficient)
    if (importedWrongRoute.length > 0) setWrongRouteImport(importedWrongRoute)
  }

function handleClear() {
    setLines([])
    setOrderDesc('')
    setPoNumber('')
    setShipDate(new Date().toISOString().slice(0, 10))
    setAgent('DPDP-NXT')
    setManualPick({ enabled: false, reasonCode: '', note: '' })
    setUnmatchedImport([])
    setOosImport([])
    setInsufficientImport([])
  }

  const needsApproval = lines.some(l => l.unit < l.msp - 0.001)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [approverComment, setApproverComment] = useState('')
  const [discardModalOpen, setDiscardModalOpen] = useState(false)

  function handleSubmit() {
    if (needsApproval) {
      setApproverComment('')
      setApprovalModalOpen(true)
      return
    }
    submitOrder()
  }

  function submitOrder(comment) {
    const orderId = 'SO-2026-' + Math.floor(40000 + Math.random() * 9000)
    navigate(`/orders/${orderId}/submitted`, {
      state: {
        order: { ...order, lines, description: orderDesc, poNumber, shipDate, agent, manualPick, total, approverComment: comment || '' },
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

      {/* Discard confirmation modal */}
      {discardModalOpen && (
        <div className="scrim">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal__head">
              <div className="row between">
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>Discard order</div>
                  <h2>Save your current order?</h2>
                </div>
                <button className="btn btn--ghost btn--icon" onClick={() => setDiscardModalOpen(false)}>
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
            <div className="modal__body">
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: 0 }}>
                Unsaved changes will be permanently lost.
              </p>
            </div>
            <div className="modal__foot" style={{ justifyContent: 'center' }}>
              <div className="row gap-8">
                <button
                  className="btn"
                  style={{ color: 'var(--bad)', borderColor: 'rgba(220,38,38,0.4)' }}
                  onClick={() => navigate('/')}
                >
                  Discard without saving
                </button>
                <button
                  className="btn btn--primary"
                  onClick={() => navigate('/', { state: { savedDraft: order.draftId || 'draft' } })}
                >
                  <Icon name="save" size={14} /> Save as draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="crumbs">
        <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Orders</a>
        <Icon name="chevron-right" size={12} className="crumbs__sep" />
        <span>New order</span>
        <Icon name="chevron-right" size={12} className="crumbs__sep" />
        <span style={{ color: 'var(--ink-2)' }}>{order.draftId || 'Draft'}</span>
      </div>

      <div className="page-h">
        <div>
          <h1 className="page-h__title">{client?.name}{client?.postcode && <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}> ({client.postcode})</span>}</h1>
          <div className="page-h__sub">
            <span className="mono">{client?.code}</span> · {client?.group}
          </div>
        </div>
        {!(showImport && layout === 'quick') && !approvalModalOpen && (
          <div className="row gap-8">
            <button className="btn" onClick={() => navigate('/', { state: { savedDraft: order.draftId || 'draft' } })}><Icon name="save" size={14} /> Save draft</button>
            <button className="btn btn--ghost" onClick={() => setDiscardModalOpen(true)}>Discard</button>
          </div>
        )}
      </div>

      {/* EDI price mismatch banner */}
      {!approvalModalOpen && order.status === 'edi-error' && order.ediErrors?.length > 0 && (
        <div style={{ marginBottom: 20, background: '#fff7ed', border: '1px solid rgba(194,65,12,0.3)', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="alert" size={15} style={{ color: '#c2410c', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#7c2d12', marginBottom: 4 }}>
                EDI price mismatch — review and resubmit
              </div>
              <div style={{ fontSize: 13, color: '#92400e', marginBottom: 10 }}>
                This order was received automatically but could not be processed. The prices below were sent by the client system and don't match Sigma's current rates. Review and correct the highlighted lines before resubmitting.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {order.ediErrors.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 12.5 }}>
                    <span className="mono" style={{ fontSize: 11.5, background: 'rgba(194,65,12,0.08)', border: '1px solid rgba(194,65,12,0.25)', borderRadius: 4, padding: '1px 6px', color: '#7c2d12', flexShrink: 0 }}>
                      {e.sku}
                    </span>
                    <span style={{ color: '#92400e', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                    <span className="mono" style={{ fontSize: 12, color: '#7c2d12', flexShrink: 0 }}>
                      Client sent {fmt(e.orderedPrice)} · System price {fmt(e.systemPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection notice banner */}
      {!approvalModalOpen && order.rejectionNote && (
        <div style={{ marginBottom: 20, background: '#fff5f5', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name="alert" size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#991b1b', marginBottom: 3 }}>This order was rejected — please review and resubmit</div>
            <div style={{ fontSize: 13, color: '#991b1b' }}>{order.rejectionNote}</div>
          </div>
        </div>
      )}

      {/* Draft OOS removal banner */}
      {!approvalModalOpen && draftOosRemoved.length > 0 && !(showImport && layout === 'quick') && (
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
                  Insufficient stock — not available for this order
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

      {/* Approval inline page */}
      {approvalModalOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '14px 0' }}>
            <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', padding: '0 24px' }}>
              <div className="label" style={{ marginBottom: 4 }}>Approval required</div>
              <h3 style={{ fontSize: 18 }}>Submit for approval</h3>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '24px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                  <Icon name="alert" size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#92400e' }}>Lines requiring commercial approval</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {lines.filter(l => l.unit < l.msp - 0.001).map(l => (
                    <div key={l.lineId ?? l.sku} style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 12.5 }}>
                      <span className="mono" style={{ fontSize: 11.5, color: '#92400e', flexShrink: 0 }}>{l.sku}</span>
                      <span style={{ flex: 1, color: '#78350f' }}>{l.name}</span>
                      <span className="mono" style={{ fontSize: 12, color: '#92400e', flexShrink: 0 }}>
                        {fmt(l.unit)} <span style={{ opacity: 0.6 }}>vs MSP {fmt(l.msp)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
                This order contains lines priced below MSP and will be sent for commercial approval before fulfilment can begin.
              </div>
              <div className="field">
                <div className="field__label">
                  Comment to approver <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
                </div>
                <textarea
                  className="input"
                  autoFocus
                  rows={5}
                  placeholder="Add any context that might help the approver — e.g. reason for the pricing, urgency, client relationship…"
                  value={approverComment}
                  onChange={e => setApproverComment(e.target.value)}
                  style={{ width: '100%', fontSize: 13.5, resize: 'vertical', fontFamily: 'inherit', padding: 14, height: 140 }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 24px', background: 'var(--surface-2)' }}>
            <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn" onClick={() => setApprovalModalOpen(false)}>
                <Icon name="arrow-left" size={14} /> Back to create order
              </button>
              <button className="btn btn--primary" onClick={() => { setApprovalModalOpen(false); submitOrder(approverComment) }}>
                <Icon name="check" size={14} /> Submit for approval
              </button>
            </div>
          </div>
        </div>
      )}

      {!approvalModalOpen && layout === 'stepped' && (
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

      {!approvalModalOpen && layout === 'quick' && (
        <div className={showImport ? '' : 'builder'}>
          {showImport && (
            <SpreadsheetImportModal
              catalogue={activeCatalogue}
              orderType={order?.type ?? 'hospital'}
              onImport={(matched, unmatched, oos, insufficient, wrongRoute) => {
                handleImportQuick(matched, unmatched, oos, insufficient, wrongRoute)
                setShowImport(false)
                setImportInitialFile(null)
              }}
              onClose={() => { setShowImport(false); setImportInitialFile(null); setOosImport([]); setInsufficientImport([]); setUnmatchedImport([]); setWrongRouteImport([]) }}
              initialFile={importInitialFile}
            />
          )}
          {!showImport && <QuickEntryPanel
            catalogue={activeCatalogue}
            lines={lines}
            addToBasket={addToBasketQuick}
            setQty={setQty}
            setUnit={setUnit}
            setLineDesc={setLineDesc}
            setVariant={setVariant}
            setMld={setMld}
            removeLine={removeLine}
            unmatchedImport={unmatchedImport}
            onDismissUnmatched={() => setUnmatchedImport([])}
            oosImport={oosImport}
            onDismissOos={() => setOosImport([])}
            insufficientImport={insufficientImport}
            onDismissInsufficient={() => setInsufficientImport([])}
            wrongRouteImport={wrongRouteImport}
            onDismissWrongRoute={() => setWrongRouteImport([])}
            orderType={order?.type ?? 'hospital'}
            ediErrors={order?.ediErrors || []}
            onFileSelect={(file) => { setImportInitialFile(file); setShowImport(true) }}
            onImportClick={() => { setImportInitialFile(null); setShowImport(true) }}
          />}
          {!showImport && (
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
                orderType={order?.type}
                showFoot
                hideLines
              />
            </aside>
          )}
        </div>
      )}

      {!approvalModalOpen && layout !== 'quick' && (
      <div className={'builder ' + (layout === 'stepped' ? 'builder--stacked' : '')}>
        {(layout === 'split' || step === 'catalogue') && (
          <div>
            <CataloguePanel
              catalogue={activeCatalogue}
              categories={activeCategories}
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
              orderType={order?.type}
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
              orderType={order?.type}
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


      {showImport && layout !== 'quick' && (
        <div className="scrim">
          <div className="modal modal--lg" style={{ maxWidth: 760, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <SpreadsheetImportModal
              catalogue={activeCatalogue}
              orderType={order?.type ?? 'hospital'}
              onImport={handleImport}
              onClose={() => { setShowImport(false); setImportInitialFile(null); setOosImport([]); setInsufficientImport([]); setUnmatchedImport([]); setWrongRouteImport([]) }}
              initialFile={importInitialFile}
            />
          </div>
        </div>
      )}
    </div>
  )
}
