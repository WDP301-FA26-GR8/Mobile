import { departmentVisibleRequests, filterManagerApprovals, managerApprovals } from './manager-approvals'

describe('manager approval mock data', () => {
  test('keeps actionable work separate from department-visible non-queue requests', () => {
    expect(managerApprovals.map(({ id }) => id)).toEqual(['BM01-2102', 'BM01-2091'])
    expect(departmentVisibleRequests.map(({ id }) => id)).toEqual(['BM01-2088', 'BM01-2103'])
  })

  test('filters long-term and outside-standard work without losing request identity', () => {
    expect(filterManagerApprovals(managerApprovals, 'longTerm', '').map(({ id }) => id)).toEqual(['BM01-2102'])
    expect(filterManagerApprovals(managerApprovals, 'outsideStandard', '').map(({ id }) => id)).toEqual(['BM01-2091'])
    expect(filterManagerApprovals(managerApprovals, 'all', 'TUẤN').map(({ id }) => id)).toEqual(['BM01-2091'])
  })
})
