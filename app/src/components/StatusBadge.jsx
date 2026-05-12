export default function StatusBadge({ status }) {
  const map = {
    submitted:          { cls: 'badge--ok',   label: 'Submitted'        },
    'on-hold':          { cls: 'badge--warn', label: 'On hold'          },
    rejected:           { cls: 'badge--bad',  label: 'Rejected'         },
    draft:              { cls: 'badge--draft',label: 'Draft'            },
    fulfilled:          { cls: 'badge--ok',   label: 'Fulfilled'        },
    'pending-approval': { cls: '',            label: 'Pending approval', style: { background: '#ede9fe', color: '#5b21b6', borderColor: '#c4b5fd', whiteSpace: 'nowrap' } },
  }
  const m = map[status] || { cls: '', label: status }
  return <span className={'badge ' + m.cls} style={m.style}>{m.label}</span>
}
