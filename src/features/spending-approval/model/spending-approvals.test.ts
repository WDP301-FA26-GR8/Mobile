import {
  filterSpendingApprovals,
  getRemainingBudgetAfterApproval,
  spendingApprovals,
  spendingBudgetSnapshot
} from './spending-approvals'

describe('spending approval demo data', () => {
  test('keeps task step and SoD-4 owner explicit per request', () => {
    expect(spendingApprovals.map(({ id, step }) => [id, step])).toEqual([
      ['BM01-2104', 'spending'],
      ['BM01-2095', 'spending'],
      ['BM01-2088', 'need']
    ])
    expect(spendingApprovals.find(({ id }) => id === 'BM01-2088')?.isSelfRequest).toBe(true)
    expect(spendingApprovals.some(({ id }) => id === 'BM01-2103')).toBe(false)
  })

  test('calculates the read-only Slack snapshot consistently and omits unprovided quotes', () => {
    const slack = spendingApprovals.find(({ id }) => id === 'BM01-2104')
    const midjourney = spendingApprovals.find(({ id }) => id === 'BM01-2095')

    expect(spendingBudgetSnapshot.availableVnd).toBe(35000000)
    expect(getRemainingBudgetAfterApproval(slack?.annualCostVnd)).toBe(26600000)
    expect(getRemainingBudgetAfterApproval(midjourney?.annualCostVnd)).toBeUndefined()
  })

  test('filters tasks by approval step or identity', () => {
    expect(filterSpendingApprovals(spendingApprovals, 'need', '').map(({ id }) => id)).toEqual(['BM01-2088'])
    expect(filterSpendingApprovals(spendingApprovals, 'spending', '').map(({ id }) => id)).toEqual([
      'BM01-2104',
      'BM01-2095'
    ])
    expect(filterSpendingApprovals(spendingApprovals, 'all', 'midjourney').map(({ id }) => id)).toEqual(['BM01-2095'])
  })
})
