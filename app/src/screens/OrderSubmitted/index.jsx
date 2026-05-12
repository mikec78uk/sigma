import { useNavigate, useLocation } from 'react-router-dom'
import { HOSPITAL_CLIENTS } from '../../data'
import { fmt } from '../../utils/format'
import Icon from '../../components/Icon'

function Row({ label, value, mono }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="label" style={{ minWidth: 180, paddingTop: 1 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 13.5, ...(mono ? { fontFamily: 'var(--font-mono)', fontWeight: 600 } : {}) }}>
        {value}
      </div>
    </div>
  )
}

export default function OrderSubmitted() {
  const navigate = useNavigate()
  const location = useLocation()
  const order = location.state?.order

  const client = HOSPITAL_CLIENTS.find(c => c.id === order?.clientId)
  const orderId = useLocation().pathname.split('/')[2] || 'SO-2026-00000'

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

  const manualPickLabel = order.manualPick?.enabled
    ? `Yes — ${order.manualPick.reasonCode || 'No reason code'}${order.manualPick.note ? ` · "${order.manualPick.note}"` : ''}`
    : 'No — automated DC fulfilment'

  return (
    <div className="page__body">
      <div className="panel" style={{ maxWidth: 720, margin: '40px auto', padding: 8 }}>

        {/* Hero */}
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--ok-bg)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Icon name="check" size={28} style={{ color: 'var(--ok)' }} />
          </div>
          <h2>Order Submitted</h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
            Your order has been queued for fulfilment.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            <button className="btn" onClick={() => navigate('/')}>Back to orders</button>
            <button className="btn btn--primary" onClick={() => navigate('/orders/new')}>
              <Icon name="plus" size={14} /> Start another
            </button>
          </div>
        </div>

        {/* Order details */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 24px 32px' }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="label" style={{ marginBottom: 4, paddingTop: 16 }}>Order details</div>
            <Row label="Order ID"            value={orderId}                       mono />
            <Row label="Client"              value={client?.name} />
            <Row label="Lines"               value={order.lines?.length ?? 0} />
            <Row label="Total"               value={fmt(order.total)}              mono />
            <Row label="PO number"           value={order.poNumber} />
            <Row label="Order note"          value={order.description} />
            <Row label="Required ship date"  value={order.shipDate} />
            <Row label="Manual picking"      value={manualPickLabel} />
          </div>
        </div>

      </div>
    </div>
  )
}
