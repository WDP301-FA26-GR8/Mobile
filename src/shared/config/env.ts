function normalizeBaseUrl(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must not be empty')
  }

  return trimmed.replace(/\/$/, '')
}

export const env = Object.freeze({
  API_BASE_URL: normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000')
})
