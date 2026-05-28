import { fmt, calcPricingBreakdown } from '../utils/format'

const SEP = (
  <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
)

export default function PricingBreakdown({ lines = [] }) {
  const { listTotal, discountTotal, mldTotal, manualTotal, subtotal, hasDiscount, hasMld, hasManual } = calcPricingBreakdown(lines)

  return (
    <div className="col" style={{ gap: 5 }}>

      {/* Section 1 — Unit price */}
      <div className="row between" style={{ alignItems: 'baseline' }}>
        <span className="muted" style={{ fontSize: 13 }}>Unit price</span>
        <span className="mono tnum muted" style={{ fontSize: 13 }}>{fmt(listTotal)}</span>
      </div>

      {SEP}

      {/* Section 2 — Reductions (only rows that apply) */}
      {hasDiscount && (
        <div className="row between" style={{ alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, color: '#059669' }}>Discount</span>
          <span className="mono tnum" style={{ fontSize: 13, color: '#059669' }}>−{fmt(discountTotal)}</span>
        </div>
      )}
      {hasMld && (
        <div className="row between" style={{ alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, color: '#059669' }}>MLD</span>
          <span className="mono tnum" style={{ fontSize: 13, color: '#059669' }}>−{fmt(mldTotal)}</span>
        </div>
      )}
      {hasManual && (
        <div className="row between" style={{ alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, color: '#059669' }}>Manual reductions</span>
          <span className="mono tnum" style={{ fontSize: 13, color: '#059669' }}>−{fmt(manualTotal)}</span>
        </div>
      )}
      {!hasDiscount && !hasMld && !hasManual && (
        <div className="row between" style={{ alignItems: 'baseline' }}>
          <span className="muted" style={{ fontSize: 13 }}>No reductions applied</span>
          <span className="mono tnum muted" style={{ fontSize: 13 }}>—</span>
        </div>
      )}

      {SEP}

      {/* Section 3 — Totals */}
      <div className="row between" style={{ alignItems: 'baseline' }}>
        <span className="muted" style={{ fontSize: 13 }}>Subtotal</span>
        <span className="mono tnum muted" style={{ fontSize: 13 }}>{fmt(subtotal)}</span>
      </div>
      <div className="row between" style={{ alignItems: 'baseline', marginTop: 2 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Order Total (exc. VAT)</span>
        <span className="mono tnum" style={{ fontWeight: 700, fontSize: 17 }}>{fmt(subtotal)}</span>
      </div>

    </div>
  )
}
