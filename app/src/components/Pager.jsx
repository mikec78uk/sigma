import Icon from './Icon'

export default function Pager({ page, totalPages, onChange }) {
  return (
    <div className="pager">
      <button className="pager__btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <Icon name="chevron-left" size={14} />
      </button>
      <span>Page <b className="mono">{page}</b> of <b className="mono">{totalPages}</b></span>
      <button className="pager__btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <Icon name="chevron-right" size={14} />
      </button>
    </div>
  )
}
