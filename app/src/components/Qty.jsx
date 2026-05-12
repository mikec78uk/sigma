export default function Qty({ value, onChange, min = 1, max = 9999 }) {
  return (
    <div className="qty">
      <button className="qty__btn" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <input
        className="qty__input tnum"
        type="text"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value.replace(/\D/g, '') || '0', 10)
          onChange(Math.max(min, Math.min(max, v)))
        }}
      />
      <button className="qty__btn" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  )
}
