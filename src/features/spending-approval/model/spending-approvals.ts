export type SpendingStep = 'need' | 'spending'
export type SpendingStepFilter = 'all' | SpendingStep

export interface SpendingApproval {
  budgetPlan?: string
  department: string
  financeOpinion: 'notProvided' | 'withinBudget'
  id: string
  isSelfRequest: boolean
  overrideRequired: boolean
  slaHoursRemaining: number
  softwareName: string
  step: SpendingStep
  annualCostVnd?: number
}

export interface BudgetSnapshot {
  availableVnd: number
  committedVnd: number
  limitVnd: number
}

export const spendingBudgetSnapshot: BudgetSnapshot = {
  availableVnd: 35000000,
  committedVnd: 165000000,
  limitVnd: 200000000
}

export const spendingApprovals: SpendingApproval[] = [
  {
    annualCostVnd: 8400000,
    budgetPlan: 'KH-2026-DEV-04',
    department: 'CC-TECH',
    financeOpinion: 'withinBudget',
    id: 'BM01-2104',
    isSelfRequest: false,
    overrideRequired: false,
    slaHoursRemaining: 6,
    softwareName: 'Slack Pro',
    step: 'spending'
  },
  {
    department: 'CC-TECH',
    financeOpinion: 'notProvided',
    id: 'BM01-2095',
    isSelfRequest: false,
    overrideRequired: true,
    slaHoursRemaining: 12,
    softwareName: 'Midjourney',
    step: 'spending'
  },
  {
    department: 'CC-TECH',
    financeOpinion: 'notProvided',
    id: 'BM01-2088',
    isSelfRequest: true,
    overrideRequired: false,
    slaHoursRemaining: 20,
    softwareName: 'DataDog',
    step: 'need'
  }
]

export function getRemainingBudgetAfterApproval(annualCostVnd?: number) {
  return annualCostVnd === undefined ? undefined : spendingBudgetSnapshot.availableVnd - annualCostVnd
}

export function filterSpendingApprovals(approvals: SpendingApproval[], step: SpendingStepFilter, search: string) {
  const query = search.trim().toLocaleLowerCase()

  return approvals.filter((approval) => {
    const matchesSearch =
      !query ||
      approval.id.toLocaleLowerCase().includes(query) ||
      approval.softwareName.toLocaleLowerCase().includes(query) ||
      approval.department.toLocaleLowerCase().includes(query)

    return matchesSearch && (step === 'all' || approval.step === step)
  })
}
