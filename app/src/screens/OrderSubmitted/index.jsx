import { useNavigate, useLocation } from 'react-router-dom'
import { HOSPITAL_CLIENTS } from '../../data'
import { fmt, calcPricingBreakdown } from '../../utils/format'
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

  const belowMspLines = (order.lines || []).filter(l => l.unit < l.msp - 0.001)
  const needsApproval = belowMspLines.length > 0

  const now = new Date()
  const placedAt = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }).toUpperCase()
    + ', ' + now.toLocaleDateString('en-GB')

  const { contractTotal, mldTotal, manualTotal, hasMld, hasManual, subtotal: orderSubtotal } = calcPricingBreakdown(order.lines || [])
  const orderTotal = orderSubtotal

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
        {needsApproval && (
          <div style={{ margin: '0 32px', marginTop: 20, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
              <Icon name="alert" size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontWeight: 600, fontSize: 13, color: '#92400e' }}>Lines requiring commercial approval</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {belowMspLines.map(l => (
                <div key={l.lineId ?? l.sku} style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 12.5 }}>
                  <span className="mono" style={{ fontSize: 11.5, color: '#92400e', flexShrink: 0 }}>{l.sku}</span>
                  <span style={{ flex: 1, color: '#78350f' }}>{l.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: '#92400e', flexShrink: 0 }}>
                    {fmt(l.unit)} <span style={{ opacity: 0.6 }}>vs MSP {fmt(l.msp)}</span>
                  </span>
                </div>
              ))}
            </div>
            {order.approverComment && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #fde68a' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: '#92400e', marginBottom: 5 }}>Comment to approver</div>
                <div style={{ fontSize: 13, color: '#78350f', whiteSpace: 'pre-wrap' }}>{order.approverComment}</div>
              </div>
            )}
          </div>
        )}

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
              <div style={{ width: 36, flexShrink: 0 }}>
                {l.dt === true && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', padding: '2px 6px', borderRadius: 4, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>DT</span>
                )}
                {l.dt === false && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', padding: '2px 6px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--ink-3)', border: '1px solid var(--border)' }}>ND</span>
                )}
              </div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--ink-2)' }}>{l.name}</div>
              <div style={{ width: 100, textAlign: 'right', fontSize: 13, color: 'var(--ink-3)' }}>{l.pack || '—'}</div>
              <div className="mono tnum" style={{ width: 60, textAlign: 'right', fontSize: 13 }}>{l.qty.toFixed(2)}</div>
              <div className="mono tnum" style={{ width: 90, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{fmt(l.unit * l.qty)}</div>
            </div>
          ))}

          {/* Pricing breakdown */}
          <div style={{ padding: '14px 32px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="muted" style={{ fontSize: 13 }}>Contract price</span>
              <span className="mono tnum muted" style={{ fontSize: 13 }}>{fmt(contractTotal)}</span>
            </div>
            {hasMld && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: '#059669' }}>MLD discount</span>
                <span className="mono tnum" style={{ fontSize: 13, color: '#059669' }}>−{fmt(mldTotal)}</span>
              </div>
            )}
            {hasManual && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: '#059669' }}>Manual reductions</span>
                <span className="mono tnum" style={{ fontSize: 13, color: '#059669' }}>−{fmt(manualTotal)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: (hasMld || hasManual) ? 2 : 0, paddingTop: (hasMld || hasManual) ? 6 : 0, borderTop: (hasMld || hasManual) ? '1px solid var(--border)' : 'none' }}>
              <span className="muted" style={{ fontSize: 13 }}>Subtotal</span>
              <span className="mono tnum muted" style={{ fontSize: 13 }}>{fmt(orderTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="muted" style={{ fontSize: 13 }}>VAT</span>
              <span className="muted" style={{ fontSize: 12 }}>Rated separately at invoice</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Order Total</span>
              <span className="mono tnum" style={{ fontWeight: 700, fontSize: 17 }}>{fmt(orderTotal)}</span>
            </div>
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
