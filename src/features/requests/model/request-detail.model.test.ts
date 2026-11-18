import type { AccessRequestResponseDtoDataRequest } from '@/shared/api/generated/contracts/access-requests'

import { approvalRoute, canOfferWithdrawal, canRequestAgain } from './request-detail.model'

const id = '01234567-89ab-cdef-0123-456789abcdef'

function request(overrides: Partial<AccessRequestResponseDtoDataRequest> = {}): AccessRequestResponseDtoDataRequest {
  return {
    id,
    type: 'GRANT',
    state: 'PENDING',
    routing: { mode: 'VIA_HEAD', oneStepReason: null },
    plan: { planId: id, planName: 'Pro', applicationId: id, applicationName: 'Figma' },
    requester: { employeeId: id, employeeCode: 'E1', fullName: 'An' },
    spend: null,
    withdrawal: null,
    needStep: { id, state: 'PENDING', assignee: null, waitingReason: null },
    ...overrides
  } as AccessRequestResponseDtoDataRequest
}

test('offers withdrawal only to the requester of a withdrawable request', () => {
  expect(canOfferWithdrawal(request(), id)).toBe(true)
  expect(canOfferWithdrawal(request(), 'other')).toBe(false)
  expect(canOfferWithdrawal(request({ state: 'COMPLETED' }), id)).toBe(false)
  expect(canOfferWithdrawal(request({ state: 'REJECTED' }), id)).toBe(false)
  expect(canOfferWithdrawal(request({ state: 'AWAITING_REQUESTER_REVISION' }), id)).toBe(true)
})

test('offers a new request only after a closed individual request', () => {
  expect(canRequestAgain(request({ state: 'REJECTED' }))).toBe(true)
  expect(canRequestAgain(request({ state: 'PENDING' }))).toBe(false)
  expect(canRequestAgain(request({ state: 'WITHDRAWN', type: 'GROUP_GRANT' }))).toBe(false)
})

test('builds a head route for a pending paid request', () => {
  const steps = approvalRoute(request({ spend: { stage: 'NOT_SUBMITTED' } as never }))
  expect(steps.map((step) => [step.kind, step.status])).toEqual([
    ['NEED', 'current'],
    ['SPEND', 'upcoming'],
    ['IT', 'upcoming']
  ])
})

test('builds a one-step route without a need step', () => {
  const steps = approvalRoute(
    request({
      state: 'AWAITING_SPEND_DECISION',
      routing: { mode: 'ONE_STEP', oneStepReason: 'REQUESTER_IS_HEAD' }
    })
  )
  expect(steps.map((step) => [step.kind, step.status, step.note])).toEqual([
    ['SPEND', 'current', 'REQUESTER_IS_HEAD'],
    ['IT', 'upcoming', undefined]
  ])
})

test('stops at the rejecting step', () => {
  const needRejected = approvalRoute(
    request({
      state: 'REJECTED',
      spend: { stage: 'NOT_SUBMITTED' } as never,
      needStep: { id, state: 'REJECTED', assignee: null, waitingReason: null } as never
    })
  )
  expect(needRejected[0]?.status).toBe('stopped')
  expect(needRejected[1]?.status).toBe('upcoming')
  const spendRejected = approvalRoute(
    request({
      state: 'REJECTED',
      spend: { stage: 'REFUSED' } as never,
      needStep: { id, state: 'APPROVED', assignee: null, waitingReason: null } as never
    })
  )
  expect(spendRejected.map((step) => step.status)).toEqual(['done', 'stopped', 'upcoming'])
})
