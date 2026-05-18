import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HOSPITAL_CLIENTS } from '../../data'
import Modal from '../../components/Modal'
import Icon from '../../components/Icon'
import TypeBadge from '../../components/TypeBadge'

export default function NewOrderModal() {
  const navigate = useNavigate()
  const [clientId, setClientId] = useState('')
  const [q, setQ] = useState('')

  const clients = HOSPITAL_CLIENTS.filter(c =>
    !q.trim() ||
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.code.toLowerCase().includes(q.toLowerCase()) ||
    (c.postcode || '').toLowerCase().includes(q.toLowerCase())
  )

  const selectedClient = HOSPITAL_CLIENTS.find(c => c.id === clientId)

  function handleStart() {
    if (!selectedClient) return
    const type = selectedClient.type ?? 'hospital'
    const draftId = 'DR-2026-00' + Math.floor(300 + Math.random() * 99)
    navigate(`/orders/${draftId}/build`, {
      state: {
        order: {
          draftId,
          clientId,
          type,
          status: 'draft',
          lines: [],
          description: '',
          agent: 'DPDP-NXT',
          manualPick: { enabled: false, reasonCode: '', note: '' },
        },
      },
    })
  }

  return (
    <Modal onClose={() => navigate('/')} size="lg">
      <div className="modal__head">
        <div className="row between">
          <div>
            <div className="label" style={{ marginBottom: 4 }}>New order</div>
            <h2>Select a client account</h2>
          </div>
          <button className="btn btn--ghost btn--icon" onClick={() => navigate('/')}><Icon name="x" size={16} /></button>
        </div>
      </div>

      <div className="modal__body">
        <div className="field" style={{ marginBottom: 14 }}>
          <div className="field__label">Client account</div>
          <div className="search">
            <span className="search__icon"><Icon name="search" size={15} /></span>
            <input
              autoFocus
              className="input"
              placeholder="Search by hospital name or account code…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
        </div>
        <div style={{ minHeight: 320, maxHeight: 320, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
          {clients.map(c => (
            <div
              key={c.id}
              onClick={() => setClientId(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '13px 16px', cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                background: clientId === c.id ? 'var(--surface-2)' : 'transparent',
              }}
              onMouseEnter={e => { if (clientId !== c.id) e.currentTarget.style.background = 'var(--surface)' }}
              onMouseLeave={e => { if (clientId !== c.id) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Account code */}
              <span className="mono muted" style={{ fontSize: 12, flexShrink: 0, width: 64 }}>{c.code}</span>

              {/* Name + sub */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                {c.postcode && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{c.postcode} · {c.region}</div>}
              </div>

              {/* Type badge + check */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {c.type && <TypeBadge type={c.type} />}
                {clientId === c.id
                  ? <Icon name="check" size={16} style={{ color: 'var(--ink)' }} />
                  : <span style={{ width: 16 }} />
                }
              </div>
            </div>
          ))}
          {clients.length === 0 && <div className="empty">No clients match &ldquo;{q}&rdquo;.</div>}
        </div>
      </div>

      <div className="modal__foot">
        <div className="muted" style={{ fontSize: 12.5 }}>
          {selectedClient
            ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Building a</span>
                <TypeBadge type={selectedClient.type} />
                <span>order for <b style={{ color: 'var(--ink-2)' }}>{selectedClient.name}</b></span>
              </span>
            )
            : 'Pick a client account to continue'
          }
        </div>
        <div className="row gap-8">
          <button className="btn" onClick={() => navigate('/')}>Cancel</button>
          <button className="btn btn--primary" disabled={!clientId} onClick={handleStart}>
            Start order <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
    </Modal>
  )
}
