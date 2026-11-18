import type { LinesResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/group-requests'

import { groupNeedBody, isDecidableNeedType, pendingNeedLines } from './group-need-decision.model'

const line = (id: string, state = 'AWAITING_NEED') =>
  ({ employee: { employeeId: id, employeeCode: id, fullName: id }, state }) as unknown as LinesResponseDtoDataItemsItem

const yes = [{ code: 'Q1', answer: 'YES' as const }]
const base = { policyVersionId: 'v1', returnAll: false, returnReason: '', reasons: {} }

test('only people still awaiting the need decision are decided', () => {
  expect(pendingNeedLines([line('a'), line('b', 'NEED_CONFIRMED')]).map((l) => l.employee.employeeId)).toEqual(['a'])
})

test('requires a choice for every pending person and every checklist answer', () => {
  const pending = [line('a'), line('b')]
  expect(groupNeedBody({ ...base, pending, choices: { a: 'APPROVE' }, checklist: yes }).status).toBe('incomplete')
  expect(
    groupNeedBody({
      ...base,
      pending,
      choices: { a: 'APPROVE', b: 'APPROVE' },
      checklist: [{ code: 'Q1', answer: undefined }]
    }).status
  ).toBe('incomplete')
})

test('builds an approve and reject body, requiring a reason unless a No explains it', () => {
  const pending = [line('a'), line('b')]
  const choices = { a: 'APPROVE', b: 'REJECT' } as const
  expect(groupNeedBody({ ...base, pending, choices, checklist: yes }).status).toBe('reason')
  const ok = groupNeedBody({ ...base, pending, choices, reasons: { b: ' Không cần ' }, checklist: yes })
  expect(ok).toMatchObject({
    status: 'ok',
    body: {
      lines: [
        { employeeId: 'a', decision: 'APPROVE' },
        { employeeId: 'b', decision: 'REJECT', reason: 'Không cần' }
      ],
      checklist: { policyVersionId: 'v1', answers: [{ itemCode: 'Q1', answer: 'YES' }] }
    }
  })
  const withNo = groupNeedBody({ ...base, pending, choices, checklist: [{ code: 'Q1', answer: 'NO' }] })
  expect(withNo.status).toBe('ok')
})

test('returns every pending person at once', () => {
  const result = groupNeedBody({
    ...base,
    pending: [line('a'), line('b')],
    choices: {},
    returnAll: true,
    returnReason: 'Bổ sung',
    checklist: yes
  })
  expect(result).toMatchObject({
    status: 'ok',
    body: {
      lines: [
        { employeeId: 'a', decision: 'RETURN', reason: 'Bổ sung' },
        { employeeId: 'b', decision: 'RETURN', reason: 'Bổ sung' }
      ]
    }
  })
})

test('does not decide old service account records', () => {
  expect(isDecidableNeedType('GROUP_GRANT')).toBe(true)
  expect(isDecidableNeedType('RENEWAL')).toBe(true)
  expect(isDecidableNeedType('SERVICE_ACCOUNT')).toBe(false)
})
