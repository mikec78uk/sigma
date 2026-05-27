import { fmt, calcPricingBreakdown } from '../../utils/format'
import Icon from '../../components/Icon'

function ReviewKV({ label, value }) {
  return (
    <div style={{ minWidth: 200 }}>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div>{value}</div>
    </div>
  )
}

export default function ReviewStep({ order, client, onBack, onSubmit }) {
  const { contractTotal, mldTotal, manualTotal, hasMld, hasManual } = calcPricingBreakdown(order.lines || [])
  const subtotal = (order.lines || []).reduce((s, l) => s + l.unit * l.qty, 0)

  return (
    <div className="col gap-16">
      <div className="panel">
        <div className="panel__head"><h3>Review &amp; submit</h3></div>
        <div className="panel__body">
          <div className="row gap-24" style={{ flexWrap: 'wrap' }}>
            <ReviewKV label="Client ID"      value={client?.code} />
            <ReviewKV label="Client"         value={`${client?.name}${client?.postcode ? ` (${client.postcode})` : ''}`} />
            <ReviewKV label="Order type"     value="Hospital" />
            <ReviewKV label="Shipping agent" value={order.agent || '—'} />
            <ReviewKV label="Lines / units"  value={`${order.lines.length} / ${order.lines.reduce((s, l) => s + l.qty, 0)}`} />
            <ReviewKV label="Manual picking" value={order.manualPick?.enabled ? `Yes — ${order.manualPick.reasonCode || '—'}` : 'No'} />
          </div>

          {/* Pricing breakdown */}
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div className="col" style={{ gap: 6 }}>
              <div className="row between" style={{ alignItems: 'baseline' }}>
                <span className="muted" style={{ fontSize: 13 }}>Contract price</span>
                <span className="mono tnum muted" style={{ fontSize: 13 }}>{fmt(contractTotal)}</span>
              </div>
              {hasMld && (
                <div className="row between" style={{ alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, color: '#059669' }}>MLD discount</span>
                  <span className="mono tnum" style={{ fontSize: 13, color: '#059669' }}>−{fmt(mldTotal)}</span>
                </div>
              )}
              {hasManual && (
                <div className="row between" style={{ alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, color: '#059669' }}>Manual reductions</span>
                  <span className="mono tnum" style={{ fontSize: 13, color: '#059669' }}>−{fmt(manualTotal)}</span>
                </div>
              )}
              <div className="row between" style={{ alignItems: 'baseline', marginTop: (hasMld || hasManual) ? 2 : 0, paddingTop: (hasMld || hasManual) ? 6 : 0, borderTop: (hasMld || hasManual) ? '1px solid var(--border)' : 'none' }}>
                <span className="muted" style={{ fontSize: 13 }}>Subtotal</span>
                <span className="mono tnum muted" style={{ fontSize: 13 }}>{fmt(subtotal)}</span>
              </div>
              <div className="row between" style={{ alignItems: 'baseline' }}>
                <span className="muted" style={{ fontSize: 13 }}>VAT</span>
                <span className="muted" style={{ fontSize: 12 }}>Rated separately at invoice</span>
              </div>
              <div className="row between" style={{ alignItems: 'baseline', marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Order Total</span>
                <span className="mono tnum" style={{ fontWeight: 700, fontSize: 17 }}>{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {order.description && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--surface-2)', borderRadius: 6, fontSize: 13 }}>
              <div className="label" style={{ marginBottom: 4 }}>Order note</div>
              {order.description}
            </div>
          )}
        </div>
      </div>
      <div className="row between">
        <button className="btn" onClick={onBack}><Icon name="back" size={14} /> Back</button>
        <button className="btn btn--primary btn--lg" onClick={onSubmit}>Submit order <Icon name="arrow-right" size={15} /></button>
      </div>
    </div>
  )
}
