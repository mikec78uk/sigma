/* Submission confirmation screen */

function OrderSubmitted({ order, onNewOrder, onBackToOrders }) {
  const client = window.HOSPITAL_CLIENTS.find(c => c.id === order.clientId);
  const orderId = "SO-2026-" + Math.floor(40000 + Math.random() * 9000);
  return (
    <div className="page__body" data-screen-label="04 Order submitted">
      <div className="panel" style={{maxWidth: 720, margin: "40px auto", padding: 8}}>
        <div style={{padding: 40, textAlign: "center"}}>
          <div style={{width: 56, height: 56, borderRadius: "50%", background: "var(--ok-bg)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20}}>
            <Icon name="check" size={28} style={{color: "var(--ok)"}}/>
          </div>
          <h2>Order submitted to SAP</h2>
          <p className="muted" style={{marginTop: 8, maxWidth: 460, marginLeft: "auto", marginRight: "auto"}}>
            Your order has been queued for fulfilment. The customer will receive an order acknowledgement via their usual EDI channel within 15 minutes.
          </p>
        </div>
        <div style={{borderTop: "1px solid var(--border)", padding: 24}}>
          <div className="row gap-24" style={{justifyContent: "center", flexWrap: "wrap"}}>
            <KV label="Order ID" value={<span className="mono" style={{fontWeight: 600}}>{orderId}</span>}/>
            <KV label="Client" value={client?.name}/>
            <KV label="Lines" value={order.lines.length}/>
            <KV label="Total" value={<span className="mono tnum" style={{fontWeight: 700, fontSize: 16}}>{window.fmt(order.total)}</span>}/>
          </div>
        </div>
        <div style={{borderTop: "1px solid var(--border)", padding: 16, background: "var(--surface-2)", display: "flex", gap: 8, justifyContent: "center"}}>
          <button className="btn" onClick={onBackToOrders}>Back to orders</button>
          <button className="btn btn--primary" onClick={onNewOrder}><Icon name="plus" size={14}/> Start another</button>
        </div>
      </div>
    </div>
  );
}
function KV({ label, value }) {
  return (
    <div style={{textAlign: "center", minWidth: 140}}>
      <div className="label" style={{marginBottom: 4}}>{label}</div>
      <div style={{fontSize: 14}}>{value}</div>
    </div>
  );
}

window.OrderSubmitted = OrderSubmitted;
