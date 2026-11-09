import { createContext, type PropsWithChildren, useContext, useRef, useState } from 'react'

import {
  canWithdrawRequest,
  createEmployeeRequest,
  initialEmployeeRequests,
  type EmployeeRequest,
  type NewEmployeeRequest
} from './employee-requests'
import { inboxNotifications, type InboxNotification } from './inbox-notifications'

export type DemoDecisionKind = 'approved' | 'override' | 'rejected'
export interface DemoDecision {
  kind: DemoDecisionKind
  reason?: string
  requestId: string
}

interface DemoState {
  requests: EmployeeRequest[]
  managerDecisions: Record<string, DemoDecision>
  spendingDecisions: Record<string, DemoDecision>
  notifications: InboxNotification[]
}

interface RequestsContextValue extends DemoState {
  createRequest: (request: NewEmployeeRequest) => EmployeeRequest
  withdrawRequest: (requestId: string) => boolean
  decide: (role: 'manager' | 'spending', decision: DemoDecision) => boolean
  markNotificationRead: (notificationId: string) => void
}

const RequestsContext = createContext<RequestsContextValue | undefined>(undefined)

export function RequestsProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<DemoState>(() => ({
    requests: initialEmployeeRequests,
    managerDecisions: {},
    spendingDecisions: {},
    notifications: inboxNotifications
  }))
  const stateRef = useRef(state)
  const nextRequestNumber = useRef(2107)

  function commit(next: DemoState) {
    stateRef.current = next
    setState(next)
  }

  function createRequest(input: NewEmployeeRequest) {
    const at = new Date().toISOString()
    const request = createEmployeeRequest(input, `BM01-${nextRequestNumber.current}`, at)
    nextRequestNumber.current += 1
    commit({
      ...stateRef.current,
      requests: [request, ...stateRef.current.requests],
      notifications: [
        {
          id: `notice-${request.id}-assigned`,
          isRead: false,
          kind: 'assignedNeed',
          occurredAt: at,
          requestId: request.id,
          role: 'manager',
          softwareName: request.softwareName
        },
        ...stateRef.current.notifications
      ]
    })
    return request
  }

  function withdrawRequest(requestId: string) {
    const current = stateRef.current
    const request = current.requests.find((item) => item.id === requestId)
    if (!request || !canWithdrawRequest(request.status)) return false
    const at = new Date().toISOString()
    const recipient =
      request.status === 'awaitingNeed' ? 'manager' : request.status === 'spendApproval' ? 'spending' : undefined

    commit({
      ...current,
      notifications: recipient
        ? [
            {
              id: `notice-${requestId}-withdrawn`,
              isRead: false,
              kind: 'withdrawn',
              occurredAt: at,
              requestId,
              role: recipient,
              softwareName: request.softwareName
            },
            ...current.notifications
          ]
        : current.notifications,
      requests: current.requests.map((item) =>
        item.id === requestId
          ? {
              ...item,
              notice: undefined,
              status: 'withdrawn',
              timeline: [...item.timeline, { at, event: 'withdrawn' }]
            }
          : item
      )
    })
    return true
  }

  function decide(role: 'manager' | 'spending', decision: DemoDecision) {
    const current = stateRef.current
    const { requestId, kind } = decision
    const reason = decision.reason?.trim()
    const employeeRequest = current.requests.find((item) => item.id === requestId)
    const decisions = role === 'manager' ? current.managerDecisions : current.spendingDecisions
    const validEmployee =
      role === 'manager'
        ? employeeRequest?.status === 'awaitingNeed'
        : requestId === 'BM01-2104' && employeeRequest?.status === 'spendApproval'
    const validOther =
      role === 'manager' ? requestId === 'BM01-2091' : requestId === 'BM01-2095' || requestId === 'BM01-2088'

    if (decisions[requestId] || (!validEmployee && !validOther)) return false
    if ((kind === 'rejected' || kind === 'override') && (!reason || reason.length < 10)) return false
    if (role === 'manager' && kind === 'override') return false
    if (
      role === 'spending' &&
      ((requestId === 'BM01-2095' && kind === 'approved') || (requestId !== 'BM01-2095' && kind === 'override'))
    )
      return false

    const at = new Date().toISOString()
    const newDecision = { ...decision, reason }
    let requests = current.requests
    let notifications = current.notifications
    if (employeeRequest) {
      const event = kind === 'rejected' ? 'rejected' : role === 'manager' ? 'needApproved' : 'spendApproved'
      requests = requests.map((item) =>
        item.id !== requestId
          ? item
          : {
              ...item,
              notice: undefined,
              status:
                kind === 'rejected'
                  ? 'rejected'
                  : role === 'manager'
                    ? 'awaitingManagerSubmission'
                    : 'awaitingExecution',
              decisionReason: kind === 'rejected' ? reason : undefined,
              rejectedBy: kind === 'rejected' ? role : undefined,
              timeline: [
                ...item.timeline,
                { at, event },
                ...(event === 'spendApproved' ? [{ at, event: 'awaitingExecution' as const }] : [])
              ]
            }
      )
      notifications = [
        {
          id: `notice-${requestId}-${event}`,
          isRead: false,
          kind: event,
          occurredAt: at,
          requestId,
          softwareName: employeeRequest.softwareName,
          reason: kind === 'rejected' ? reason : undefined
        },
        ...notifications
      ]
    } else if (role === 'spending' && requestId === 'BM01-2088') {
      notifications = [
        {
          id: `notice-${requestId}-need-decision`,
          isRead: false,
          kind: kind === 'rejected' ? 'otherRejected' : 'otherNeedApproved',
          occurredAt: at,
          requestId,
          role: 'manager',
          softwareName: 'DataDog',
          reason: kind === 'rejected' ? reason : undefined
        },
        ...notifications
      ]
    }

    commit({
      ...current,
      requests,
      notifications,
      ...(role === 'manager'
        ? { managerDecisions: { ...decisions, [requestId]: newDecision } }
        : { spendingDecisions: { ...decisions, [requestId]: newDecision } })
    })
    return true
  }

  function markNotificationRead(notificationId: string) {
    const current = stateRef.current
    commit({
      ...current,
      notifications: current.notifications.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item
      )
    })
  }

  return (
    <RequestsContext.Provider value={{ ...state, createRequest, withdrawRequest, decide, markNotificationRead }}>
      {children}
    </RequestsContext.Provider>
  )
}

export function useRequests() {
  const context = useContext(RequestsContext)
  if (!context) throw new Error('useRequests must be used within RequestsProvider')
  return context
}
