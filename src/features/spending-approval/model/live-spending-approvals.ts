import type { LinesResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/group-requests'

export type SpendDecision = 'APPROVE' | 'REJECT' | 'RETURN'

export function pendingSpendApprovalLines(lines: LinesResponseDtoDataItemsItem[]) {
  return lines.filter((line) => line.state === 'NEED_CONFIRMED' && line.spendDecision === null)
}

export function formatSpendMoney(value: { amount: string; currency: string } | null | undefined, locale: string) {
  if (!value || !/^[A-Z]{3}$/.test(value.currency) || !/^\d{1,12}(\.\d{1,2})?$/.test(value.amount)) return undefined
  const amount = Number(value.amount)
  if (!Number.isFinite(amount)) return undefined
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatSpendDate(value: string | null | undefined, locale: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? undefined
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

export function spendDecisionErrorCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('info' in error)) return undefined
  const info = error.info
  if (typeof info !== 'object' || info === null || !('error' in info)) return undefined
  const detail = info.error
  return typeof detail === 'object' && detail !== null && 'code' in detail && typeof detail.code === 'string'
    ? detail.code
    : undefined
}

export function filterSpendApprovals<
  T extends {
    plan: { applicationName: string; planName: string } | null
    requestId: string
    requester: { fullName: string }
    costCenter: { code: string }
  }
>(items: T[], search: string) {
  const query = search.trim().toLocaleLowerCase()
  if (!query) return items
  return items.filter((item) =>
    [item.requestId, item.plan?.applicationName, item.plan?.planName, item.requester.fullName, item.costCenter.code]
      .filter((value): value is string => !!value)
      .some((value) => value.toLocaleLowerCase().includes(query))
  )
}
