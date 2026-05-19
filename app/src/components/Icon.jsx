export default function Icon({ name, size = 16, className = '', style = {} }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.6,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className, style,
  }
  switch (name) {
    case 'search':        return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    case 'plus':          return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>
    case 'minus':         return <svg {...props}><path d="M5 12h14"/></svg>
    case 'x':             return <svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>
    case 'chevron-down':  return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>
    case 'chevron-up':    return <svg {...props}><path d="m18 15-6-6-6 6"/></svg>
    case 'chevron-right': return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>
    case 'chevron-left':  return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>
    case 'trash':         return <svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>
    case 'edit':          return <svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
    case 'filter':        return <svg {...props}><path d="M3 6h18M6 12h12M10 18h4"/></svg>
    case 'info':          return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
    case 'alert':         return <svg {...props}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/></svg>
    case 'check':         return <svg {...props}><path d="m20 6-11 11-5-5"/></svg>
    case 'user':          return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'building':      return <svg {...props}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h.01M9 11h.01M9 15h.01M15 7h.01M15 11h.01M15 15h.01"/></svg>
    case 'package':       return <svg {...props}><path d="m12 2 9 4.5v11L12 22 3 17.5v-11Z"/><path d="M3 7.5 12 12l9-4.5M12 22V12"/></svg>
    case 'doc':           return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
    case 'truck':         return <svg {...props}><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
    case 'more':          return <svg {...props}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
    case 'external':      return <svg {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>
    case 'arrow-right':   return <svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'arrow-left':    return <svg {...props}><path d="M19 12H5M11 5l-7 7 7 7"/></svg>
    case 'back':          return <svg {...props}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    case 'lock':          return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
    case 'save':          return <svg {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
    case 'download':      return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    case 'undo':          return <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" stroke="none" className={className} style={style}><path d="M5.53492 6.05H12.5C15.5376 6.05 18 8.51243 18 11.55C18 14.5876 15.5376 17.05 12.5 17.05H8.99731C8.44503 17.05 7.99731 16.6023 7.99731 16.05C7.99731 15.4977 8.44503 15.05 8.99731 15.05H12.5C14.433 15.05 16 13.483 16 11.55C16 9.617 14.433 8.05 12.5 8.05H5.53492L7.79246 10.3075C8.20251 10.7176 8.20251 11.3824 7.79246 11.7925C7.38241 12.2025 6.71759 12.2025 6.30754 11.7925L2.30754 7.79246C1.89749 7.38241 1.89749 6.71759 2.30754 6.30754L6.30754 2.30754C6.71759 1.89749 7.38241 1.89749 7.79246 2.30754C8.20251 2.71759 8.20251 3.38241 7.79246 3.79246L5.53492 6.05Z"/></svg>
    default:              return null
  }
}
