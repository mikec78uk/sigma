export default function StockDot({ state }) {
  const cls   = state === 'ok' ? 'status--ok' : state === 'low' ? 'status--low' : 'status--out'
  const label = state === 'ok' ? 'In stock'   : state === 'low' ? 'Low stock'   : 'Out of stock'
  return (
    <span className={'status ' + cls}>
      <span className="status__dot" />
      <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{label}</span>
    </span>
  )
}
