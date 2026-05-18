import { fmt } from '../../utils/format'
import Icon from '../../components/Icon'
import Pager from '../../components/Pager'
import StockDot from '../../components/StockDot'

export default function CataloguePanel({
  catalogue = [], categories = [],
  q, setQ, cat, setCat,
  stockOnly, setStockOnly,
  dtOnly, setDtOnly,
  filtered, paged,
  page, totalPages, setPage,
  showStock,
  findLine, addToBasket, setQty,
  lines = [], total = 0, onReview = null, onCancel = null, onImportClick = null,
}) {
  return (
    <div className="panel">
      <div className="panel__head" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12, padding: '14px 16px' }}>
        <div className="row gap-8" style={{ width: '100%' }}>
          <div className="search" style={{ flex: 1 }}>
            <span className="search__icon"><Icon name="search" size={16} /></span>
            <input
              className="input"
              placeholder="Search by product name, SKU or category…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          {onImportClick && (
            <button className="btn" onClick={onImportClick}><Icon name="doc" size={14} /> Import spreadsheet</button>
          )}
          <button className="btn"><Icon name="filter" size={14} /> Advanced</button>
        </div>
        <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} className={'chip ' + (cat === c ? 'active' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
          <button className={'chip ' + (stockOnly ? 'active' : '')} onClick={() => setStockOnly(!stockOnly)}>In stock only</button>
          <button className={'chip ' + (dtOnly ? 'active' : '')} onClick={() => setDtOnly(!dtOnly)}>Drug Tariff (DT)</button>
        </div>
      </div>

      {lines.length > 0 && (
        <div className="row end gap-8" style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', alignItems: 'center' }}>
          <button className="btn btn--sm" onClick={onCancel} style={{ visibility: onReview ? 'visible' : 'hidden' }}>Cancel</button>
          {onReview && (
            <button className="btn btn--primary btn--sm" onClick={onReview}>
              Review {lines.length} {lines.length === 1 ? 'item' : 'items'} ({fmt(total)}) <Icon name="arrow-right" size={13} />
            </button>
          )}
        </div>
      )}

      <div className="cat-head">
        <div />
        <div>Product</div>
        <div>Pack</div>
        <div>{showStock ? 'Stock' : 'Availability'}</div>
        <div className="right">Unit price</div>
        <div className="right">Action</div>
      </div>

      <div>
        {paged.map(p => {
          const line = findLine(p.sku)
          const inBasket = !!line
          return (
            <div
              key={p.sku}
              className={'cat-row ' + (inBasket ? 'is-in-basket ' : '') + (p.stockState === 'out' ? 'is-out' : '')}
            >
              <div className="cat-row__type">{p.form}</div>
              <div style={{ minWidth: 0 }}>
                <div className="cat-row__name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                <div className="cat-row__sub">
                  {p.sku} · {p.category}
                  {p.controlled && <span className="badge" style={{ marginLeft: 8, height: 18, fontSize: 10 }}>CD</span>}
                  {p.dt && <span className="badge" style={{ marginLeft: 6, height: 18, fontSize: 10 }}>DT</span>}
                </div>
              </div>
              <div className="mono tnum">{p.pack}</div>
              <div>
                {showStock
                  ? <StockDot state={p.stockState} n={p.stock} />
                  : (
                    <span className="status status--neutral">
                      <span className="status__dot" />
                      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        {p.stockState === 'out' ? 'Unavailable' : p.stockState === 'low' ? 'Limited' : 'Available'}
                      </span>
                    </span>
                  )
                }
              </div>
              <div className="right">
                <div className="mono tnum" style={{ fontWeight: 600 }}>{fmt(p.unit)}</div>
                {p.listPrice && <div className="mono muted" style={{ fontSize: 11, textDecoration: 'line-through' }}>{fmt(p.listPrice)}</div>}
              </div>
              <div className="row end gap-8">
                {inBasket ? (
                  <div className="qty-mini">
                    <button className="qty-mini__btn" onClick={() => setQty(p.sku, line.qty - 1)}>−</button>
                    <span className="qty-mini__val">{line.qty}</span>
                    <button className="qty-mini__btn" onClick={() => setQty(p.sku, line.qty + 1)}>+</button>
                  </div>
                ) : (
                  <button className="btn btn--sm" disabled={p.stockState === 'out'} onClick={() => addToBasket(p)}>
                    <Icon name="plus" size={13} /> Add
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {paged.length === 0 && (
          <div className="empty">
            <h3>No products match.</h3>Try a broader search or clear category filters.
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px' }}>
        <div className="muted" style={{ fontSize: 12 }}>
          Showing{' '}
          <b className="mono" style={{ color: 'var(--ink-2)' }}>{(page - 1) * 9 + 1}–{Math.min(page * 9, filtered.length)}</b>
          {' '}of{' '}
          <b className="mono" style={{ color: 'var(--ink-2)' }}>{filtered.length}</b> products
          <span className="muted-2" style={{ marginLeft: 8 }}>(of 3,475 catalogue)</span>
        </div>
        <Pager page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
