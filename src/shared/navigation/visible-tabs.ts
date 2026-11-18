import type { MeResponseDtoData } from '@/shared/api/generated/contracts/me'

export type TabName =
  'home' | 'my-software' | 'live-need-approvals' | 'spending-approvals' | 'live-requests' | 'live-inbox' | 'profile'

// The one place that decides which tabs a signed-in account sees.
export function visibleTabs(account: MeResponseDtoData | undefined): TabName[] {
  const role = account?.roles.length === 1 ? account.roles[0] : undefined
  const work: TabName =
    role === 'MANAGER' && account?.managerScope
      ? 'live-need-approvals'
      : role === 'SPENDING_APPROVER'
        ? 'spending-approvals'
        : 'my-software'
  return ['home', work, 'live-requests', 'live-inbox', 'profile']
}
