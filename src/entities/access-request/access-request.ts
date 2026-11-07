export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'withdrawn'
export type TermMonths = 3 | 6 | 12
export type ReasonPreset = 'projectChannel'
export type RejectionPreset = 'standardTool'
export type RejectedBy = 'manager' | 'approver'
export type TimelineStepId = 'submitted' | 'need' | 'spend' | 'provision' | 'ready'
export type TimelineStepState = 'done' | 'current' | 'upcoming' | 'rejected'

export interface AccessRequest {
  id: string
  catalogId: string | null
  softwareName: string
  status: RequestStatus
  costVnd: number
  termMonths: TermMonths
  reasonPreset: ReasonPreset | null
  reasonText: string | null
  submittedAt: string
  rejectedAt: string | null
  withdrawnAt: string | null
  rejectionPreset: RejectionPreset | null
  rejectedBy: RejectedBy | null
}

export interface TimelineStep {
  id: TimelineStepId
  state: TimelineStepState
}

export interface NewAccessRequest {
  id: string
  catalogId: string
  softwareName: string
  costVnd: number
  termMonths: TermMonths
  reasonText: string
  submittedAt: string
}

export const demoRequests: AccessRequest[] = [
  {
    id: 'req-slack',
    catalogId: null,
    softwareName: 'Slack Business+',
    status: 'pending',
    costVnd: 0,
    termMonths: 12,
    reasonPreset: 'projectChannel',
    reasonText: null,
    submittedAt: '2026-11-06T00:00:00.000Z',
    rejectedAt: null,
    withdrawnAt: null,
    rejectionPreset: null,
    rejectedBy: null
  },
  {
    id: 'req-adobe',
    catalogId: null,
    softwareName: 'Adobe Illustrator',
    status: 'rejected',
    costVnd: 8_000_000,
    termMonths: 12,
    reasonPreset: 'projectChannel',
    reasonText: null,
    submittedAt: '2026-10-20T00:00:00.000Z',
    rejectedAt: '2026-10-21T00:00:00.000Z',
    withdrawnAt: null,
    rejectionPreset: 'standardTool',
    rejectedBy: 'manager'
  }
]

export function findRequest(requests: AccessRequest[], requestId: string | null): AccessRequest | null {
  if (!requestId) return null
  return requests.find((request) => request.id === requestId) ?? null
}

export function requestsForFilter(requests: AccessRequest[], status: RequestStatus): AccessRequest[] {
  return requests.filter((request) => request.status === status)
}

export function createAccessRequest(input: NewAccessRequest): AccessRequest {
  return {
    id: input.id,
    catalogId: input.catalogId,
    softwareName: input.softwareName,
    status: 'pending',
    costVnd: input.costVnd,
    termMonths: input.termMonths,
    reasonPreset: null,
    reasonText: input.reasonText,
    submittedAt: input.submittedAt,
    rejectedAt: null,
    withdrawnAt: null,
    rejectionPreset: null,
    rejectedBy: null
  }
}

export function withdrawAccessRequest(request: AccessRequest, withdrawnAt: string): AccessRequest {
  if (request.status !== 'pending') return request

  return {
    ...request,
    status: 'withdrawn',
    withdrawnAt
  }
}

export function timelineFor(request: AccessRequest): TimelineStep[] {
  const includeSpend = request.costVnd > 0
  const ids: TimelineStepId[] = includeSpend
    ? ['submitted', 'need', 'spend', 'provision', 'ready']
    : ['submitted', 'need', 'provision', 'ready']

  return ids.map((id) => ({ id, state: stepState(request, id) }))
}

function stepState(request: AccessRequest, id: TimelineStepId): TimelineStepState {
  if (id === 'submitted') return 'done'

  if (request.status === 'withdrawn' || request.status === 'pending') {
    return id === 'need' && request.status === 'pending' ? 'current' : 'upcoming'
  }

  if (request.status === 'rejected') {
    const rejectedStep = request.rejectedBy === 'approver' ? 'spend' : 'need'
    if (id === rejectedStep) return 'rejected'
    if (id === 'need' && rejectedStep === 'spend') return 'done'
    return 'upcoming'
  }

  if (request.status === 'completed') return 'done'

  if (request.status === 'approved') {
    if (id === 'need') return 'done'
    const current = request.costVnd > 0 ? 'spend' : 'provision'
    return id === current ? 'current' : 'upcoming'
  }

  return 'upcoming'
}
