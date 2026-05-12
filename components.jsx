/* Shared components for Sigma Connect prototype
   Exposed on window for cross-file babel scripts. */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- Icons (inline, greyscale) ---------- */
const Icon = ({ name, size = 16, className = "", style = {} }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", className, style };
  switch (name) {
    case "search":   return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "plus":     return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "minus":    return <svg {...props}><path d="M5 12h14"/></svg>;
    case "x":        return <svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case "chevron-down": return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>;
    case "chevron-right": return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>;
    case "chevron-left":  return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>;
    case "trash":    return <svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>;
    case "edit":     return <svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;
    case "filter":   return <svg {...props}><path d="M3 6h18M6 12h12M10 18h4"/></svg>;
    case "info":     return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>;
    case "alert":    return <svg {...props}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/></svg>;
    case "check":    return <svg {...props}><path d="m20 6-11 11-5-5"/></svg>;
    case "user":     return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "building": return <svg {...props}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h.01M9 11h.01M9 15h.01M15 7h.01M15 11h.01M15 15h.01"/></svg>;
    case "package":  return <svg {...props}><path d="m12 2 9 4.5v11L12 22 3 17.5v-11Z"/><path d="M3 7.5 12 12l9-4.5M12 22V12"/></svg>;
    case "doc":      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>;
    case "truck":    return <svg {...props}><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case "more":     return <svg {...props}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>;
    case "heart":    return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>;
    case "external": return <svg {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>;
    case "arrow-right": return <svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case "arrow-left":  return <svg {...props}><path d="M19 12H5M11 5l-7 7 7 7"/></svg>;
    case "back":     return <svg {...props}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
    case "switch":   return <svg {...props}><path d="M21 7H3l4-4M3 17h18l-4 4"/></svg>;
    case "lock":     return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "save":     return <svg {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>;
    default: return null;
  }
};

/* ---------- Header ---------- */
function AppHeader({ active = "orders", clientName = null, onNav, onLogoClick }) {
  return (
    <header className="app-header" data-screen-label="App header">
      <div className="app-header__logo" onClick={onLogoClick} style={{cursor:"pointer"}}>
        <span className="logo-mark">S</span>
        <span>Sigma Connect</span>
      </div>
      <nav className="app-header__nav">
        <a className={active === "orders"   ? "active" : ""} onClick={() => onNav && onNav("orders")}>Orders</a>
        <a className={active === "catalogue"? "active" : ""} onClick={() => onNav && onNav("catalogue")}>Catalogue</a>
        <a className={active === "clients"  ? "active" : ""} onClick={() => onNav && onNav("clients")}>Clients</a>
        <a className={active === "reports"  ? "active" : ""} onClick={() => onNav && onNav("reports")}>Reports</a>
      </nav>
      <div className="app-header__client">
        {clientName && (
          <div className="client-chip" title="Acting on behalf of">
            <span className="client-chip__avatar">{clientName.split(" ").map(w => w[0]).slice(0,2).join("")}</span>
            <span className="client-chip__label">On behalf of</span>
            <span className="client-chip__name">{clientName}</span>
            <Icon name="chevron-down" size={14} style={{opacity:0.7}}/>
          </div>
        )}
        <div className="user-pill">
          <span className="user-pill__avatar">RA</span>
          <span>Rachel Adeyemi</span>
          <Icon name="chevron-down" size={14} style={{opacity:0.6}}/>
        </div>
      </div>
    </header>
  );
}

/* ---------- Footer ---------- */
function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__grid">
        <div>
          <div className="app-header__logo" style={{color:"#f0f0ec", marginBottom:14}}>
            <span className="logo-mark">S</span>
            <span>Sigma Connect</span>
          </div>
          <p style={{fontSize:12.5, lineHeight:1.55, maxWidth: 280}}>
            Internal ordering platform for Sigma Pharmaceuticals hospital channel. Orders placed here are routed directly into SAP for fulfilment.
          </p>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><a>Privacy Policy</a></li>
            <li><a>Terms &amp; Conditions of Sale</a></li>
            <li><a>Terms of Use</a></li>
            <li><a>Commercial Terms</a></li>
          </ul>
        </div>
        <div>
          <h4>Resources</h4>
          <ul>
            <li><a>Service updates <Icon name="external" size={11}/></a></li>
            <li><a>Drug device alerts <Icon name="external" size={11}/></a></li>
            <li><a>Recall notices</a></li>
            <li><a>Pricing schedules</a></li>
          </ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li><a>Customer services</a></li>
            <li><a>Order desk: 0800 014 0188</a></li>
            <li><a>orderdesk@sigma-pharma.example</a></li>
          </ul>
        </div>
      </div>
      <div className="app-footer__bottom">
        <span>© 2026 Sigma Pharmaceuticals PLC.</span>
        <span className="mono">v 4.18.2 — env: prod</span>
      </div>
    </footer>
  );
}

/* ---------- Stock indicator ---------- */
function StockDot({ state, n, hideValue = false }) {
  const cls = state === "ok" ? "status--ok" : state === "low" ? "status--low" : "status--out";
  const label = state === "ok" ? "In stock" : state === "low" ? "Low" : "Out of stock";
  return (
    <span className={"status " + cls} title={`${label} (${n} units)`}>
      <span className="status__dot"></span>
      <span className="tnum mono" style={{fontSize:11.5, color:"var(--ink-3)"}}>
        {hideValue ? label : (state === "out" ? "0" : window.fmtN(n))}
      </span>
    </span>
  );
}

/* ---------- Quantity stepper ---------- */
function Qty({ value, onChange, min = 1, max = 9999 }) {
  return (
    <div className="qty">
      <button className="qty__btn" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <input className="qty__input tnum" type="text" value={value}
             onChange={(e) => {
               const v = parseInt(e.target.value.replace(/\D/g, "") || "0", 10);
               onChange(Math.max(min, Math.min(max, v)));
             }} />
      <button className="qty__btn" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

/* ---------- Switch ---------- */
function Switch({ on, onChange, label, sub }) {
  return (
    <label className={"switch " + (on ? "is-on" : "")} onClick={() => onChange(!on)}>
      <span className="switch__track"><span className="switch__thumb"></span></span>
      {label && (
        <span>
          <span style={{fontWeight:500}}>{label}</span>
          {sub && <span className="muted" style={{display:"block", fontSize:12}}>{sub}</span>}
        </span>
      )}
    </label>
  );
}

/* ---------- Modal scrim ---------- */
function Modal({ children, onClose, size }) {
  return (
    <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className={"modal " + (size === "lg" ? "modal--lg" : "")}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Pagination ---------- */
function Pager({ page, totalPages, onChange }) {
  return (
    <div className="pager">
      <button className="pager__btn" disabled={page <= 1} onClick={() => onChange(page - 1)}><Icon name="chevron-left" size={14}/></button>
      <span>Page <b className="mono">{page}</b> of <b className="mono">{totalPages}</b></span>
      <button className="pager__btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}><Icon name="chevron-right" size={14}/></button>
    </div>
  );
}

/* ---------- Badge ---------- */
function StatusBadge({ status }) {
  const map = {
    submitted:  { cls: "badge--ok",    label: "Submitted" },
    "on-hold":  { cls: "badge--warn",  label: "On hold" },
    rejected:   { cls: "badge--bad",   label: "Rejected" },
    draft:      { cls: "badge--draft", label: "Draft" },
    fulfilled:  { cls: "badge--ok",    label: "Fulfilled" },
  };
  const m = map[status] || { cls: "", label: status };
  return <span className={"badge " + m.cls}>{m.label}</span>;
}

/* ---------- export ---------- */
Object.assign(window, {
  Icon, AppHeader, AppFooter, StockDot, Qty, Switch, Modal, Pager, StatusBadge
});
