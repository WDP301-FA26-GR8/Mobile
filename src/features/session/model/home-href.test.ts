import { homeHref } from './home-href'

describe('homeHref', () => {
  test('sends each persona to their own tab', () => {
    expect(homeHref('employee')).toBe('/software/index')
    expect(homeHref('manager')).toBe('/manager-queue')
    expect(homeHref('approver')).toBe('/spend-queue')
  })
})
