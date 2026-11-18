// One-time links put the token in the URL fragment (`#token=…`); a query string is accepted as a fallback.
export function tokenFromUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const hashIndex = url.indexOf('#')
  const queryIndex = url.indexOf('?')
  const fragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : ''
  const query = queryIndex >= 0 ? url.slice(queryIndex + 1, hashIndex > queryIndex ? hashIndex : undefined) : ''
  for (const source of [fragment, query]) {
    const token = new URLSearchParams(source).get('token')
    if (token && /^[\w.~+/=-]{8,2048}$/.test(token)) return token
  }
  return undefined
}
