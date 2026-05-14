import { useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { HOSPITAL_CLIENTS, SHIPPING_AGENTS, CATALOGUE, ORDERS_SEED } from '../../data'
import { fmt } from '../../utils/format'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import StockDot from '../../components/StockDot'

function MetaRow({ label, value }) {
  const isEmpty = value === null || value === undefined || value === ''
  return (
    <div style={{ display: 'flex', gap: 16, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="label" style={{ minWidth: 180, paddingTop: 1 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 13.5, color: isEmpty ? 'var(--ink-4)' : 'inherit' }}>
        {isEmpty ? '—' : value}
      </div>
    </div>
  )
}

// Rich demo seed — includes variant and MLD scenarios
const SEED_OVERRIDES = {
  'SC-05123': { variant: 'ATORV-ACT', mld: '5' },
  'SC-08612': { variant: 'METF-BRI',  mld: '' },
  'SC-04128': { variant: '',           mld: '3' },
  'SC-07811': { variant: '',           mld: '' },
}

function seedOrder(o) {
  if (!o) return null
  const sampleNotes = ['Earliest expiry date required', 'Short-dated stock acceptable', null, null, null, null, null, null]
  // Cherry-pick SKUs to ensure variant + MLD products appear
  const priority = ['SC-04128', 'SC-07811', 'SC-05010', 'SC-05011', 'SC-05123', 'SC-06502', 'SC-08612', 'SC-07815']
  const skus = priority.slice(0, Math.min(o.lines, 8))
  const seedLines = skus.map((sku, i) => {
    const p = CATALOGUE.find(c => c.sku === sku) || CATALOGUE[i]
    const overrides = SEED_OVERRIDES[p.sku] || {}
    return {
      sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo,
      unit: p.promo ?? p.msp, qty: Math.max(1, (i + 1) * 2),
      description: sampleNotes[i] || '', stock: p.stock, stockState: p.stockState,
      variant: overrides.variant ?? '', mld: overrides.mld ?? '',
    }
  })
  return { ...o, lines: seedLines, description: o.note || '', poNumber: o.poNumber || '', shipDate: o.shipDate || '', agent: o.agent || 'DPDP-NXT', manualPick: { enabled: false, reasonCode: '', note: '' } }
}

export default function OrderView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId } = useParams()
  const order = location.state?.order
  const orderIds = location.state?.orderIds ?? []
  const orderIndex = location.state?.orderIndex ?? -1

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const client = HOSPITAL_CLIENTS.find(c => c.id === order?.clientId)
  const agentLabel = SHIPPING_AGENTS.find(a => a.code === order?.agent)?.label

  const prevId = orderIndex > 0 ? orderIds[orderIndex - 1] : null
  const nextId = orderIndex >= 0 && orderIndex < orderIds.length - 1 ? orderIds[orderIndex + 1] : null

  function goToOrder(id, newIndex) {
    const raw = ORDERS_SEED.find(o => o.id === id)
    if (!raw || raw.status === 'draft') return
    const seeded = seedOrder(raw)
    navigate(`/orders/${id}/view`, { state: { order: seeded, orderIds, orderIndex: newIndex } })
  }

  if (!order) {
    return (
      <div className="page__body">
        <div className="empty">
          <h3>Order not found.</h3>
          <p><a style={{ cursor: 'pointer', color: 'var(--ink-3)' }} onClick={() => navigate('/')}>Back to orders</a></p>
        </div>
      </div>
    )
  }

  const isPending = order.status === 'pending-approval'

  const lines = order.lines || []
  const hasVariants = lines.some(l => l.variant)
  const hasMld = lines.some(l => l.mld && parseFloat(l.mld) > 0)
  const subtotal = lines.reduce((s, l) => s + (l.unit ?? l.msp) * l.qty, 0)
  const mldDiscount = lines.reduce((s, l) => {
    const pct = parseFloat(l.mld)
    if (!pct || pct <= 0) return s
    return s + (l.unit ?? l.msp) * l.qty * (pct / 100)
  }, 0)
  const total = order.total ?? (subtotal - mldDiscount)

  const manualPickText = order.manualPick?.enabled
    ? `Yes — ${order.manualPick.reasonCode || 'No reason code'}${order.manualPick.note ? ` · "${order.manualPick.note}"` : ''}`
    : 'No — automated DC fulfilment'

  function handleApprove() {
    navigate('/', { state: { approvedId: orderId } })
  }

  function handleReject() {
    navigate('/', { state: { rejectedId: orderId, rejectionNote: rejectNote.trim() || null } })
  }

  return (
    <div className="page__body page__body--wide">

      {/* Breadcrumb */}
      <div className="crumbs">
        <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Orders</a>
        <Icon name="chevron-right" size={12} className="crumbs__sep" />
        <span style={{ color: 'var(--ink-2)' }}>{orderId}</span>
      </div>

      {/* Page header */}
      <div className="page-h">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 className="page-h__title" style={{ marginBottom: 0 }}>{orderId}</h1>
            <StatusBadge status={order.status} />
          </div>
          <div className="page-h__sub">
            <span>{client?.name}{client?.postcode && ` (${client.postcode})`}</span>
            {client && <span style={{ margin: '0 6px', color: 'var(--ink-4)' }}>·</span>}
            <span className="mono">{client?.code}</span>
            {order.placed && <><span style={{ margin: '0 6px', color: 'var(--ink-4)' }}>·</span><span>Placed {order.placed}</span></>}
          </div>
        </div>
        <div className="row gap-8">
          {isPending && (
            <>
              <button className="btn btn--primary" onClick={handleApprove}>
                <Icon name="check" size={14} /> Approve order
              </button>
              <button
                className="btn"
                style={{ color: 'var(--bad)', borderColor: 'rgba(220,38,38,0.3)' }}
                onClick={() => { setRejectModalOpen(true); setRejectNote('') }}
              >
                Reject order
              </button>
            </>
          )}
          <button className="btn" onClick={() => navigate('/')}>
            <Icon name="back" size={14} /> Back to orders
          </button>
          {orderIds.length > 1 && (
            <div className="row gap-0" style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <button
                className="btn"
                disabled={!prevId}
                onClick={() => goToOrder(prevId, orderIndex - 1)}
                style={{ borderRadius: 0, border: 'none', borderRight: '1px solid var(--border)', padding: '0 10px', height: 32 }}
                title="Previous order"
              >
                <Icon name="chevron-left" size={14} />
              </button>
<button
                className="btn"
                disabled={!nextId}
                onClick={() => goToOrder(nextId, orderIndex + 1)}
                style={{ borderRadius: 0, border: 'none', borderLeft: '1px solid var(--border)', padding: '0 10px', height: 32 }}
                title="Next order"
              >
                <Icon name="chevron-right" size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection modal */}
      {rejectModalOpen && (
        <div className="scrim">
          <div className="modal">
            <div className="modal__head">
              <div className="row between">
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>Reject order</div>
                  <h2>Reject {orderId}</h2>
                </div>
                <button className="btn btn--ghost btn--icon" onClick={() => setRejectModalOpen(false)}><Icon name="x" size={16} /></button>
              </div>
            </div>
            <div className="modal__body">
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 16 }}>
                The submitter will be notified that this order has been rejected.
              </div>
              <div className="field">
                <div className="field__label">Why was this rejected? <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></div>
                <textarea
                  className="input"
                  autoFocus
                  rows={6}
                  placeholder="The more detail you provide, the easier it will be for the submitter to correct and resubmit the order."
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  style={{ width: '100%', fontSize: 13.5, resize: 'vertical', fontFamily: 'inherit', height: 200, padding: 20 }}
                />
              </div>
            </div>
            <div className="modal__foot">
              <div />
              <div className="row gap-8">
                <button className="btn" onClick={() => { setRejectModalOpen(false); setRejectNote('') }}>Cancel</button>
                <button
                  className="btn"
                  style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
                  onClick={handleReject}
                >
                  Confirm rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="col gap-16">

        {/* Approver comment callout */}
        {order.status === 'pending-approval' && order.approverComment && (
          <div style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            background: '#faf5ff', border: '1px solid #e9d5ff',
            borderRadius: 10, padding: '14px 18px',
          }}>
            <div style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
              background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="edit" size={15} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7c3aed', marginBottom: 5 }}>Comment to approver</div>
              <div style={{ fontSize: 13.5, color: '#4c1d95', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{order.approverComment}</div>
            </div>
          </div>
        )}

        {/* Order metadata */}
        <div className="panel">
          <div className="panel__head">
            <h3 style={{ fontSize: 15 }}>Order details</h3>
          </div>
          <div style={{ padding: '0 24px 20px' }}>
            <MetaRow label="Order ID"           value={<span className="mono" style={{ fontWeight: 600 }}>{orderId}</span>} />
            <MetaRow label="Status"             value={<StatusBadge status={order.status} />} />
            <MetaRow label="Order type"         value={order.type === 'nrt' ? 'Nicotine Replacement Therapy (NRT)' : 'Hospital / Bulk / MLD'} />
            <MetaRow label="Client"             value={client ? `${client.code} — ${client.name}${client.postcode ? ` (${client.postcode})` : ''}` : null} />
            <MetaRow label="Placed"             value={order.placed} />
            <MetaRow label="PO number"          value={order.poNumber} />
            <MetaRow label="Order note"         value={order.description} />
            <MetaRow label="Required ship date" value={order.shipDate} />
            <MetaRow label="Shipping agent"     value={order.agent ? `${order.agent}${agentLabel ? ` — ${agentLabel}` : ''}` : null} />
            <MetaRow label="Manual picking"     value={manualPickText} />
          </div>
        </div>

        {/* Lines table */}
        <div className="panel">
          <div className="panel__head">
            <div>
              <h3 style={{ fontSize: 15 }}>Order lines</h3>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                {lines.length} {lines.length === 1 ? 'line' : 'lines'} · {lines.reduce((s, l) => s + l.qty, 0)} units
              </div>
            </div>
          </div>
          <div className="panel__body panel__body--flush">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product</th>
                  {hasVariants && <th>Variant</th>}
                  <th>Stock</th>
                  <th className="right">MSP</th>
                  <th className="right">Unit price</th>
                  {hasMld && <th className="right">MLD %</th>}
                  <th className="right">Qty</th>
                  <th className="right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(l => {
                  const mldPct = parseFloat(l.mld)
                  const hasMldOnLine = mldPct > 0
                  const lineUnit = l.unit ?? l.msp
                  const lineGross = lineUnit * l.qty
                  const lineTotal = hasMldOnLine ? lineGross * (1 - mldPct / 100) : lineGross
                  return (
                    <tr key={l.sku} style={{ background: hasMldOnLine ? 'rgba(16,185,129,0.06)' : undefined }}>
                      <td className="mono muted" style={{ fontSize: 12 }}>{l.sku}</td>
                      <td>
                        <div style={{ fontSize: 13.5 }}>{l.name}</div>
                        <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{l.pack}</div>
                        {l.description && (
                          <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                            <Icon name="edit" size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />{l.description}
                          </div>
                        )}
                      </td>
                      {hasVariants && (
                        <td className="mono" style={{ fontSize: 12, color: l.variant ? 'var(--ink-2)' : 'var(--ink-4)' }}>
                          {l.variant || '—'}
                        </td>
                      )}
                      <td><StockDot state={l.stockState} /></td>
                      <td className="right mono tnum" style={{ fontSize: 12.5 }}>{fmt(l.msp)}</td>
                      <td className="right mono tnum" style={{ fontSize: 12.5 }}>{fmt(lineUnit)}</td>
                      {hasMld && (
                        <td className="right mono tnum" style={{ fontSize: 12.5, color: hasMldOnLine ? 'rgb(16,185,129)' : 'var(--ink-4)' }}>
                          {hasMldOnLine ? `${mldPct}%` : '—'}
                        </td>
                      )}
                      <td className="right mono tnum">{l.qty}</td>
                      <td className="right mono tnum" style={{ fontWeight: 600 }}>{fmt(lineTotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Totals footer */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10, width: 320, marginLeft: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="muted">Subtotal</span>
                <span className="mono tnum muted">{fmt(subtotal)}</span>
              </div>
              {mldDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgb(16,185,129)' }}>MLD discount</span>
                  <span className="mono tnum" style={{ color: 'rgb(16,185,129)' }}>−{fmt(mldDiscount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="muted">VAT</span>
                <span className="muted" style={{ fontSize: 12 }}>Rated separately at invoice</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span>Order Total</span>
                <span className="mono tnum">{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
