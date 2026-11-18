import type { AccessRequestResponseDtoDataRequest } from '@/shared/api/generated/contracts/access-requests'

// The server still decides whether a withdrawal is accepted; unknown states are denied.
const withdrawableStates: readonly string[] = [
  'PENDING',
  'AWAITING_REQUESTER_REVISION',
  'WAITING_CONTROLLED',
  'AWAITING_IT_ASSESSMENT',
  'AWAITING_SPEND_SUBMISSION',
  'AWAITING_SPEND_DECISION',
  'AWAITING_EXECUTION',
  'EXECUTING',
  'FAILED'
]

const reRequestableStates: readonly string[] = ['REJECTED', 'IT_REJECTED', 'FAILED', 'WITHDRAWN', 'CANCELLED']

export function canOfferWithdrawal(request: AccessRequestResponseDtoDataRequest, employeeId: string | undefined) {
  return (
    !!employeeId &&
    request.requester.employeeId === employeeId &&
    !request.withdrawal &&
    withdrawableStates.includes(request.state)
  )
}

export function canRequestAgain(request: AccessRequestResponseDtoDataRequest) {
  return request.type === 'GRANT' && !!request.plan && reRequestableStates.includes(request.state)
}

export type RouteStepStatus = 'done' | 'current' | 'upcoming' | 'stopped'

export type ApprovalRouteStep = {
  kind: 'NEED' | 'SPEND' | 'IT'
  status: RouteStepStatus
  holder?: string
  note?: 'REQUESTER_IS_HEAD' | 'NO_DEPARTMENT_HEAD' | 'HEAD_LEFT' | 'WAITING_NO_HEAD' | 'WAITING_NO_SPENDING_APPROVER'
}

const endedStates: readonly string[] = ['REJECTED', 'IT_REJECTED', 'WITHDRAWN', 'CANCELLED']
const grantStates: readonly string[] = ['AWAITING_EXECUTION', 'EXECUTING', 'AWAITING_IT_CLOSE', 'COMPLETED', 'FAILED']

export function approvalRoute(request: AccessRequestResponseDtoDataRequest): ApprovalRouteStep[] {
  const { state, needStep, routing } = request
  const ended = endedStates.includes(state)
  const steps: ApprovalRouteStep[] = []
  const needRejected = needStep.state === 'REJECTED'

  if (routing.mode !== 'ONE_STEP') {
    const open = needStep.state === 'PENDING' || needStep.state === 'WAITING'
    steps.push({
      kind: 'NEED',
      holder: needStep.assignee?.fullName,
      status:
        needStep.state === 'APPROVED' || needStep.state === 'NOT_REQUIRED'
          ? 'done'
          : open && !ended
            ? 'current'
            : 'stopped',
      note: needStep.waitingReason === 'NO_DEPARTMENT_HEAD' ? 'WAITING_NO_HEAD' : undefined
    })
  }
  if (request.spend || routing.mode === 'ONE_STEP') {
    steps.push({
      kind: 'SPEND',
      status: grantStates.includes(state)
        ? 'done'
        : state === 'AWAITING_SPEND_DECISION'
          ? 'current'
          : state === 'REJECTED' && !needRejected
            ? 'stopped'
            : 'upcoming',
      note:
        routing.mode === 'ONE_STEP'
          ? (routing.oneStepReason ?? undefined)
          : needStep.waitingReason === 'NO_SPENDING_APPROVER'
            ? 'WAITING_NO_SPENDING_APPROVER'
            : undefined
    })
  }
  steps.push({
    kind: 'IT',
    status:
      state === 'COMPLETED'
        ? 'done'
        : state === 'FAILED' || state === 'IT_REJECTED'
          ? 'stopped'
          : grantStates.includes(state)
            ? 'current'
            : 'upcoming'
  })
  return steps
}
