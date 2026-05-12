import { useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { HOSPITAL_CLIENTS, SHIPPING_AGENTS } from '../../data'
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

export default function OrderView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId } = useParams()
  const order = location.state?.order

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const client = HOSPITAL_CLIENTS.find(c => c.id === order?.clientId)
  const agentLabel = SHIPPING_AGENTS.find(a => a.code === order?.agent)?.label

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
  const subtotal = lines.reduce((s, l) => s + (l.unit ?? l.msp) * l.qty, 0)
  const total = order.total ?? subtotal

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
            <span>{client?.name}</span>
            {client && <span style={{ margin: '0 6px', color: 'var(--ink-4)' }}>·</span>}
            <span className="mono">{client?.code}</span>
            {order.placed && <><span style={{ margin: '0 6px', color: 'var(--ink-4)' }}>·</span><span>Placed {order.placed}</span></>}
          </div>
        </div>
        <div className="row gap-8">
          {isPending && (
            <>
              <button
                className="btn btn--primary"
                onClick={handleApprove}
              >
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

        {/* Order metadata */}
        <div className="panel">
          <div className="panel__head">
            <h3 style={{ fontSize: 15 }}>Order details</h3>
          </div>
          <div style={{ padding: '0 24px 20px', maxWidth: 600 }}>
            <MetaRow label="Order ID"           value={<span className="mono" style={{ fontWeight: 600 }}>{orderId}</span>} />
            <MetaRow label="Status"             value={<StatusBadge status={order.status} />} />
            <MetaRow label="Client"             value={client ? `${client.name} (${client.code})` : null} />
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
                  <th>Pack</th>
                  <th>Stock</th>
                  <th className="right">MSP</th>
                  <th className="right">Unit price</th>
                  <th className="right">Qty</th>
                  <th className="right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(l => (
                  <tr key={l.sku}>
                    <td className="mono muted" style={{ fontSize: 12 }}>{l.sku}</td>
                    <td>
                      <div style={{ fontSize: 13.5 }}>{l.name}</div>
                      {l.description && (
                        <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                          <Icon name="edit" size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />{l.description}
                        </div>
                      )}
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>{l.pack}</td>
                    <td><StockDot state={l.stockState} /></td>
                    <td className="right mono tnum" style={{ fontSize: 12.5 }}>{fmt(l.msp)}</td>
                    <td className="right mono tnum" style={{ fontSize: 12.5 }}>{fmt(l.unit ?? l.msp)}</td>
                    <td className="right mono tnum">{l.qty}</td>
                    <td className="right mono tnum" style={{ fontWeight: 600 }}>{fmt((l.unit ?? l.msp) * l.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals footer */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
              <div style={{ display: 'flex', gap: 48, fontSize: 13 }}>
                <span className="muted">Subtotal</span>
                <span className="mono tnum muted">{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', gap: 48, fontSize: 13 }}>
                <span className="muted">VAT</span>
                <span className="muted" style={{ fontSize: 12 }}>Rated separately at invoice</span>
              </div>
              <div style={{ display: 'flex', gap: 48, fontSize: 15, fontWeight: 700, paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 2 }}>
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
