/* Build order screen — catalogue + basket
   Two layout modes:
     - "split"   : catalogue + basket side by side
     - "stepped" : catalogue full-width, basket as next step
*/

const { useState: useStateB, useMemo: useMemoB, useEffect: useEffectB } = React;

function BuildOrder({ order, onCancel, onSubmit, layout = "split", showStock = true, density = "comfortable" }) {
  const [step, setStep] = useStateB(layout === "stepped" ? "catalogue" : "build"); // catalogue | basket | review
  const [q, setQ] = useStateB("");
  const [cat, setCat] = useStateB("All");
  const [stockOnly, setStockOnly] = useStateB(false);
  const [dtOnly, setDtOnly] = useStateB(false);
  const [page, setPage] = useStateB(1);
  const pageSize = 9;

  const [lines, setLines] = useStateB(order.lines || []);
  const [orderDesc, setOrderDesc] = useStateB(order.description || "");
  const [agent, setAgent] = useStateB(order.agent || "DPDP-NXT");
  const [manualPick, setManualPick] = useStateB(order.manualPick || { enabled: false, reasonCode: "", note: "" });
  const [editLineId, setEditLineId] = useStateB(null);

  const client = window.HOSPITAL_CLIENTS.find(c => c.id === order.clientId);

  /* keep "split" view in sync if layout changes */
  useEffectB(() => {
    if (layout === "split") setStep("build");
    else if (step === "build") setStep("catalogue");
    // eslint-disable-next-line
  }, [layout]);

  const filtered = useMemoB(() => {
    let list = window.CATALOGUE;
    if (cat !== "All") list = list.filter(p => p.category === cat);
    if (stockOnly) list = list.filter(p => p.stockState !== "out");
    if (dtOnly) list = list.filter(p => p.dt);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
    }
    return list;
  }, [q, cat, stockOnly, dtOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const vat = subtotal * 0.0;
  const total = subtotal + vat;

  function findLine(sku) { return lines.find(l => l.sku === sku); }

  function addToBasket(p) {
    const existing = findLine(p.sku);
    if (existing) {
      setLines(lines.map(l => l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l));
    } else {
      setLines([...lines, { sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo, unit: p.promo || p.msp, qty: 1, description: "", stock: p.stock, stockState: p.stockState }]);
    }
  }
  function setQty(sku, qty) {
    if (qty <= 0) { setLines(lines.filter(l => l.sku !== sku)); return; }
    setLines(lines.map(l => l.sku === sku ? { ...l, qty } : l));
  }
  function setUnit(sku, unit) {
    setLines(lines.map(l => l.sku === sku ? { ...l, unit } : l));
  }
  function setLineDesc(sku, description) {
    setLines(lines.map(l => l.sku === sku ? { ...l, description } : l));
  }
  function removeLine(sku) { setLines(lines.filter(l => l.sku !== sku)); }

  /* ---------------- render ---------------- */
  return (
    <div className={"page__body " + (layout === "split" ? "page__body--wide" : "")} data-screen-label="03 Build order">
      <div className="crumbs">
        <a onClick={onCancel}>Orders</a>
        <Icon name="chevron-right" size={12} className="crumbs__sep"/>
        <span>New order</span>
        <Icon name="chevron-right" size={12} className="crumbs__sep"/>
        <span style={{color:"var(--ink-2)"}}>{order.draftId || "Draft"}</span>
      </div>

      <div className="page-h">
        <div>
          <h1 className="page-h__title">{client?.name}</h1>
          <div className="page-h__sub">
            <span className="mono">{client?.code}</span> · {client?.group} · Hospital order
            <span style={{marginLeft: 10}} className="badge badge--draft">Draft</span>
          </div>
        </div>
        <div className="row gap-8">
          <button className="btn"><Icon name="save" size={14}/> Save draft</button>
          <button className="btn btn--ghost" onClick={onCancel}>Discard</button>
        </div>
      </div>

      {layout === "stepped" && (
        <div className="stepper" style={{marginBottom: 20}}>
          <div className={"stepper__item " + (step === "catalogue" ? "is-active" : "is-done")}>
            <span className="stepper__num">{step !== "catalogue" ? "✓" : "1"}</span> Add products
          </div>
          <div className="stepper__sep"/>
          <div className={"stepper__item " + (step === "basket" ? "is-active" : (step === "review" ? "is-done" : ""))}>
            <span className="stepper__num">2</span> Review basket
          </div>
          <div className="stepper__sep"/>
          <div className={"stepper__item " + (step === "review" ? "is-active" : "")}>
            <span className="stepper__num">3</span> Shipping &amp; submit
          </div>
        </div>
      )}

      <div className={"builder " + (layout === "stepped" ? "builder--stacked" : "")}>
        {/* ============ LEFT: catalogue ============ */}
        {(layout === "split" || step === "catalogue") && (
          <div>
            <CataloguePanel
              q={q} setQ={(v) => { setQ(v); setPage(1); }}
              cat={cat} setCat={(v) => { setCat(v); setPage(1); }}
              stockOnly={stockOnly} setStockOnly={setStockOnly}
              dtOnly={dtOnly} setDtOnly={setDtOnly}
              filtered={filtered}
              paged={paged}
              page={page} totalPages={totalPages} setPage={setPage}
              showStock={showStock}
              findLine={findLine}
              addToBasket={addToBasket}
              setQty={setQty}
              density={density}
            />
            {layout === "stepped" && (
              <div className="row end gap-8" style={{marginTop: 18}}>
                <button className="btn" onClick={onCancel}>Cancel</button>
                <button className="btn btn--primary" disabled={lines.length === 0} onClick={() => setStep("basket")}>
                  Review {lines.length} {lines.length === 1 ? "item" : "items"} <Icon name="arrow-right" size={14}/>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============ RIGHT: basket (split) ============ */}
        {layout === "split" && (
          <aside className="builder__basket">
            <BasketPanel
              lines={lines} setQty={setQty} removeLine={removeLine}
              editLineId={editLineId} setEditLineId={setEditLineId}
              setUnit={setUnit} setLineDesc={setLineDesc}
              subtotal={subtotal} total={total}
              orderDesc={orderDesc} setOrderDesc={setOrderDesc}
              agent={agent} setAgent={setAgent}
              manualPick={manualPick} setManualPick={setManualPick}
              onSubmit={() => onSubmit({ ...order, lines, description: orderDesc, agent, manualPick, total })}
              showFoot
            />
          </aside>
        )}

        {/* ============ FULL: basket step ============ */}
        {layout === "stepped" && step === "basket" && (
          <div className="col gap-16">
            <BasketPanel
              lines={lines} setQty={setQty} removeLine={removeLine}
              editLineId={editLineId} setEditLineId={setEditLineId}
              setUnit={setUnit} setLineDesc={setLineDesc}
              subtotal={subtotal} total={total}
              orderDesc={orderDesc} setOrderDesc={setOrderDesc}
              agent={agent} setAgent={setAgent}
              manualPick={manualPick} setManualPick={setManualPick}
              onSubmit={() => setStep("review")}
              full
            />
            <div className="row between">
              <button className="btn" onClick={() => setStep("catalogue")}><Icon name="back" size={14}/> Back to catalogue</button>
              <button className="btn btn--primary" disabled={lines.length === 0} onClick={() => setStep("review")}>Continue to shipping <Icon name="arrow-right" size={14}/></button>
            </div>
          </div>
        )}

        {layout === "stepped" && step === "review" && (
          <ReviewStep
            order={{ ...order, lines, description: orderDesc, agent, manualPick, total }}
            client={client}
            onBack={() => setStep("basket")}
            onSubmit={() => onSubmit({ ...order, lines, description: orderDesc, agent, manualPick, total })}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Catalogue Panel ---------- */
function CataloguePanel({ q, setQ, cat, setCat, stockOnly, setStockOnly, dtOnly, setDtOnly, filtered, paged, page, totalPages, setPage, showStock, findLine, addToBasket, setQty, density }) {
  return (
    <div className="panel">
      <div className="panel__head" style={{flexDirection:"column", alignItems:"stretch", gap: 12, padding: "14px 16px"}}>
        <div className="row gap-8" style={{width:"100%"}}>
          <div className="search" style={{flex: 1}}>
            <span className="search__icon"><Icon name="search" size={16}/></span>
            <input className="input" placeholder="Search by product name, SKU or category…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button className="btn"><Icon name="filter" size={14}/> Advanced</button>
        </div>
        <div className="row gap-6" style={{flexWrap:"wrap"}}>
          {window.CATEGORIES.map(c => (
            <button key={c} className={"chip " + (cat === c ? "active" : "")} onClick={() => setCat(c)}>{c}</button>
          ))}
          <div style={{width:1, height:18, background:"var(--border)", margin: "0 4px"}}></div>
          <button className={"chip " + (stockOnly ? "active" : "")} onClick={() => setStockOnly(!stockOnly)}>In stock only</button>
          <button className={"chip " + (dtOnly ? "active" : "")} onClick={() => setDtOnly(!dtOnly)}>Drug Tariff (DT)</button>
        </div>
      </div>

      {/* table head */}
      <div className="cat-head">
        <div></div>
        <div>Product</div>
        <div>Pack</div>
        <div>{showStock ? "Stock" : "Availability"}</div>
        <div className="right">Unit price</div>
        <div className="right">Action</div>
      </div>

      <div>
        {paged.map(p => {
          const line = findLine(p.sku);
          const inBasket = !!line;
          return (
            <div key={p.sku} className={"cat-row " + (inBasket ? "is-in-basket " : "") + (p.stockState === "out" ? "is-out" : "")}>
              <div className="cat-row__type">{p.form}</div>
              <div style={{minWidth: 0}}>
                <div className="cat-row__name" style={{whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{p.name}</div>
                <div className="cat-row__sub">
                  {p.sku} · {p.category}
                  {p.controlled && <span className="badge" style={{marginLeft: 8, height: 18, fontSize: 10}}>CD</span>}
                  {p.dt && <span className="badge" style={{marginLeft: 6, height: 18, fontSize: 10}}>DT</span>}
                </div>
              </div>
              <div className="mono tnum">{p.pack}</div>
              <div>
                {showStock
                  ? <StockDot state={p.stockState} n={p.stock} />
                  : <span className="status status--neutral"><span className="status__dot"></span><span style={{fontSize:12, color:"var(--ink-3)"}}>{p.stockState === "out" ? "Unavailable" : p.stockState === "low" ? "Limited" : "Available"}</span></span>
                }
              </div>
              <div className="right">
                <div className="mono tnum" style={{fontWeight: 600}}>{window.fmt(p.promo ?? p.msp)}</div>
                {p.promo && <div className="mono muted" style={{fontSize: 11, textDecoration:"line-through"}}>{window.fmt(p.msp)}</div>}
              </div>
              <div className="row end gap-8">
                {inBasket ? (
                  <div className="qty-mini">
                    <button className="qty-mini__btn" onClick={() => setQty(p.sku, line.qty - 1)}>−</button>
                    <span className="qty-mini__val">{line.qty}</span>
                    <button className="qty-mini__btn" onClick={() => setQty(p.sku, line.qty + 1)}>+</button>
                  </div>
                ) : (
                  <button className="btn btn--sm" disabled={p.stockState === "out"} onClick={() => addToBasket(p)}>
                    <Icon name="plus" size={13}/> Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {paged.length === 0 && <div className="empty"><h3>No products match.</h3>Try a broader search or clear category filters.</div>}
      </div>

      <div style={{borderTop:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 16px"}}>
        <div className="muted" style={{fontSize: 12}}>
          Showing <b className="mono" style={{color:"var(--ink-2)"}}>{(page - 1) * 9 + 1}–{Math.min(page * 9, filtered.length)}</b> of <b className="mono" style={{color:"var(--ink-2)"}}>{filtered.length}</b> products
          <span className="muted-2" style={{marginLeft: 8}}>(of 3,475 catalogue)</span>
        </div>
        <Pager page={page} totalPages={totalPages} onChange={setPage}/>
      </div>
    </div>
  );
}

/* ---------- Basket Panel ---------- */
function BasketPanel({ lines, setQty, removeLine, editLineId, setEditLineId, setUnit, setLineDesc, subtotal, total, orderDesc, setOrderDesc, agent, setAgent, manualPick, setManualPick, onSubmit, showFoot, full }) {
  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <h3 style={{fontSize: 15}}>Order basket</h3>
          <div className="muted" style={{fontSize: 12, marginTop: 2}}>
            {lines.length} {lines.length === 1 ? "line" : "lines"} · {lines.reduce((s, l) => s + l.qty, 0)} units
          </div>
        </div>
        <div className="row gap-8">
          {lines.length > 0 && <button className="btn btn--ghost btn--sm">Clear</button>}
        </div>
      </div>

      <div className={full ? "" : "panel__body panel__body--flush"}>
        {lines.length === 0 && (
          <div className="basket-empty">
            <Icon name="package" size={20} style={{opacity: 0.4, marginBottom: 8}}/>
            <div>Your basket is empty.</div>
            <div className="muted-2" style={{fontSize: 12, marginTop: 4}}>Search and add products from the catalogue.</div>
          </div>
        )}
        {lines.map(l => (
          <BasketLine key={l.sku} line={l}
            editing={editLineId === l.sku}
            onToggleEdit={() => setEditLineId(editLineId === l.sku ? null : l.sku)}
            onQty={(v) => setQty(l.sku, v)}
            onUnit={(v) => setUnit(l.sku, v)}
            onDesc={(v) => setLineDesc(l.sku, v)}
            onRemove={() => removeLine(l.sku)}
            full={full}
          />
        ))}
      </div>

      {showFoot && lines.length > 0 && (
        <div className="basket-foot">
          <div className="field" style={{marginBottom: 12}}>
            <div className="field__label">Order reference / description</div>
            <textarea className="textarea" placeholder="Add a note visible on the SAP order header…" value={orderDesc} onChange={e => setOrderDesc(e.target.value)} style={{minHeight: 56, fontSize: 12.5}}/>
          </div>
          <div className="field" style={{marginBottom: 12}}>
            <div className="field__label">Shipping agent code</div>
            <select className="select" value={agent} onChange={e => setAgent(e.target.value)}>
              {window.SHIPPING_AGENTS.map(a => <option key={a.code} value={a.code}>{a.code} — {a.label}</option>)}
            </select>
          </div>

          {/* Manual picking */}
          <div style={{padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)"}}>
            <Switch on={manualPick.enabled} onChange={(v) => setManualPick({ ...manualPick, enabled: v })}
              label="Request manual picking"
              sub={manualPick.enabled ? "Your warehouse team will fulfil this order by hand." : "Default: automated DC fulfilment."}/>
            {manualPick.enabled && (
              <div className="col gap-8" style={{marginTop: 10}}>
                <div className="field">
                  <div className="field__label">Reason code</div>
                  <select className="select" value={manualPick.reasonCode} onChange={e => setManualPick({ ...manualPick, reasonCode: e.target.value })}>
                    <option value="">Select a reason…</option>
                    {window.MANUAL_PICK_REASONS.map(r => <option key={r.code} value={r.code}>{r.code} — {r.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <div className="field__label">Note to picker (optional)</div>
                  <textarea className="textarea" placeholder="e.g. Earliest expiry date required…" value={manualPick.note} onChange={e => setManualPick({ ...manualPick, note: e.target.value })} style={{minHeight: 48, fontSize: 12.5}}/>
                </div>
              </div>
            )}
          </div>

          <div style={{marginTop: 14}}>
            <div className="basket-foot__line"><span className="muted">Subtotal</span><span className="mono tnum">{window.fmt(subtotal)}</span></div>
            <div className="basket-foot__line"><span className="muted">VAT (rated separately at invoice)</span><span className="mono muted">—</span></div>
            <div className="basket-foot__total row between">
              <span>Order total</span>
              <span className="mono tnum">{window.fmt(total)}</span>
            </div>
          </div>

          <button className="btn btn--primary btn--lg" style={{width:"100%", marginTop: 14}}
            disabled={lines.length === 0 || (manualPick.enabled && !manualPick.reasonCode)}
            onClick={onSubmit}>
            Submit order <Icon name="arrow-right" size={15}/>
          </button>
          {manualPick.enabled && !manualPick.reasonCode && (
            <div className="banner banner--warn" style={{marginTop: 10}}>
              <Icon name="alert" size={14}/> Pick a reason code to enable manual picking.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Basket line ---------- */
function BasketLine({ line, editing, onToggleEdit, onQty, onUnit, onDesc, onRemove, full }) {
  const below = line.unit < line.msp;
  const discountPct = ((line.msp - line.unit) / line.msp) * 100;
  return (
    <div className="line">
      <div className="line__row1">
        <div style={{minWidth: 0, flex: 1}}>
          <div className="line__name">{line.name}</div>
          <div className="line__sku">{line.sku} · pack {line.pack}</div>
        </div>
        <div className="line__total">{window.fmt(line.unit * line.qty)}</div>
      </div>

      <div className="line__meta">
        <span><b>MSP</b> <span className="mono tnum">{window.fmt(line.msp)}</span></span>
        {line.promo && <span><b>Promo</b> <span className="mono tnum">{window.fmt(line.promo)}</span></span>}
        <span><b>Unit</b> <span className={"mono tnum " + (below ? "" : "")} style={below ? {color:"var(--warn)", fontWeight:600} : {}}>{window.fmt(line.unit)}</span></span>
        {line.unit !== (line.promo ?? line.msp) && (
          <span style={below ? {color:"var(--warn)"} : {color:"var(--ok)"}}>
            {discountPct >= 0 ? `−${discountPct.toFixed(1)}%` : `+${Math.abs(discountPct).toFixed(1)}%`} vs MSP
          </span>
        )}
      </div>

      <div className="line__actions">
        <Qty value={line.qty} onChange={onQty} />
        <div className={"price-edit " + (below ? "is-below" : "")}>
          <span className="muted" style={{fontSize:11}}>£</span>
          <input className="tnum" type="text" value={line.unit.toFixed(2)} onChange={e => {
            const v = parseFloat(e.target.value.replace(/[^0-9.]/g, "") || "0");
            onUnit(Number.isFinite(v) ? v : 0);
          }}/>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={onToggleEdit} title="Add note">
          <Icon name="edit" size={13}/>
        </button>
        <button className="btn btn--danger-ghost btn--icon btn--sm" onClick={onRemove} title="Remove line">
          <Icon name="trash" size={13}/>
        </button>
      </div>

      {below && (
        <div className="banner banner--warn" style={{marginTop: 10, fontSize: 11.5}}>
          <Icon name="alert" size={13}/>
          Price <span className="mono tnum">{window.fmt(line.unit)}</span> is below minimum selling price <span className="mono tnum">{window.fmt(line.msp)}</span> — requires commercial approval.
        </div>
      )}

      {editing && (
        <div style={{marginTop: 10}}>
          <div className="field">
            <div className="field__label">Line description (visible on picking note)</div>
            <textarea className="textarea" placeholder="e.g. For Ward 4B re-stock — earliest expiry preferred." value={line.description} onChange={e => onDesc(e.target.value)} style={{minHeight: 52, fontSize: 12.5}}/>
          </div>
        </div>
      )}

      {!editing && line.description && (
        <div className="muted" style={{marginTop: 8, fontSize: 12, paddingLeft: 8, borderLeft: "2px solid var(--border-strong)"}}>
          {line.description}
        </div>
      )}
    </div>
  );
}

/* ---------- Review step (stepped layout) ---------- */
function ReviewStep({ order, client, onBack, onSubmit }) {
  return (
    <div className="col gap-16">
      <div className="panel">
        <div className="panel__head"><h3>Review &amp; submit</h3></div>
        <div className="panel__body">
          <div className="row gap-24" style={{flexWrap:"wrap"}}>
            <ReviewKV label="Client" value={`${client?.name} (${client?.code})`}/>
            <ReviewKV label="Order type" value="Hospital"/>
            <ReviewKV label="Shipping agent" value={order.agent || "—"}/>
            <ReviewKV label="Lines / units" value={`${order.lines.length} / ${order.lines.reduce((s,l)=>s+l.qty,0)}`}/>
            <ReviewKV label="Manual picking" value={order.manualPick?.enabled ? `Yes — ${order.manualPick.reasonCode || "—"}` : "No"}/>
            <ReviewKV label="Order total" value={<span className="mono tnum" style={{fontSize: 18, fontWeight: 700}}>{window.fmt(order.total)}</span>}/>
          </div>
          {order.description && (
            <div style={{marginTop: 14, padding: 12, background: "var(--surface-2)", borderRadius: 6, fontSize: 13}}>
              <div className="label" style={{marginBottom: 4}}>Order note</div>
              {order.description}
            </div>
          )}
        </div>
      </div>
      <div className="row between">
        <button className="btn" onClick={onBack}><Icon name="back" size={14}/> Back</button>
        <button className="btn btn--primary btn--lg" onClick={onSubmit}>Submit order <Icon name="arrow-right" size={15}/></button>
      </div>
    </div>
  );
}
function ReviewKV({ label, value }) {
  return (
    <div style={{minWidth: 200}}>
      <div className="label" style={{marginBottom: 4}}>{label}</div>
      <div>{value}</div>
    </div>
  );
}

window.BuildOrder = BuildOrder;
