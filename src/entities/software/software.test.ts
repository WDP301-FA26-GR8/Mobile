import { filterSoftware, demoSoftware } from './software'

describe('filterSoftware', () => {
  test('returns the design assignment and an empty search result', () => {
    expect(filterSoftware(demoSoftware, { category: 'design', query: '' }).map((item) => item.id)).toEqual(['sw-figma'])
    expect(filterSoftware(demoSoftware, { category: 'all', query: 'khong-co' })).toEqual([])
  })
})
