import type { LinesResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/group-requests'

import { formatSpendDate, formatSpendMoney, pendingSpendApprovalLines } from './live-spending-approvals'

test('only returns grouped lines still waiting for the spending decision', () => {
  const line: LinesResponseDtoDataItemsItem = {
    employee: { employeeId: 'employee-1', employeeCode: 'E1', fullName: 'Employee' },
    position: 1,
    state: 'NEED_CONFIRMED',
    needStep: { id: 'step-1', state: 'APPROVED', assignee: null },
    expectedEndDate: null,
    needDecision: null,
    spendDecision: null,
    cost: null,
    share: null,
    endedAt: null,
    endedBy: null,
    endReason: null,
    cancelCause: null
  }
  const waiting = line
  const needPending: LinesResponseDtoDataItemsItem = { ...line, state: 'AWAITING_NEED' }
  const alreadyDecided: LinesResponseDtoDataItemsItem = {
    ...line,
    state: 'SPEND_REJECTED',
    spendDecision: {
      decision: 'REJECTED',
      reason: null,
      decidedBy: { employeeId: 'manager-1', employeeCode: 'M1', fullName: 'Manager' },
      deciderRole: 'SPENDING_APPROVER',
      decidedAt: '2026-01-01T00:00:00.000Z'
    }
  }

  expect(pendingSpendApprovalLines([waiting, needPending, alreadyDecided])).toEqual([waiting])
})

test('formats only valid monetary amounts and calendar dates', () => {
  expect(formatSpendMoney({ amount: '1,000', currency: 'VND' }, 'en')).toBeUndefined()
  expect(formatSpendMoney({ amount: '1200', currency: 'XXX' }, 'en')).toBeDefined()
  expect(formatSpendDate('2024-02-31', 'en')).toBeUndefined()
})
