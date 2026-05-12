/* App shell — routes between screens */

const { useState: useStateApp } = React;

/* Tweak defaults — host can rewrite these on disk */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "catalogueLayout": "split",
  "showStock": true,
  "density": "comfortable",
  "showClientChip": true
}/*EDITMODE-END*/;

function getHash() { return (typeof window !== "undefined" && window.location.hash || "").replace(/^#/, ""); }

function App() {
  const hash = getHash();
  const initialScreen =
    hash === "submitted" ? "submitted"
    : hash === "build" || hash === "build-edit" || hash === "build-manual" || hash === "variant-split" || hash === "variant-stepped" ? "build"
    : "orders";

  const [screen, setScreen] = useStateApp(initialScreen);
  const [showNew, setShowNew] = useStateApp(hash === "new-client" || hash === "new-type");
  const [newStepHash] = useStateApp(hash === "new-type" ? 2 : 1);

  // Pre-seed an in-progress order for hash deep-links
  const seedClient = "BHA-001";
  const preSeedLines = () => window.CATALOGUE.slice(0, 5).map((p, i) => ({
    sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo,
    unit: i === 1 ? p.msp * 0.78 : (p.promo ?? p.msp),
    qty: [4, 2, 6, 3, 8][i],
    description: i === 0 ? "For Ward 4B re-stock — earliest expiry preferred." : "",
    stock: p.stock, stockState: p.stockState
  }));
  const initialOrder = (initialScreen === "build" || initialScreen === "submitted") ? {
    draftId: "DR-2026-00318",
    clientId: seedClient, type: "hospital", status: "draft",
    lines: preSeedLines(),
    description: "May restock — cardiology & antibiotics",
    agent: hash === "build-manual" ? "OWN-FLT-N" : "DPDP-NXT",
    manualPick: hash === "build-manual"
      ? { enabled: true, reasonCode: "MP-02", note: "Batch numbers required for ward audit." }
      : { enabled: false, reasonCode: "", note: "" }
  } : null;

  const [currentOrder, setCurrentOrder] = useStateApp(initialOrder);
  const [submittedOrder, setSubmittedOrder] = useStateApp(initialScreen === "submitted" ? { ...initialOrder, total: 1284.20 } : null);

  const [t, setTweak] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];

  // Hash variant overrides
  const layoutOverride =
    hash === "variant-stepped" ? "stepped"
    : hash === "variant-split" || hash === "build" || hash === "build-edit" || hash === "build-manual" ? "split"
    : null;
  const effectiveLayout = layoutOverride || t.catalogueLayout;

  function newOrder() { setShowNew(true); }
  function openOrder(o) {
    if (o.status === "draft") {
      // Load a draft with a couple of mock lines
      const seed = window.CATALOGUE.slice(0, Math.min(o.lines, 4)).map(p => ({
        sku: p.sku, name: p.name, pack: p.pack, msp: p.msp, promo: p.promo,
        unit: p.promo ?? p.msp, qty: Math.ceil(Math.random() * 6), description: "",
        stock: p.stock, stockState: p.stockState
      }));
      setCurrentOrder({ ...o, draftId: o.id, lines: seed, description: o.ref });
      setScreen("build");
    } else {
      // Just open a read-only view modal in real app — for prototype, just stay on landing
      alert(`(Prototype) Would open ${o.id} in read-only view.`);
    }
  }
  function startBuild({ clientId, type }) {
    setShowNew(false);
    setCurrentOrder({
      draftId: "DR-2026-00" + Math.floor(300 + Math.random() * 99),
      clientId, type, status: "draft", lines: [], description: "", agent: "DPDP-NXT",
      manualPick: { enabled: false, reasonCode: "", note: "" }
    });
    setScreen("build");
  }
  function submitOrder(order) {
    setSubmittedOrder(order);
    setScreen("submitted");
  }

  const headerClient = (screen === "build" || screen === "submitted") && currentOrder && t.showClientChip
    ? window.HOSPITAL_CLIENTS.find(c => c.id === currentOrder.clientId)?.name
    : null;

  return (
    <div className="page">
      <AppHeader
        active={screen === "orders" ? "orders" : (screen === "build" || screen === "new" ? "orders" : "orders")}
        clientName={headerClient}
        onNav={(k) => { if (k === "orders") setScreen("orders"); }}
        onLogoClick={() => setScreen("orders")}
      />

      {screen === "orders" && (
        <OrdersLanding onNewOrder={newOrder} onOpenOrder={openOrder} density={t.density}/>
      )}
      {screen === "build" && currentOrder && (
        <BuildOrder
          order={currentOrder}
          onCancel={() => setScreen("orders")}
          onSubmit={submitOrder}
          layout={effectiveLayout}
          showStock={t.showStock}
          density={t.density}
        />
      )}
      {screen === "submitted" && submittedOrder && (
        <OrderSubmitted
          order={submittedOrder}
          onNewOrder={() => { setSubmittedOrder(null); setCurrentOrder(null); newOrder(); }}
          onBackToOrders={() => { setSubmittedOrder(null); setCurrentOrder(null); setScreen("orders"); }}
        />
      )}

      <AppFooter/>

      {showNew && <NewOrderModal onClose={() => setShowNew(false)} onContinue={startBuild}/>}

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Layout">
            <window.TweakRadio
              label="Catalogue layout"
              value={t.catalogueLayout}
              options={[
                { value: "split", label: "Split view" },
                { value: "stepped", label: "Stepped" }
              ]}
              onChange={(v) => setTweak("catalogueLayout", v)}
            />
            <window.TweakRadio
              label="Density"
              value={t.density}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" }
              ]}
              onChange={(v) => setTweak("density", v)}
            />
          </window.TweakSection>
          <window.TweakSection title="Display">
            <window.TweakToggle
              label="Show stock levels"
              sub="Numeric inventory + status dots"
              value={t.showStock}
              onChange={(v) => setTweak("showStock", v)}
            />
            <window.TweakToggle
              label="‘On behalf of’ header chip"
              sub="Persistent client context"
              value={t.showClientChip}
              onChange={(v) => setTweak("showClientChip", v)}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
