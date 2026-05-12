export const fmt  = (n) => '£' + (Math.round(n * 100) / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtN = (n) => n.toLocaleString('en-GB')
