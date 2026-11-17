import type { MeResponseDtoData } from '@/shared/api/generated/contracts/me'
import type { NotificationListResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/notifications'

import { notificationDestination } from './notification-destination'

const account: NonNullable<MeResponseDtoData> = {
  appUserId: 'user',
  loginEmail: 'person@example.test',
  roles: ['MANAGER'],
  employee: { id: 'employee', employeeCode: 'E1', fullName: 'An', department: null, unplaced: false, jobTitle: null },
  managerScope: { departmentId: 'department', departmentCode: 'IT', departmentName: 'IT' },
  upcomingUnits: [],
  pendingPolicyAcknowledgements: [],
  avatar: null,
  workPhone: null
}
const notification: NotificationListResponseDtoDataItemsItem = {
  id: 'notice',
  code: 'STEP_ASSIGNED',
  subject: { type: 'ACCESS_REQUEST', id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' },
  params: { stepKind: 'NEED' },
  createdAt: '2026-11-09T00:00:00Z',
  readAt: null
}

test('only routes assigned need work to an active manager queue', () => {
  expect(notificationDestination(notification, account)).toEqual({
    type: 'manager',
    requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    source: 'assigned'
  })

  expect(notificationDestination({ ...notification, params: { stepKind: 'SPEND_APPROVAL' } }, account)).toEqual({
    type: 'web'
  })
  expect(notificationDestination(notification, { ...account, managerScope: null })).toEqual({ type: 'web' })
})

test('routes assigned spending decisions to the authenticated Spending Approver queue', () => {
  expect(
    notificationDestination(
      { ...notification, params: { stepKind: 'SPEND_APPROVAL' } },
      { ...account, roles: ['SPENDING_APPROVER'], managerScope: null }
    )
  ).toEqual({ type: 'spending', requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })
  expect(notificationDestination({ ...notification, params: { stepKind: 'SPEND_APPROVAL' } }, account)).toEqual({
    type: 'web'
  })
})

test('does not send IT or spending reminders to an employee request', () => {
  expect(
    notificationDestination(
      {
        ...notification,
        code: 'STEP_SLA_REMINDER',
        params: { stepKind: 'SPEND_APPROVAL' }
      },
      account
    )
  ).toEqual({ type: 'web' })
})

test('routes need reminders through the manager queue when the recipient is an active manager', () => {
  expect(notificationDestination({ ...notification, code: 'STEP_SLA_REMINDER' }, account)).toEqual({
    type: 'manager',
    requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    source: 'reminder'
  })
  expect(
    notificationDestination(
      { ...notification, code: 'STEP_SLA_REMINDER' },
      { ...account, roles: ['EMPLOYEE'], managerScope: null }
    )
  ).toEqual({ type: 'request', requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })
  expect(
    notificationDestination({ ...notification, subject: { type: 'ACCESS_REQUEST', id: 'invalid' } }, account)
  ).toEqual({ type: 'web' })
})

test('does not treat a transfer affecting another employee as personal access', () => {
  expect(
    notificationDestination(
      {
        ...notification,
        code: 'TRANSFER_RIGHTS_REVOKING',
        params: { employeeId: 'another-employee' }
      },
      account
    )
  ).toEqual({ type: 'web' })
})
