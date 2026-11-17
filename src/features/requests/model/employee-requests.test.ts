import { canWithdrawRequest } from './employee-requests'

describe('canWithdrawRequest', () => {
  test.each([
    'awaitingNeed',
    'awaitingManagerSubmission',
    'financeReview',
    'spendApproval',
    'awaitingExecution',
    'waitingInvitation',
    'provisioningFailed'
  ] as const)('allows withdrawal in %s', (status) => {
    expect(canWithdrawRequest(status)).toBe(true)
  })

  test.each(['executing', 'completed', 'rejected', 'withdrawn'] as const)('blocks withdrawal in %s', (status) => {
    expect(canWithdrawRequest(status)).toBe(false)
  })
})
