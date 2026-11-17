import { goBackOr } from './go-back-or'

describe('goBackOr', () => {
  test('returns to history when available', () => {
    const router = { back: jest.fn(), canGoBack: () => true, replace: jest.fn() }
    goBackOr(router, '/my-requests')
    expect(router.back).toHaveBeenCalledTimes(1)
    expect(router.replace).not.toHaveBeenCalled()
  })

  test('uses the fallback when opened directly', () => {
    const router = { back: jest.fn(), canGoBack: () => false, replace: jest.fn() }
    goBackOr(router, '/my-requests')
    expect(router.back).not.toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledWith('/my-requests')
  })
})
