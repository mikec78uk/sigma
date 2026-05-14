import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HOSPITAL_CLIENTS, ORDER_TYPES } from '../../data'
import Modal from '../../components/Modal'
import Icon from '../../components/Icon'

export default function NewOrderModal() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(location.state?.preselectedClientId ? 2 : 1)
  const [clientId, setClientId] = useState(location.state?.preselectedClientId || '')
  const [type, setType] = useState(location.state?.preselectedType || 'hospital')
  const [q, setQ] = useState('')

  const clients = HOSPITAL_CLIENTS.filter(c =>
    !q.trim() ||
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.code.toLowerCase().includes(q.toLowerCase()) ||
    (c.postcode || '').toLowerCase().includes(q.toLowerCase())
  )

  const canContinue = clientId && type

  function handleStart() {
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
            <h2>Start a new order on behalf of a client</h2>
          </div>
          <button className="btn btn--ghost btn--icon" onClick={() => navigate('/')}><Icon name="x" size={16} /></button>
        </div>
        <div className="stepper" style={{ marginTop: 18 }}>
          <div className={'stepper__item ' + (step === 1 ? 'is-active' : 'is-done')}>
            <span className="stepper__num">{step > 1 ? '✓' : '1'}</span> Select client
          </div>
          <div className="stepper__sep" />
          <div className={'stepper__item ' + (step === 2 ? 'is-active' : (step > 2 ? 'is-done' : ''))}>
            <span className="stepper__num">2</span> Order type
          </div>
          <div className="stepper__sep" />
          <div className="stepper__item">
            <span className="stepper__num">3</span> Build order
          </div>
        </div>
      </div>

      <div className="modal__body">
        {step === 1 && (
          <>
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
                  className={'row gap-12 ' + (clientId === c.id ? 'is-selected' : '')}
                  style={{
                    padding: '12px 14px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: clientId === c.id ? '#f6f6f3' : 'transparent',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--surface-3)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="building" size={16} style={{ color: 'var(--ink-3)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500 }}><span className="mono" style={{ fontSize: 12, marginRight: 6 }}>{c.code}</span>{c.name}</div>
                    {c.postcode && <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{c.postcode}</div>}
                  </div>
                  {clientId === c.id && <Icon name="check" size={18} style={{ color: 'var(--ink)' }} />}
                </div>
              ))}
              {clients.length === 0 && <div className="empty">No clients match &ldquo;{q}&rdquo;.</div>}
            </div>
          </>
        )}

        {step === 2 && (
          <div className="col gap-12">
            <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
              Different order types route to different fulfilment paths and require different information.
            </div>
            {ORDER_TYPES.map(t => (
              <div
                key={t.id}
                className={'option ' + (type === t.id ? 'is-selected' : '') + (t.available ? '' : ' is-disabled')}
                onClick={() => t.available && setType(t.id)}
              >
                <span className="option__radio" />
                <div style={{ flex: 1 }}>
                  <div className="row between">
                    <div className="option__title">{t.title}</div>
                    {!t.available && <span className="badge"><Icon name="lock" size={11} /> Coming soon</span>}
                  </div>
                  <div className="option__desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="modal__foot">
        <div className="muted" style={{ fontSize: 12.5 }}>
          {step === 1 && (clientId
            ? <><span>Selected: </span><b style={{ color: 'var(--ink-2)' }}>{HOSPITAL_CLIENTS.find(c => c.id === clientId)?.name}</b></>
            : 'Pick a hospital account to continue'
          )}
          {step === 2 && (
            <>Building a <b style={{ color: 'var(--ink-2)' }}>{ORDER_TYPES.find(t => t.id === type)?.short ?? type}</b> order for <b style={{ color: 'var(--ink-2)' }}>{HOSPITAL_CLIENTS.find(c => c.id === clientId)?.name}</b></>
          )}
        </div>
        <div className="row gap-8">
          {step === 1 && <button className="btn" onClick={() => navigate('/')}>Cancel</button>}
          {step === 2 && <button className="btn" onClick={() => setStep(1)}><Icon name="back" size={14} /> Back</button>}
          {step === 1 && (
            <button className="btn btn--primary" disabled={!clientId} onClick={() => setStep(2)}>
              Continue <Icon name="arrow-right" size={14} />
            </button>
          )}
          {step === 2 && (
            <button className="btn btn--primary" disabled={!canContinue} onClick={handleStart}>
              Start order <Icon name="arrow-right" size={14} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
