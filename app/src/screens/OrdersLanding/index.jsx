import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useMatch, useLocation } from 'react-router-dom'
import { ORDERS_SEED, HOSPITAL_CLIENTS, CATALOGUE, NRT_CATALOGUE } from '../../data'
import { fmt } from '../../utils/format'
import Icon from '../../components/Icon'
import Pager from '../../components/Pager'
import StatusBadge from '../../components/StatusBadge'
import SearchSelect from '../../components/SearchSelect'
import KPI from './KPI'
import NewOrderModal from '../NewOrderModal'
import Toast from '../../components/Toast'

// Persists orders state across navigations (remounts reset useState)
let _persistedOrders = null

export default function OrdersLanding() {
  const navigate = useNavigate()
  const location = useLocation()
  const showNewModal = !!useMatch('/orders/new')

  // Local order state so approve/reject mutations work in-prototype
  const [orders, setOrders] = useState(() => _persistedOrders ?? ORDERS_SEED)

  // Keep persisted copy in sync
  useEffect(() => { _persistedOrders = orders }, [orders])

  // Guard against React Strict Mode double-firing the effect
  const processedState = useRef(null)

  // Handle approve/reject/save results navigated back from other screens
  useEffect(() => {
    const state = location.state
    if (!state || state === processedState.current) return
    processedState.current = state

    const { approvedId, rejectedId, rejectionNote, savedDraft } = state
    if (approvedId) {
      setOrders(prev => prev.map(o => o.id === approvedId ? { ...o, status: 'submitted' } : o))
      addToast(`Order ${approvedId} has been approved and submitted.`, 'success')
      navigate('/', { replace: true, state: null })
    } else if (rejectedId) {
      setOrders(prev => prev.map(o => o.id === rejectedId ? { ...o, status: 'rejected', rejectionNote: rejectionNote || null } : o))
      addToast(`Order ${rejectedId} has been rejected and the submitter has been informed.`, 'error')
      navigate('/', { replace: true, state: null })
    } else if (savedDraft) {
      addToast(`Draft ${savedDraft} saved successfully.`, 'success')
      navigate('/', { replace: true, state: null })
    }
  }, [location.state])

  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [clientFilter, setClientFilter] = useState(null)
  const [timeframe, setTimeframe] = useState('last-30')
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Rejection modal state
  const [rejectModalId, setRejectModalId] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [hoveredRejection, setHoveredRejection] = useState(null)
  const [hoveredApproverComment, setHoveredApproverComment] = useState(null)
  // Toast stack: [{ id, message, type }]
  const [toasts, setToasts] = useState([])
  function addToast(message, type = 'success') {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
  }
  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function SortCaret({ col }) {
    if (sortCol !== col) return <span style={{ marginLeft: 3, opacity: 0.25, fontSize: 9, verticalAlign: 'middle' }}>⬍</span>
    return <span style={{ marginLeft: 3, fontSize: 9, verticalAlign: 'middle', color: 'var(--ink-2)' }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
  }

  const TIMEFRAMES = [
    { value: 'last-30',  label: 'Last 30 days' },
    { value: 'last-90',  label: 'Last 90 days' },
    { value: 'last-180', label: 'Last 6 months' },
    { value: 'last-365', label: 'Last 12 months' },
    { value: 'all',      label: 'All time' },
  ]

  function getTimeframeCutoff(tf) {
    if (tf === 'all') return null
    const days = tf === 'last-30' ? 30 : tf === 'last-90' ? 90 : tf === 'last-180' ? 180 : 365
    return new Date(Date.now() - days * 86400000)
  }

  function approveOrder(id) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'submitted' } : o))
    addToast(`Order ${id} has been approved and submitted.`, 'success')
  }

  function rejectOrder(id) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected', rejectionNote: rejectNote.trim() || null } : o))
    addToast(`Order ${id} has been rejected and the submitter has been informed.`, 'error')
    setRejectModalId(null)
    setRejectNote('')
  }

  const selectedClient = clientFilter
    ? HOSPITAL_CLIENTS.find(c => c.id === clientFilter)
    : null

  // Orders scoped to the selected client (drives KPIs and tab counts)
  const scopedOrders = useMemo(() =>
    clientFilter
      ? orders.filter(o => o.clientId === clientFilter)
      : orders,
    [clientFilter, orders]
  )

  // KPI values update with client scope + timeframe
  const kpis = useMemo(() => {
    const cutoff = getTimeframeCutoff(timeframe)
    const tfLabel = TIMEFRAMES.find(t => t.value === timeframe)?.label.toLowerCase() ?? ''

    const pending = scopedOrders.filter(o => o.status === 'pending-approval')
    const pendingVal = pending.reduce((s, o) => s + o.total, 0)

    const submittedAll = scopedOrders.filter(o => o.status === 'submitted')
    const submitted = cutoff
      ? submittedAll.filter(o => new Date(o.placed) >= cutoff)
      : submittedAll
    const totalVal = submitted.reduce((s, o) => s + o.total, 0)

    const pendingSub = pending.length === 0
      ? 'no orders awaiting review'
      : `${pending.length === 1 ? 'order' : 'orders'} · ${fmt(pendingVal)} total`

    const drafts = scopedOrders.filter(o => o.status === 'draft')

    if (!clientFilter) {
      const clientCount = new Set(submitted.map(o => o.clientId)).size
      return {
        pending:   { label: 'Pending approval', value: String(pending.length),   sub: pendingSub, warn: pending.length > 0 },
        submitted: { label: 'Submitted orders', value: String(submitted.length), sub: `across ${clientCount} ${clientCount === 1 ? 'client' : 'clients'}`, warn: false },
        drafts:    { label: 'Draft orders',     value: String(drafts.length),    sub: drafts.length === 1 ? 'draft in progress' : 'drafts in progress', warn: false },
        fourth:    { label: 'Submitted order value',      value: fmt(totalVal),            sub: tfLabel, warn: false },
      }
    }
    return {
      pending:   { label: 'Pending approval', value: String(pending.length),   sub: pendingSub, warn: pending.length > 0 },
      submitted: { label: 'Submitted orders', value: String(submitted.length), sub: tfLabel, warn: false },
      drafts:    { label: 'Draft orders',     value: String(drafts.length),    sub: drafts.length === 1 ? 'draft in progress' : 'drafts in progress', warn: false },
      fourth:    { label: 'Submitted order value',      value: fmt(totalVal),            sub: tfLabel, warn: false },
    }
  }, [clientFilter, scopedOrders, timeframe])

  // Tab counts scoped to client
  const counts = useMemo(() => ({
    all:       scopedOrders.length,
    pending:   scopedOrders.filter(o => o.status === 'pending-approval').length,
    submitted: scopedOrders.filter(o => o.status === 'submitted' || o.status === 'on-hold').length,
    drafts:    scopedOrders.filter(o => o.status === 'draft').length,
    rejected:  scopedOrders.filter(o => o.status === 'rejected').length,
  }), [scopedOrders])

  const STATUS_ORDER = { 'pending-approval': 0, rejected: 1, draft: 2, submitted: 3, 'on-hold': 3 }

  const filtered = useMemo(() => {
    let list = scopedOrders
    if (tab === 'pending')   list = list.filter(o => o.status === 'pending-approval')
    if (tab === 'submitted') list = list.filter(o => o.status === 'submitted' || o.status === 'on-hold')
    if (tab === 'drafts')    list = list.filter(o => o.status === 'draft')
    if (tab === 'rejected')  list = list.filter(o => o.status === 'rejected')
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(o =>
        o.id.toLowerCase().includes(s) ||
        o.ref.toLowerCase().includes(s) ||
        (HOSPITAL_CLIENTS.find(c => c.id === o.clientId)?.name || '').toLowerCase().includes(s)
      )
    }
    if (sortCol) {
      return [...list].sort((a, b) => {
        let av, bv
        const clientA = HOSPITAL_CLIENTS.find(c => c.id === a.clientId)
        const clientB = HOSPITAL_CLIENTS.find(c => c.id === b.clientId)
        switch (sortCol) {
          case 'id':      av = a.id;              bv = b.id;              break
          case 'client':  av = clientA?.name ?? '';bv = clientB?.name ?? '';break
          case 'placed':  av = a.placed;          bv = b.placed;          break
          case 'po':      av = a.poNumber ?? '';  bv = b.poNumber ?? '';  break
          case 'lines':   av = a.lines;           bv = b.lines;           break
          case 'total':   av = a.total;           bv = b.total;           break
          case 'status':  av = STATUS_ORDER[a.status] ?? 99; bv = STATUS_ORDER[b.status] ?? 99; break
          default:        return 0
        }
        if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        return sortDir === 'asc' ? av - bv : bv - av
      })
    }
    return [...list].sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99))
  }, [tab, q, scopedOrders, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const SEED_OVERRIDES = {
    'SC-05123': { variant: 'ATORV-ACT', mld: '5' },
    'SC-08612': { variant: 'METF-BRI',  mld: '' },
    'SC-04128': { variant: '',           mld: '3' },
    'SC-07811': { variant: '',           mld: '' },
  }

  function buildOrderState(o) {
    if (o.status === 'draft') {
      const draftCatalogue = o.type === 'nrt' ? NRT_CATALOGUE : CATALOGUE
      const seedLines = draftCatalogue.slice(0, Math.min(o.lines, 4)).map((p, i) => ({
        sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo,
        unit: p.promo ?? p.msp, qty: Math.max(1, (i + 1) * 2),
        description: '', stock: p.stock, stockState: p.stockState,
        variant: '', mld: '',
      }))
      return { isDraft: true, order: { draftId: o.id, clientId: o.clientId, type: o.type, status: 'draft', lines: seedLines, description: o.ref, agent: 'DPDP-NXT', manualPick: { enabled: false, reasonCode: '', note: '' } } }
    } else {
      const sampleNotes = ['Earliest expiry date required', 'Short-dated stock acceptable', null, null, null, null, null, null]
      const submittedCatalogue = o.type === 'nrt' ? NRT_CATALOGUE : CATALOGUE
      const priority = o.type === 'nrt'
        ? ['NC-10010', 'NC-10003', 'NC-20003', 'NC-20011', 'NC-30002', 'NC-40006', 'NC-50003', 'NC-60001']
        : ['SC-04128', 'SC-07811', 'SC-05010', 'SC-05011', 'SC-05123', 'SC-06502', 'SC-08612', 'SC-07815']
      const skus = priority.slice(0, Math.min(o.lines, 8))
      const seedLines = skus.map((sku, i) => {
        const p = submittedCatalogue.find(c => c.sku === sku) || submittedCatalogue[i]
        const overrides = SEED_OVERRIDES[p.sku] || {}
        return {
          sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo,
          unit: p.promo ?? p.msp, qty: Math.max(1, (i + 1) * 2),
          description: sampleNotes[i] || '', stock: p.stock, stockState: p.stockState,
          variant: overrides.variant ?? '', mld: overrides.mld ?? '',
        }
      })
      return { isDraft: false, order: { ...o, lines: seedLines, description: o.note || '', poNumber: o.poNumber || '', shipDate: o.shipDate || '', agent: o.agent || 'DPDP-NXT', manualPick: { enabled: false, reasonCode: '', note: '' } } }
    }
  }

  function openOrder(o, siblingIds) {
    const { isDraft, order } = buildOrderState(o)
    const ids = siblingIds ?? filtered.map(x => x.id)
    const idx = ids.indexOf(o.id)
    if (isDraft) {
      navigate(`/orders/${o.id}/build`, { state: { order } })
    } else {
      navigate(`/orders/${o.id}/view`, { state: { order, orderIds: ids, orderIndex: idx } })
    }
  }

  function editRejected(o) {
    const sampleNotes = ['Earliest expiry date required', 'Short-dated stock acceptable', null, null, null, null, null, null]
    const seedLines = CATALOGUE.slice(0, Math.min(o.lines, 8)).map((p, i) => ({
      sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo,
      unit: p.promo ?? p.msp, qty: Math.max(1, (i + 1) * 2),
      description: sampleNotes[i] || '', stock: p.stock, stockState: p.stockState,
    }))
    navigate(`/orders/${o.id}/build`, {
      state: {
        order: {
          draftId: o.id,
          clientId: o.clientId,
          type: o.type,
          status: 'draft',
          lines: seedLines,
          description: o.note || '',
          poNumber: o.poNumber || '',
          shipDate: o.shipDate || '',
          agent: o.agent || 'DPDP-NXT',
          manualPick: { enabled: false, reasonCode: '', note: '' },
          rejectionNote: o.rejectionNote || null,
        },
      },
    })
  }

  function handleNewOrder() {
    navigate('/orders/new', {
      state: { preselectedClientId: selectedClient?.id ?? null },
    })
  }

  return (
    <div className="page__body">
      <div className="page-h">
        <div>
          <h1 className="page-h__title">Orders</h1>
          <div className="page-h__sub">Manage and submit hospital orders on behalf of your client portfolio.</div>
        </div>
      </div>

      {/* Client scope + action row */}
      <div className="row between" style={{ marginBottom: 20, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
        <div className="row gap-24" style={{ alignItems: 'center' }}>
          <span className="label" style={{ whiteSpace: 'nowrap' }}>Show orders for</span>
          <SearchSelect
            value={clientFilter}
            onChange={v => { setClientFilter(v); setTab('all'); setPage(1) }}
            options={HOSPITAL_CLIENTS.map(c => ({ value: c.id, label: c.name, meta: c.code, sub: c.postcode }))}
            allLabel="All clients"
            width={300}
          />
<span className="label" style={{ whiteSpace: 'nowrap' }}>Period</span>
          <select
            className="select"
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            style={{ fontSize: 13.5, height: 34, width: 160 }}
          >
            {TIMEFRAMES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button className="btn btn--primary" onClick={handleNewOrder}>
          <Icon name="plus" size={15} /> New order{selectedClient ? ` for ${selectedClient.code}` : ''}
        </button>
      </div>

      {/* KPI strip */}
      <div className="row gap-12" style={{ marginBottom: 22 }}>
        <KPI label={kpis.pending.label}   value={kpis.pending.value}   sub={kpis.pending.sub}   warn={kpis.pending.warn}   />
        <KPI label={kpis.drafts.label}    value={kpis.drafts.value}    sub={kpis.drafts.sub}    warn={kpis.drafts.warn}    />
        <KPI label={kpis.submitted.label} value={kpis.submitted.value} sub={kpis.submitted.sub} warn={kpis.submitted.warn} />
        <KPI label={kpis.fourth.label}    value={kpis.fourth.value}    sub={kpis.fourth.sub}    warn={kpis.fourth.warn}    />
      </div>

      <div className="panel">
        <div className="panel__head" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="row gap-8">
            <button className="btn"><Icon name="filter" size={14} /> Filters</button>
            <div className="search" style={{ width: 320 }}>
              <span className="search__icon"><Icon name="search" size={15} /></span>
              <input className="input" placeholder="Search order ID or reference…" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
            </div>
          </div>
          <div className="row gap-8" style={{ marginLeft: 'auto', alignItems: 'center' }}>
            <button className="btn btn--ghost" style={{ padding: '0 4px', gap: 5, color: 'var(--ink-3)', fontSize: 13 }}><Icon name="doc" size={14} /> Export</button>
            <div className="seg">
              <button className={'seg__btn ' + (tab === 'all'       ? 'active' : '')} onClick={() => { setTab('all');       setPage(1) }}>All <span className="muted-2">· {counts.all}</span></button>
              <button className={'seg__btn ' + (tab === 'pending'   ? 'active' : '')} onClick={() => { setTab('pending');   setPage(1) }}>
                Pending approval
                {counts.pending > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 5, minWidth: 18, height: 18, borderRadius: 9, background: tab === 'pending' ? '#5b21b6' : '#ede9fe', color: tab === 'pending' ? '#fff' : '#5b21b6', fontSize: 11, fontWeight: 700, padding: '0 5px' }}>{counts.pending}</span>}
              </button>
              <button className={'seg__btn ' + (tab === 'submitted' ? 'active' : '')} onClick={() => { setTab('submitted'); setPage(1) }}>Submitted <span className="muted-2">· {counts.submitted}</span></button>
              <button className={'seg__btn ' + (tab === 'rejected'  ? 'active' : '')} onClick={() => { setTab('rejected');  setPage(1) }}>Rejected <span className="muted-2">· {counts.rejected}</span></button>
              <button className={'seg__btn ' + (tab === 'drafts'    ? 'active' : '')} onClick={() => { setTab('drafts');    setPage(1) }}>Drafts <span className="muted-2">· {counts.drafts}</span></button>
            </div>
          </div>
        </div>

        <div className="panel__body panel__body--flush">
          <table className="tbl">
            <thead>
              <tr>
                {[
                  { col: 'id',     label: 'Order',     cls: ''      },
                  { col: 'client', label: 'Client',    cls: ''      },
                  // { col: null,     label: 'Type',      cls: ''      },
                  { col: 'placed', label: 'Placed',    cls: ''      },
                  { col: 'po',     label: 'PO number', cls: ''      },
                  { col: 'lines',  label: 'Lines',     cls: 'right' },
                  { col: 'total',  label: 'Total',     cls: 'right' },
                  { col: 'status', label: 'Status',    cls: ''      },
                ].map(({ col, label, cls }) => (
                  <th
                    key={label}
                    className={cls}
                    onClick={col ? () => toggleSort(col) : undefined}
                    style={col ? { cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' } : {}}
                  >
                    {label}{col && <SortCaret col={col} />}
                  </th>
                ))}
                <th className="right" style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(o => {
                const client = HOSPITAL_CLIENTS.find(c => c.id === o.clientId)
                return (
                  <>
                    <tr
                      key={o.id}
                      onClick={() => o.status === 'rejected' ? editRejected(o) : openOrder(o)}
                      style={{
                        cursor: 'pointer',
                        background: o.status === 'pending-approval' ? '#faf5ff' : o.status === 'rejected' ? 'rgba(239,68,68,0.03)' : undefined,
                      }}
                    >
                      <td>
                        <div className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{o.id}</div>
                      </td>
                      <td>
                        <div><span className="mono" style={{ fontSize: 12, marginRight: 6 }}>{client?.code}</span>{client?.name}{client?.postcode && <span className="muted" style={{ marginLeft: 6, fontSize: 12 }}>({client.postcode})</span>}</div>
                      </td>
                      {/* Type column hidden — uncomment header { col: null, label: 'Type' } to restore
                      <td>
                        <span className="badge" style={o.type === 'nrt' ? { background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' } : {}}>
                          {o.type === 'nrt' ? 'NRT' : 'Hospital'}
                        </span>
                      </td>
                      */}
                      <td className="mono" style={{ fontSize: 12 }}>{o.placed?.split(' ')[0]}</td>
                      <td className="mono muted" style={{ fontSize: 12 }}>{o.poNumber || <span style={{ color: 'var(--ink-4)' }}>—</span>}</td>
                      <td className="right tnum mono">{o.lines}</td>
                      <td className="right tnum mono" style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <StatusBadge status={o.status} />
                          {o.status === 'rejected' && o.rejectionNote && (
                            <div
                              style={{ position: 'relative', display: 'inline-flex' }}
                              onMouseEnter={() => setHoveredRejection(o.id)}
                              onMouseLeave={() => setHoveredRejection(null)}
                            >
                              <Icon name="alert" size={13} style={{ color: '#dc2626', cursor: 'default' }} />
                              {hoveredRejection === o.id && (
                                <div style={{
                                  position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
                                  transform: 'translateX(-50%)', zIndex: 300,
                                  background: 'var(--ink)', color: '#fff', fontSize: 12, lineHeight: 1.5,
                                  padding: '8px 12px', borderRadius: 6, whiteSpace: 'normal',
                                  width: 280, wordBreak: 'break-word',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)', pointerEvents: 'none',
                                }}>
                                  <div style={{ fontWeight: 600, marginBottom: 3, opacity: 0.7, fontSize: 11 }}>REJECTION NOTE</div>
                                  {o.rejectionNote}
                                  <div style={{
                                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                    borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                                    borderTop: '5px solid var(--ink)',
                                  }} />
                                </div>
                              )}
                            </div>
                          )}
                          {o.status === 'pending-approval' && o.approverComment && (
                            <div
                              style={{ position: 'relative', display: 'inline-flex' }}
                              onMouseEnter={() => setHoveredApproverComment(o.id)}
                              onMouseLeave={() => setHoveredApproverComment(null)}
                            >
                              <Icon name="edit" size={13} style={{ color: '#7c3aed', cursor: 'default' }} />
                              {hoveredApproverComment === o.id && (
                                <div style={{
                                  position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
                                  transform: 'translateX(-50%)', zIndex: 300,
                                  background: 'var(--ink)', color: '#fff', fontSize: 12, lineHeight: 1.5,
                                  padding: '8px 12px', borderRadius: 6, whiteSpace: 'normal',
                                  width: 280, wordBreak: 'break-word',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)', pointerEvents: 'none',
                                }}>
                                  <div style={{ fontWeight: 600, marginBottom: 3, opacity: 0.7, fontSize: 11 }}>COMMENT TO APPROVER</div>
                                  {o.approverComment}
                                  <div style={{
                                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                    borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                                    borderTop: '5px solid var(--ink)',
                                  }} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="right">
                        {o.status === 'draft' && (
                          <button className="btn btn--sm" onClick={e => { e.stopPropagation(); openOrder(o) }}>Continue</button>
                        )}
                        {(o.status === 'submitted' || o.status === 'on-hold') && (
                          <button className="btn btn--sm" onClick={e => { e.stopPropagation(); openOrder(o) }}>View</button>
                        )}
                        {o.status === 'rejected' && (
                          <button className="btn btn--sm btn--primary" onClick={e => { e.stopPropagation(); editRejected(o) }}>Edit &amp; resubmit</button>
                        )}
                        {o.status === 'pending-approval' && (
                          <div className="row gap-6" style={{ justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                            <button
                              className="btn btn--sm btn--primary"
                              onClick={() => approveOrder(o.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn--sm"
                              style={{ color: 'var(--bad)', borderColor: 'rgba(220,38,38,0.3)' }}
                              onClick={() => { setRejectModalId(o.id); setRejectNote('') }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>


                  </>
                )
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty">
                      <h3>No orders match those filters.</h3>
                      Try clearing the search or widening the client filter.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <Pager page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>

      {/* Rejection modal */}
      {rejectModalId && (
        <div className="scrim" onClick={() => { setRejectModalId(null); setRejectNote('') }}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal__head">
              <div className="row between">
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>Reject order</div>
                  <h2 style={{ fontSize: 18 }}>Reject {rejectModalId}</h2>
                </div>
                <button className="btn btn--ghost btn--icon" onClick={() => { setRejectModalId(null); setRejectNote('') }}>
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
            <div className="modal__body">
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 16 }}>
                The submitter will be notified that this order has been rejected.
              </div>
              <div className="field">
                <div className="field__label">Why was this rejected? <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></div>
                <textarea
                  className="input"
                  autoFocus
                  rows={6}
                  placeholder="The more detail you provide, the easier it will be for the submitter to correct and resubmit the order."
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  style={{ width: '100%', fontSize: 13.5, resize: 'vertical', fontFamily: 'inherit', height: 200, padding: 20 }}
                />
              </div>
            </div>
            <div className="modal__foot">
              <div />
              <div className="row gap-8">
                <button className="btn" onClick={() => { setRejectModalId(null); setRejectNote('') }}>Cancel</button>
                <button
                  className="btn"
                  style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
                  onClick={() => rejectOrder(rejectModalId)}
                >
                  Confirm rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewModal && <NewOrderModal />}

      {toasts.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9000,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {toasts.map(t => (
            <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
