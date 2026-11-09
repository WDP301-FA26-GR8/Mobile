export class InvalidApiOriginError extends Error {
  constructor() {
    super('API base URL must be an HTTPS origin without credentials or a path')
    this.name = 'InvalidApiOriginError'
  }
}

export function assertSecureApiOrigin(value: string, development: boolean): void {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new InvalidApiOriginError()
  }
  if (
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    (url.protocol !== 'https:' && !(development && url.protocol === 'http:'))
  ) {
    throw new InvalidApiOriginError()
  }
}
