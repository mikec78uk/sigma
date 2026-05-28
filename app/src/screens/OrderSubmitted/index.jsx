import { useNavigate, useLocation } from 'react-router-dom'
import { HOSPITAL_CLIENTS } from '../../data'
import { fmt } from '../../utils/format'
import PricingBreakdown from '../../components/PricingBreakdown'
import Icon from '../../components/Icon'

export default function OrderSubmitted() {
  const navigate = useNavigate()
  const location = useLocation()
  const order = location.state?.order

  const client = HOSPITAL_CLIENTS.find(c => c.id === order?.clientId)
  const orderId = useLocation().pathname.split('/')[2] || 'DR-2026-00000'

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

  const needsApproval = true

  const now = new Date()
  const placedAt = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }).toUpperCase()
    + ', ' + now.toLocaleDateString('en-GB')


  return (
    <div className="page__body">
      <div className="panel" style={{ maxWidth: 760, margin: '40px auto' }}>

        {/* Header */}
        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, marginBottom: 16 }}>
              Your Order #{orderId} has been {needsApproval ? 'submitted for approval' : 'submitted'}
            </h2>
            <div className="label" style={{ marginBottom: 4 }}>Order reference</div>
            <div style={{ fontSize: 13.5 }}>{order.description || '—'}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="label" style={{ marginBottom: 4 }}>Order placed</div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{placedAt}</div>
            <div style={{ marginTop: 16 }}>
              <div className="label" style={{ marginBottom: 4 }}>Client</div>
              <div style={{ fontSize: 13.5 }}>{client?.name || '—'}</div>
            </div>
          </div>
        </div>

        {/* Approval callout */}
        <div style={{ margin: '0 32px', marginTop: 20, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon name="alert" size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: '#92400e' }}>
              <span style={{ fontWeight: 600 }}>Reason for approval: </span>
              {client?.name || 'This client'} has currently exceeded their credit limit.
            </div>
          </div>
          {order.approverComment && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #fde68a' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: '#92400e', marginBottom: 5 }}>Comment to approver</div>
              <div style={{ fontSize: 13, color: '#78350f', whiteSpace: 'pre-wrap' }}>{order.approverComment}</div>
            </div>
          )}
        </div>

        {/* Products table */}
        <div style={{ marginTop: needsApproval ? 20 : 0 }}>
          {/* Column headers */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 32px', borderTop: needsApproval ? '1px solid var(--border)' : undefined, borderBottom: '1px solid var(--border)', gap: 14 }}>
            <div className="label" style={{ flex: 1 }}>{order.lines?.length ?? 0} product{order.lines?.length !== 1 ? 's' : ''}</div>
            <div className="label" style={{ width: 100, textAlign: 'right' }}>Pack</div>
            <div className="label" style={{ width: 60, textAlign: 'right' }}>Qty</div>
            <div className="label" style={{ width: 90, textAlign: 'right' }}>Price</div>
          </div>

          {/* Product rows */}
          {(order.lines || []).map(l => (
            <div key={l.lineId ?? l.sku} style={{ display: 'flex', alignItems: 'center', padding: '12px 32px', borderBottom: '1px solid var(--border)', gap: 14 }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--ink-2)' }}>{l.name}</div>
              <div style={{ width: 100, textAlign: 'right', fontSize: 13, color: 'var(--ink-3)' }}>{l.pack || '—'}</div>
              <div className="mono tnum" style={{ width: 60, textAlign: 'right', fontSize: 13 }}>{l.qty.toFixed(2)}</div>
              <div className="mono tnum" style={{ width: 90, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{fmt(l.unit * l.qty)}</div>
            </div>
          ))}

          {/* Pricing breakdown */}
          <div style={{ padding: '14px 32px' }}>
            <PricingBreakdown lines={order.lines || []} />
          </div>
        </div>

        {/* Footer buttons */}
        <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => navigate('/')}>Back to orders</button>
          <button className="btn btn--primary" onClick={() => navigate('/orders/new')}>
            <Icon name="plus" size={14} /> Start another
          </button>
        </div>

      </div>
    </div>
  )
}
