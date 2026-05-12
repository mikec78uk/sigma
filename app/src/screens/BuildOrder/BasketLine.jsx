import { fmt } from '../../utils/format'
import Icon from '../../components/Icon'
import Qty from '../../components/Qty'

export default function BasketLine({ line, editing, onToggleEdit, onQty, onUnit, onDesc, onRemove }) {
  const below = line.unit < line.msp
  const discountPct = ((line.msp - line.unit) / line.msp) * 100

  return (
    <div className="line">
      <div className="line__row1">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="line__name">{line.name}</div>
          <div className="line__sku">{line.sku} · pack {line.pack}</div>
        </div>

        {/* Editable unit price — replaces the old price-edit block */}
        <div
          className={'line__total ' + (below ? 'is-below' : '')}
          style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 72, justifyContent: 'flex-end' }}
          title="Unit price — click to edit"
        >
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>£</span>
          <input
            className="tnum"
            type="text"
            value={line.unit.toFixed(2)}
            onChange={e => {
              const v = parseFloat(e.target.value.replace(/[^0-9.]/g, '') || '0')
              onUnit(Number.isFinite(v) ? v : 0)
            }}
            style={{
              width: 54, border: 'none', background: 'transparent', textAlign: 'right',
              fontWeight: 600, fontSize: 'inherit', padding: 0, outline: 'none',
              color: below ? 'var(--warn)' : 'inherit',
            }}
          />
        </div>
      </div>

      <div className="line__meta">
        <span><b>MSP</b> <span className="mono tnum">{fmt(line.msp)}</span></span>
        {line.promo && <span><b>Promo</b> <span className="mono tnum">{fmt(line.promo)}</span></span>}
        {line.unit !== (line.promo ?? line.msp) && (
          <span style={{ color: below ? 'var(--warn)' : 'var(--ok)' }}>
            {discountPct >= 0 ? `−${discountPct.toFixed(1)}%` : `+${Math.abs(discountPct).toFixed(1)}%`} vs MSP
          </span>
        )}
        <span className="muted" style={{ marginLeft: 'auto' }}>× {line.qty} = <b className="tnum">{fmt(line.unit * line.qty)}</b></span>
      </div>

      <div className="line__actions">
        <Qty value={line.qty} onChange={onQty} />
        <button className="btn btn--ghost btn--sm" onClick={onToggleEdit} title="Add note">
          <Icon name="edit" size={13} />
        </button>
        <button className="btn btn--danger-ghost btn--icon btn--sm" onClick={onRemove} title="Remove line">
          <Icon name="trash" size={13} />
        </button>
      </div>

      {below && (
        <div className="banner banner--warn" style={{ marginTop: 10, fontSize: 11.5 }}>
          <Icon name="alert" size={13} />
          Price <span className="mono tnum">{fmt(line.unit)}</span> is below minimum selling price <span className="mono tnum">{fmt(line.msp)}</span> — requires commercial approval.
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 10 }}>
          <div className="field">
            <div className="field__label">Line description (visible on picking note)</div>
            <textarea
              className="textarea"
              placeholder="e.g. For Ward 4B re-stock — earliest expiry preferred."
              value={line.description}
              onChange={e => onDesc(e.target.value)}
              style={{ minHeight: 52, fontSize: 12.5 }}
            />
          </div>
        </div>
      )}

      {!editing && line.description && (
        <div className="muted" style={{ marginTop: 8, fontSize: 12, paddingLeft: 8, borderLeft: '2px solid var(--border-strong)' }}>
          {line.description}
        </div>
      )}
    </div>
  )
}
