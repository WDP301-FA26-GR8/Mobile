import { tokenFromUrl } from './link-token'

test('reads the token from the fragment first', () => {
  expect(tokenFromUrl('myapp://activate#token=abcdef123456')).toBe('abcdef123456')
  expect(tokenFromUrl('https://host/reset-password?x=1#token=abcdef123456')).toBe('abcdef123456')
})

test('falls back to the query string', () => {
  expect(tokenFromUrl('myapp://activate?token=abcdef123456')).toBe('abcdef123456')
})

test('ignores missing or malformed tokens', () => {
  expect(tokenFromUrl(null)).toBeUndefined()
  expect(tokenFromUrl('myapp://activate')).toBeUndefined()
  expect(tokenFromUrl('myapp://activate#token=<script>')).toBeUndefined()
  expect(tokenFromUrl('myapp://activate#token=short')).toBeUndefined()
})
