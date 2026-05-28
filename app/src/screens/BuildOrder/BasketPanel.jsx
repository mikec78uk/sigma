import { useState } from 'react'
import { fmt } from '../../utils/format'
import PricingBreakdown from '../../components/PricingBreakdown'
import { SHIPPING_AGENTS, MANUAL_PICK_REASONS } from '../../data'
import Icon from '../../components/Icon'
import Switch from '../../components/Switch'
import BasketLine from './BasketLine'

function ExpandLink({ open, onToggle, openLabel, closedLabel, icon }) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        color: 'var(--ink-3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5,
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}
    >
      <Icon name={open ? 'chevron-up' : icon} size={12} />
      {open ? closedLabel : openLabel}
    </button>
  )
}

export default function BasketPanel({
  lines, setQty, removeLine,
  editLineId, setEditLineId,
  setUnit, setLineDesc,
  subtotal, total,
  orderDesc, setOrderDesc,
  poNumber, setPoNumber,
  shipDate, setShipDate,
  agent, setAgent,
  manualPick, setManualPick,
  onSubmit, onClear,
  orderType,
  showFoot, full,
  hideLines,
}) {
  const unitCount = lines.reduce((s, l) => s + l.qty, 0)
  const hasLines = lines.length > 0


  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <h3 style={{ fontSize: 15 }}>Order basket</h3>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
            {lines.length} {lines.length === 1 ? 'line' : 'lines'} · {unitCount} units
          </div>
        </div>
        {hasLines && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => {
              if (window.confirm('Clear all lines and reset the order?')) onClear?.()
            }}
          >
            Clear
          </button>
        )}
      </div>


      {!hasLines && (
        <div className="basket-empty">
          <Icon name="package" size={20} style={{ opacity: 0.4, marginBottom: 8 }} />
          <div>Your basket is empty.</div>
          <div className="muted-2" style={{ fontSize: 12, marginTop: 4 }}>Search and add products from the catalogue.</div>
        </div>
      )}

      {showFoot && hasLines && (
        <div className="basket-foot">

          {/* Order summary */}
          <PricingBreakdown lines={lines} />

          <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

          {/* PO number */}
          <div className="field" style={{ marginBottom: 12 }}>
            <div className="field__label">PO number</div>
            <input
              className="input"
              placeholder="e.g. PO-2026-00419"
              value={poNumber}
              onChange={e => setPoNumber(e.target.value)}
              style={{ fontSize: 12.5 }}
            />
          </div>

          {/* Order note */}
          <div className="field" style={{ marginBottom: 12 }}>
            <div className="field__label">Order note</div>
            <textarea
              className="textarea"
              placeholder="Add a note visible on the SAP order header…"
              value={orderDesc}
              onChange={e => setOrderDesc(e.target.value)}
              style={{ minHeight: 52, fontSize: 12.5 }}
            />
          </div>

          {/* Required ship date */}
          <div className="field" style={{ marginBottom: 12 }}>
            <div className="field__label">Required ship date</div>
            <input
              className="input"
              type="date"
              value={shipDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setShipDate(e.target.value)}
              style={{ fontSize: 12.5 }}
            />
          </div>

          {/* Shipping agent */}
          <div className="field" style={{ marginBottom: 12 }}>
            <div className="field__label">Shipping agent code</div>
            <select className="select" value={agent} onChange={e => setAgent(e.target.value)}>
              {SHIPPING_AGENTS.map(a => (
                <option key={a.code} value={a.code}>{a.code} — {a.label}</option>
              ))}
            </select>
          </div>

          {/* Manual picking */}
          <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', marginBottom: 14 }}>
            <Switch
              on={manualPick.enabled}
              onChange={v => setManualPick({ ...manualPick, enabled: v })}
              label="Request manual picking"
              sub={manualPick.enabled ? 'Your warehouse team will fulfil this order by hand.' : 'Default: automated DC fulfilment.'}
            />
            {manualPick.enabled && (
              <div className="col gap-8" style={{ marginTop: 10 }}>
                <div className="field">
                  <div className="field__label">Reason code</div>
                  <select
                    className="select"
                    value={manualPick.reasonCode}
                    onChange={e => setManualPick({ ...manualPick, reasonCode: e.target.value })}
                  >
                    <option value="">Select a reason…</option>
                    {MANUAL_PICK_REASONS.map(r => (
                      <option key={r.code} value={r.code}>{r.code} — {r.label}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <div className="field__label">Note to picker (optional)</div>
                  <textarea
                    className="textarea"
                    placeholder="e.g. Earliest expiry date required…"
                    value={manualPick.note}
                    onChange={e => setManualPick({ ...manualPick, note: e.target.value })}
                    style={{ minHeight: 48, fontSize: 12.5 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            className="btn btn--primary btn--lg"
            style={{ width: '100%' }}
            disabled={lines.length === 0 || (manualPick.enabled && !manualPick.reasonCode)}
            onClick={onSubmit}
          >
            Submit order <Icon name="arrow-right" size={15} />
          </button>
          {manualPick.enabled && !manualPick.reasonCode && (
            <div className="banner banner--warn" style={{ marginTop: 10 }}>
              <Icon name="alert" size={14} /> Pick a reason code to enable manual picking.
            </div>
          )}
        </div>
      )}

      {/* Line items below submit */}
      {hasLines && !hideLines && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {lines.map(l => (
            <BasketLine
              key={l.lineId}
              line={l}
              editing={editLineId === l.lineId}
              onToggleEdit={() => setEditLineId(editLineId === l.lineId ? null : l.lineId)}
              onQty={v => setQty(l.lineId, v)}
              onUnit={v => setUnit(l.lineId, v)}
              onDesc={v => setLineDesc(l.lineId, v)}
              onRemove={() => removeLine(l.lineId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
