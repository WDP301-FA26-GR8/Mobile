import {
  createAccessRequest,
  demoRequests,
  requestsForFilter,
  timelineFor,
  withdrawAccessRequest
} from './access-request'

describe('access requests', () => {
  test('hides the spend step when the request has no cost', () => {
    const pending = demoRequests.find((request) => request.id === 'req-slack')
    expect(pending).toBeDefined()
    if (!pending) return

    const steps = timelineFor(pending)
    expect(steps.map((step) => step.id)).toEqual(['submitted', 'need', 'provision', 'ready'])
    expect(steps.find((step) => step.id === 'need')?.state).toBe('current')
  })

  test('keeps the spend step when the request has a cost', () => {
    const created = createAccessRequest({
      catalogId: 'jetbrains',
      costVnd: 12_500_000,
      id: 'req-new-1',
      reasonText: 'Cần IDE cho dự án WDP',
      softwareName: 'JetBrains All Products',
      submittedAt: '2026-11-08T00:00:00.000Z',
      termMonths: 12
    })

    expect(timelineFor(created).map((step) => step.id)).toContain('spend')
  })

  test('marks the need step rejected and ignores withdraw', () => {
    const rejected = demoRequests.find((request) => request.id === 'req-adobe')
    expect(rejected).toBeDefined()
    if (!rejected) return

    expect(timelineFor(rejected).find((step) => step.id === 'need')?.state).toBe('rejected')
    expect(withdrawAccessRequest(rejected, '2026-11-08T00:00:00.000Z').status).toBe('rejected')
  })

  test('withdraws only a pending request and filters by status', () => {
    const pending = demoRequests.find((request) => request.id === 'req-slack')
    expect(pending).toBeDefined()
    if (!pending) return

    const withdrawn = withdrawAccessRequest(pending, '2026-11-08T00:00:00.000Z')
    const visible = requestsForFilter([withdrawn], 'withdrawn')

    expect(withdrawn.status).toBe('withdrawn')
    expect(visible).toHaveLength(1)
  })
})
