import type { RequestStatus } from '@/entities/demo-requests'

export type ManagerApprovalFilter = 'all' | 'longTerm' | 'outsideStandard'

export interface ManagerApproval {
  budgetPlan?: string
  budgetPlanUnknown?: boolean
  department: string
  durationMonths: number
  id: string
  isStandard?: boolean
  requesterName: string
  requesterRole: string
  reasonKey?: 'manager.reasons.claude' | 'manager.reasons.raycast'
  reason?: string
  slaHoursRemaining?: number
  softwareName: string
}

export interface DepartmentVisibleRequest {
  id: string
  kind:
    | 'financeReview'
    | 'selfRequest'
    | 'needApproved'
    | 'rejected'
    | 'withdrawn'
    | 'employeeStatus'
    | 'otherApproved'
    | 'otherRejected'
  softwareName: string
  status?: RequestStatus
  reason?: string
}

export const managerApprovals: ManagerApproval[] = [
  {
    department: 'CC-TECH',
    durationMonths: 18,
    id: 'BM01-2102',
    isStandard: true,
    requesterName: 'Nguyễn Văn A',
    requesterRole: 'Product Dev',
    reasonKey: 'manager.reasons.claude',
    slaHoursRemaining: 28,
    softwareName: 'Claude Team AI'
  },
  {
    department: 'CC-TECH',
    durationMonths: 12,
    id: 'BM01-2091',
    isStandard: false,
    requesterName: 'Trần Minh Tuấn',
    requesterRole: 'Engineering',
    reasonKey: 'manager.reasons.raycast',
    slaHoursRemaining: 6,
    softwareName: 'Raycast Pro'
  }
]

export const departmentVisibleRequests: DepartmentVisibleRequest[] = [
  {
    id: 'BM01-2088',
    kind: 'selfRequest',
    softwareName: 'DataDog'
  },
  {
    id: 'BM01-2103',
    kind: 'financeReview',
    softwareName: 'Notion AI'
  }
]

export function filterManagerApprovals(approvals: ManagerApproval[], filter: ManagerApprovalFilter, search: string) {
  const query = search.trim().toLocaleLowerCase()

  return approvals.filter((approval) => {
    const matchesSearch =
      !query ||
      approval.id.toLocaleLowerCase().includes(query) ||
      approval.requesterName.toLocaleLowerCase().includes(query) ||
      approval.softwareName.toLocaleLowerCase().includes(query)
    const matchesFilter =
      filter === 'all' || (filter === 'longTerm' ? approval.durationMonths > 12 : approval.isStandard === false)

    return matchesSearch && matchesFilter
  })
}
