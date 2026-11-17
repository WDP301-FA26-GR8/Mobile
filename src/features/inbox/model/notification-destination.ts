import type { NotificationListResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/notifications'
import type { MeResponseDtoData } from '@/shared/api/generated/contracts/me'

export type NotificationDestination =
  | { type: 'request'; requestId: string }
  | { type: 'manager' }
  | { type: 'software' }
  | { type: 'software-detail'; assignmentId: string }
  | { type: 'web' }

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value)

const requestCodes = new Set([
  'REQUEST_SUBMITTED',
  'REQUEST_GRANTED',
  'REQUEST_NEED_APPROVED',
  'REQUEST_NEED_REJECTED',
  'REQUEST_REJECTED',
  'REQUEST_RETURNED',
  'REQUEST_IT_REJECTED',
  'REQUEST_SPEND_APPROVED',
  'REQUEST_SPEND_REJECTED',
  'REQUEST_FAILED',
  'REQUEST_WITHDRAWN',
  'REQUEST_WITHDRAWAL_PENDING',
  'REQUEST_CANCELLED',
  'REQUEST_CANCELLED_BENEFICIARY_GONE',
  'REQUEST_WAITING_CONTROLLED',
  'REQUEST_WAITING_ENDED',
  'REQUEST_BUDGET_BLOCKED',
  'REQUEST_RETURNED_AT_DECISION',
  'STEP_CLOSED_BY_WITHDRAWAL',
  'STEP_SLA_REMINDER'
])

export function notificationDestination(
  notification: NotificationListResponseDtoDataItemsItem,
  account: MeResponseDtoData | undefined
): NotificationDestination {
  if (notification.code === 'STEP_ASSIGNED') {
    if (
      notification.params.stepKind === 'NEED' &&
      account?.roles.length === 1 &&
      account.roles[0] === 'MANAGER' &&
      account.managerScope
    )
      return { type: 'manager' }
    return { type: 'web' }
  }
  if (['LICENSE_EXPIRY_REMINDER', 'RENEWAL_WINDOW_OPENED'].includes(notification.code)) {
    if (notification.params.audience !== 'EMPLOYEE') return { type: 'web' }
    const assignmentId =
      notification.subject?.type === 'LicenseAssignment'
        ? notification.subject.id
        : notification.subject === null
          ? notification.params.assignmentId
          : undefined
    return isUuid(assignmentId) ? { type: 'software-detail', assignmentId } : { type: 'web' }
  }
  if (
    ['REVOCATION_UPCOMING', 'REVOCATION_CANCELLED'].includes(notification.code) ||
    (notification.code === 'TRANSFER_RIGHTS_REVOKING' && notification.params.employeeId === account?.employee.id)
  ) {
    return { type: 'software' }
  }
  if (notification.code === 'STEP_SLA_REMINDER' && notification.params.stepKind !== 'NEED') return { type: 'web' }
  if (!requestCodes.has(notification.code)) return { type: 'web' }
  const requestId =
    notification.subject?.type === 'ACCESS_REQUEST'
      ? notification.subject.id
      : notification.subject === null
        ? notification.params.requestId
        : undefined
  if (isUuid(requestId)) {
    return { type: 'request', requestId }
  }
  return { type: 'web' }
}
