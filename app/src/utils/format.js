export const fmt  = (n) => '£' + (Math.round(n * 100) / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtN = (n) => n.toLocaleString('en-GB')

/**
 * Display order IDs with DR- prefix for rejected / pending-approval orders.
 * The underlying ID stays SO- so routing and data lookups still work.
 */
export function fmtOrderId(id, status) {
  if ((status === 'pending-approval' || status === 'rejected') && id?.startsWith('SO-')) {
    return 'DR-' + id.slice(3)
  }
  return id
}

/**
 * Compute the pricing breakdown for a set of order lines.
 * Returns: { contractTotal, mldTotal, manualTotal, subtotal, hasMld, hasManual }
 */
export function calcPricingBreakdown(lines = []) {
  const contractTotal = lines.reduce((s, l) => {
    const base = l.listPrice || l.msp
    const contractBase = Math.round(base * (1 - (l.discount || 0) / 100) * 100) / 100
    return s + contractBase * l.qty
  }, 0)

  const mldTotal = lines.reduce((s, l) => {
    const mldPct = parseFloat(l.mld) || 0
    if (mldPct <= 0) return s
    const base = l.listPrice || l.msp
    const contractBase = Math.round(base * (1 - (l.discount || 0) / 100) * 100) / 100
    const expectedUnit = Math.round(contractBase * (1 - mldPct / 100) * 100) / 100
    if (Math.abs(l.unit - expectedUnit) > 0.005) return s // manual override — don't count as MLD
    return s + Math.round((contractBase - expectedUnit) * l.qty * 100) / 100
  }, 0)

  const manualTotal = lines.reduce((s, l) => {
    const base = l.listPrice || l.msp
    const contractBase = Math.round(base * (1 - (l.discount || 0) / 100) * 100) / 100
    const mldPct = parseFloat(l.mld) || 0
    const expectedUnit = Math.round(contractBase * (1 - mldPct / 100) * 100) / 100
    const isManualOverride = Math.abs(l.unit - expectedUnit) > 0.005
    if (!isManualOverride || l.unit >= contractBase) return s
    return s + Math.round((contractBase - l.unit) * l.qty * 100) / 100
  }, 0)

  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0)

  return {
    contractTotal,
    mldTotal,
    manualTotal,
    subtotal,
    hasMld: mldTotal > 0.005,
    hasManual: manualTotal > 0.005,
  }
}
