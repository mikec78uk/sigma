export default function Switch({ on, onChange, label, sub }) {
  return (
    <label className={'switch ' + (on ? 'is-on' : '')} onClick={() => onChange(!on)}>
      <span className="switch__track"><span className="switch__thumb" /></span>
      {label && (
        <span>
          <span style={{ fontWeight: 500 }}>{label}</span>
          {sub && <span className="muted" style={{ display: 'block', fontSize: 12 }}>{sub}</span>}
        </span>
      )}
    </label>
  )
}
