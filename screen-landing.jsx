/* Landing / Orders screen */

const { useState: useStateL, useMemo: useMemoL } = React;

function OrdersLanding({ onNewOrder, onOpenOrder, density = "comfortable" }) {
  const [tab, setTab] = useStateL("all"); // all, submitted, drafts, on-hold
  const [q, setQ] = useStateL("");
  const [clientFilter, setClientFilter] = useStateL("all");
  const [page, setPage] = useStateL(1);
  const pageSize = 8;

  const filtered = useMemoL(() => {
    let list = window.ORDERS_SEED;
    if (tab === "submitted") list = list.filter(o => o.status === "submitted" || o.status === "on-hold");
    if (tab === "drafts")    list = list.filter(o => o.status === "draft");
    if (tab === "on-hold")   list = list.filter(o => o.status === "on-hold");
    if (clientFilter !== "all") list = list.filter(o => o.clientId === clientFilter);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(s) ||
        o.ref.toLowerCase().includes(s) ||
        (window.HOSPITAL_CLIENTS.find(c => c.id === o.clientId)?.name || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [tab, q, clientFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const counts = useMemoL(() => ({
    all: window.ORDERS_SEED.length,
    submitted: window.ORDERS_SEED.filter(o => o.status === "submitted" || o.status === "on-hold").length,
    drafts: window.ORDERS_SEED.filter(o => o.status === "draft").length,
    "on-hold": window.ORDERS_SEED.filter(o => o.status === "on-hold").length,
  }), []);

  return (
    <div className="page__body" data-screen-label="01 Orders landing">
      {/* page header */}
      <div className="page-h">
        <div>
          <h1 className="page-h__title">Orders</h1>
          <div className="page-h__sub">Manage and submit hospital orders on behalf of your client portfolio.</div>
        </div>
        <div className="row gap-8">
          <button className="btn"><Icon name="doc" size={15}/> Export</button>
          <button className="btn btn--primary" onClick={onNewOrder}><Icon name="plus" size={15}/> New order</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="row gap-12" style={{marginBottom: 22}}>
        <KPI label="Awaiting submission" value="3" sub="drafts in progress" />
        <KPI label="Submitted today" value="6" sub="across 5 clients" />
        <KPI label="Held for review" value="1" sub="credit-block, BHA-001" warn />
        <KPI label="MoM order volume" value="+14.2%" sub="vs Apr 2026" />
      </div>

      {/* toolbar */}
      <div className="panel">
        <div className="panel__head" style={{flexWrap:"wrap", gap:12}}>
          <div className="seg">
            <button className={"seg__btn " + (tab === "all" ? "active" : "")} onClick={() => { setTab("all"); setPage(1); }}>All <span className="muted-2">· {counts.all}</span></button>
            <button className={"seg__btn " + (tab === "submitted" ? "active" : "")} onClick={() => { setTab("submitted"); setPage(1); }}>Submitted <span className="muted-2">· {counts.submitted}</span></button>
            <button className={"seg__btn " + (tab === "drafts" ? "active" : "")} onClick={() => { setTab("drafts"); setPage(1); }}>Drafts <span className="muted-2">· {counts.drafts}</span></button>
            <button className={"seg__btn " + (tab === "on-hold" ? "active" : "")} onClick={() => { setTab("on-hold"); setPage(1); }}>On hold <span className="muted-2">· {counts["on-hold"]}</span></button>
          </div>
          <div className="row gap-8" style={{marginLeft:"auto"}}>
            <div className="search" style={{width: 320}}>
              <span className="search__icon"><Icon name="search" size={15}/></span>
              <input className="input" placeholder="Search order ID, reference or client…" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
            </div>
            <select className="select" style={{width: 220}} value={clientFilter} onChange={e => { setClientFilter(e.target.value); setPage(1); }}>
              <option value="all">All clients</option>
              {window.HOSPITAL_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="btn"><Icon name="filter" size={14}/> Filters</button>
          </div>
        </div>

        <div className="panel__body panel__body--flush">
          <table className={"tbl " + (density === "compact" ? "tbl--dense" : "")}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Client</th>
                <th>Type</th>
                <th>Placed</th>
                <th className="right">Lines</th>
                <th className="right">Total</th>
                <th>Status</th>
                <th className="right" style={{width: 120}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(o => {
                const client = window.HOSPITAL_CLIENTS.find(c => c.id === o.clientId);
                return (
                  <tr key={o.id} onClick={() => onOpenOrder(o)} style={{cursor:"pointer"}}>
                    <td>
                      <div className="mono" style={{fontSize:12.5, fontWeight:600}}>{o.id}</div>
                      <div className="muted" style={{fontSize:12, marginTop:2}}>{o.ref}</div>
                    </td>
                    <td>
                      <div>{client?.name}</div>
                      <div className="mono muted" style={{fontSize:11}}>{client?.code} · {client?.region}</div>
                    </td>
                    <td><span className="badge">Hospital</span></td>
                    <td className="mono" style={{fontSize:12}}>{o.placed}</td>
                    <td className="right tnum mono">{o.lines}</td>
                    <td className="right tnum mono" style={{fontWeight:600}}>{window.fmt(o.total)}</td>
                    <td><StatusBadge status={o.status}/></td>
                    <td className="right">
                      {o.status === "draft"
                        ? <button className="btn btn--sm" onClick={(e) => { e.stopPropagation(); onOpenOrder(o); }}>Continue</button>
                        : <button className="btn btn--sm">View</button>}
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={8}><div className="empty"><h3>No orders match those filters.</h3>Try clearing the search or widening the client filter.</div></td></tr>
              )}
            </tbody>
          </table>
          <div style={{borderTop:"1px solid var(--border)"}}>
            <Pager page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, warn }) {
  return (
    <div className="panel" style={{flex:1, padding: "14px 18px"}}>
      <div className="label" style={{marginBottom: 6}}>{label}</div>
      <div className="row between" style={{alignItems:"baseline"}}>
        <div style={{fontSize: 24, fontWeight: 700, letterSpacing:"-0.02em"}} className={warn ? "" : ""}>
          {value}
        </div>
        {warn && <Icon name="alert" size={16} style={{color: "var(--warn)"}}/>}
      </div>
      <div className="muted" style={{fontSize: 12, marginTop: 2}}>{sub}</div>
    </div>
  );
}

window.OrdersLanding = OrdersLanding;
