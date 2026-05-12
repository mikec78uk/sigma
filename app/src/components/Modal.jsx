export default function Modal({ children, onClose, size }) {
  return (
    <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className={'modal ' + (size === 'lg' ? 'modal--lg' : '')}>
        {children}
      </div>
    </div>
  )
}
