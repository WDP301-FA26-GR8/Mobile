export type ApiErrorInfo = { status?: number; code?: string; requestId?: string; details?: unknown }

// Generated fetch functions throw an Error carrying the HTTP status and the parsed error envelope.
export function apiErrorInfo(error: unknown): ApiErrorInfo {
  if (typeof error !== 'object' || error === null) return {}
  const status = 'status' in error && typeof error.status === 'number' ? error.status : undefined
  const info = 'info' in error ? error.info : undefined
  const detail =
    typeof info === 'object' && info !== null && 'error' in info && typeof info.error === 'object' ? info.error : null
  if (!detail) return { status }
  return {
    status,
    code: 'code' in detail && typeof detail.code === 'string' ? detail.code : undefined,
    requestId: 'requestId' in detail && typeof detail.requestId === 'string' ? detail.requestId : undefined,
    details: 'details' in detail ? detail.details : undefined
  }
}
