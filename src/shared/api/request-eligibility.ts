import type { MeResponseDtoData } from '@/shared/api/generated/contracts/me'

export function mayCreateRequest(account: MeResponseDtoData | undefined): boolean {
  if (!account || account.roles.length !== 1 || account.employee.unplaced) return false
  const role = account.roles[0]
  return role === 'EMPLOYEE' || role === 'MANAGER' || role === 'IT_ADMIN' || role === 'FINANCE'
}
