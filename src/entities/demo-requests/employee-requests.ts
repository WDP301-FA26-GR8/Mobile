export type RequestStatus =
  | 'awaitingNeed'
  | 'awaitingManagerSubmission'
  | 'financeReview'
  | 'spendApproval'
  | 'awaitingExecution'
  | 'waitingInvitation'
  | 'provisioningFailed'
  | 'executing'
  | 'completed'
  | 'rejected'
  | 'withdrawn'

export type RequestTimelineEvent =
  | 'created'
  | 'needReviewPending'
  | 'needApproved'
  | 'financeReview'
  | 'rejected'
  | 'submittedWeb'
  | 'spendReviewPending'
  | 'spendApproved'
  | 'awaitingExecution'
  | 'executionStarted'
  | 'withdrawn'

export type RequestNotice = 'longTerm' | 'submittedWeb' | 'financeReview'

export interface RequestTimelineItem {
  at: string
  event: RequestTimelineEvent
}

export interface EmployeeRequest {
  budgetPlan?: string
  costPeriod?: 'annual'
  costVnd?: number
  durationMonths: number
  id: string
  notice?: RequestNotice
  rejectionReason?: 'adobeBudgetOptimized'
  decisionReason?: string
  rejectedBy?: 'manager' | 'spending'
  reason?: string
  softwareId: string
  softwareName: string
  status: RequestStatus
  timeline: RequestTimelineItem[]
}

export interface CatalogSoftware {
  category: 'ai' | 'productivity'
  descriptionKey: 'requests.catalog.descriptions.claude' | 'requests.catalog.descriptions.raycast'
  defaultDurationMonths: 12 | 18
  id: string
  isStandard: boolean
  name: string
}

export interface NewEmployeeRequest {
  durationMonths: 12 | 18
  reason: string
  softwareId: string
  softwareName: string
}

export const catalogSoftware: CatalogSoftware[] = [
  {
    category: 'ai',
    descriptionKey: 'requests.catalog.descriptions.claude',
    defaultDurationMonths: 18,
    id: 'claude',
    isStandard: true,
    name: 'Claude'
  },
  {
    category: 'productivity',
    descriptionKey: 'requests.catalog.descriptions.raycast',
    defaultDurationMonths: 12,
    id: 'raycast',
    isStandard: false,
    name: 'Raycast'
  }
]

export const initialEmployeeRequests: EmployeeRequest[] = [
  {
    durationMonths: 12,
    id: 'BM01-2101',
    softwareId: 'linear-plus',
    softwareName: 'Linear Plus',
    status: 'awaitingNeed',
    timeline: [
      { at: '2026-11-01T09:15:00+07:00', event: 'created' },
      { at: '2026-11-01T09:15:00+07:00', event: 'needReviewPending' }
    ]
  },
  {
    costVnd: 10560000,
    costPeriod: 'annual',
    durationMonths: 18,
    id: 'BM01-2102',
    notice: 'longTerm',
    softwareId: 'claude',
    softwareName: 'Claude Team AI',
    status: 'awaitingNeed',
    timeline: [
      { at: '2026-10-31T09:00:00+07:00', event: 'created' },
      { at: '2026-10-31T09:01:00+07:00', event: 'needReviewPending' }
    ]
  },
  {
    durationMonths: 12,
    id: 'BM01-2103',
    notice: 'financeReview',
    softwareId: 'notion',
    softwareName: 'Notion AI',
    status: 'financeReview',
    timeline: [
      { at: '2026-10-28T09:00:00+07:00', event: 'created' },
      { at: '2026-10-28T14:00:00+07:00', event: 'needApproved' },
      { at: '2026-10-28T15:00:00+07:00', event: 'financeReview' }
    ]
  },
  {
    budgetPlan: 'KH-2026-DEV-04',
    costVnd: 8400000,
    costPeriod: 'annual',
    durationMonths: 12,
    id: 'BM01-2104',
    notice: 'submittedWeb',
    softwareId: 'slack',
    softwareName: 'Slack Pro',
    status: 'spendApproval',
    timeline: [
      { at: '2026-10-27T09:30:00+07:00', event: 'created' },
      { at: '2026-10-27T13:00:00+07:00', event: 'needApproved' },
      { at: '2026-10-27T14:00:00+07:00', event: 'submittedWeb' },
      { at: '2026-10-27T14:05:00+07:00', event: 'spendReviewPending' }
    ]
  },
  {
    durationMonths: 12,
    id: 'BM01-2105',
    softwareId: 'raycast',
    softwareName: 'Raycast Pro',
    status: 'awaitingExecution',
    timeline: [
      { at: '2026-10-20T10:00:00+07:00', event: 'created' },
      { at: '2026-10-20T14:00:00+07:00', event: 'needApproved' },
      { at: '2026-10-20T15:00:00+07:00', event: 'awaitingExecution' }
    ]
  },
  {
    durationMonths: 12,
    id: 'BM01-2106',
    softwareId: 'cursor',
    softwareName: 'Cursor Pro',
    status: 'executing',
    timeline: [
      { at: '2026-10-19T11:00:00+07:00', event: 'created' },
      { at: '2026-10-19T15:00:00+07:00', event: 'needApproved' },
      { at: '2026-10-20T08:30:00+07:00', event: 'executionStarted' }
    ]
  },
  {
    durationMonths: 12,
    id: 'BM01-2041',
    rejectionReason: 'adobeBudgetOptimized',
    softwareId: 'adobe-creative-cloud',
    softwareName: 'Adobe Creative Cloud',
    status: 'rejected',
    timeline: [
      { at: '2025-08-20T09:00:00+07:00', event: 'created' },
      { at: '2025-08-20T11:00:00+07:00', event: 'rejected' }
    ]
  }
]

const withdrawableStatuses: RequestStatus[] = [
  'awaitingNeed',
  'awaitingManagerSubmission',
  'financeReview',
  'spendApproval',
  'awaitingExecution',
  'waitingInvitation',
  'provisioningFailed'
]

export function canWithdrawRequest(status: RequestStatus) {
  return withdrawableStatuses.includes(status)
}

export function createEmployeeRequest(
  request: NewEmployeeRequest,
  id: string,
  createdAt = '2026-11-08T09:00:00+07:00'
): EmployeeRequest {
  return {
    durationMonths: request.durationMonths,
    id,
    ...(request.durationMonths > 12 ? { notice: 'longTerm' as const } : {}),
    reason: request.reason,
    softwareId: request.softwareId,
    softwareName: request.softwareName,
    status: 'awaitingNeed',
    timeline: [
      { at: createdAt, event: 'created' },
      { at: createdAt, event: 'needReviewPending' }
    ]
  }
}
