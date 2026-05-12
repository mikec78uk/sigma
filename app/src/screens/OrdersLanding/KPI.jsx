import Icon from '../../components/Icon'

function FormattedValue({ value }) {
  // Split currency values like £14,576.94 into main + pence
  const match = typeof value === 'string' && value.match(/^(£[\d,]+)(\.\d{2})$/)
  if (match) {
    return (
      <span>
        {match[1]}
        <span style={{ fontSize: '0.6em', fontWeight: 600, letterSpacing: 0, opacity: 0.7 }}>{match[2]}</span>
      </span>
    )
  }
  return <span>{value}</span>
}

export default function KPI({ label, value, sub, warn }) {
  return (
    <div className="panel" style={{ flex: 1, padding: '14px 18px' }}>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      <div className="row between" style={{ alignItems: 'baseline' }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
          <FormattedValue value={value} />
        </div>
        {warn && <Icon name="alert" size={16} style={{ color: 'var(--warn)' }} />}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>
    </div>
  )
}
