import { assertSecureApiOrigin } from './secure-origin'

test('requires a clean HTTPS origin in release builds', () => {
  expect(() => assertSecureApiOrigin('https://api.example.test', false)).not.toThrow()
  expect(() => assertSecureApiOrigin('http://localhost:3000', false)).toThrow()
  expect(() => assertSecureApiOrigin('https://api.example.test/api/v1', false)).toThrow()
  expect(() => assertSecureApiOrigin('https://user:password@api.example.test', false)).toThrow()
  expect(() => assertSecureApiOrigin('https://api.example.test?key=value', false)).toThrow()
})

test('allows HTTP for development environments only', () => {
  expect(() => assertSecureApiOrigin('http://10.0.2.2:3000', true)).not.toThrow()
  expect(() => assertSecureApiOrigin('http://10.0.2.2:3000', false)).toThrow()
})
