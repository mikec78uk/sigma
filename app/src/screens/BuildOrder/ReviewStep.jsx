import { fmt } from '../../utils/format'
import Icon from '../../components/Icon'
import PricingBreakdown from '../../components/PricingBreakdown'

function ReviewKV({ label, value }) {
  return (
    <div style={{ minWidth: 200 }}>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div>{value}</div>
    </div>
  )
}

export default function ReviewStep({ order, client, onBack, onSubmit }) {

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
            <PricingBreakdown lines={order.lines || []} />
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
