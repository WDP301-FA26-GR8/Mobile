export function formatDate(isoDate: string, language: string) {
  return new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(isoDate))
}

export function formatVnd(amount: number, language: string) {
  return new Intl.NumberFormat(language, {
    currency: 'VND',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(amount)
}
