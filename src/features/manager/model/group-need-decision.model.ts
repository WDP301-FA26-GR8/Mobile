import type {
  LineNeedDecisionBodyDto,
  LinesResponseDtoDataItemsItem
} from '@/shared/api/generated/contracts/group-requests'

export type LineChoice = 'APPROVE' | 'REJECT'

// SERVICE_ACCOUNT exists on old records only and has no mobile decision.
export function isDecidableNeedType(type: string | undefined) {
  return type === 'GRANT' || type === 'RENEWAL' || type === 'GROUP_GRANT'
}

export function pendingNeedLines(lines: LinesResponseDtoDataItemsItem[]) {
  return lines.filter((line) => line.state === 'AWAITING_NEED')
}

type Input = {
  pending: LinesResponseDtoDataItemsItem[]
  choices: Record<string, LineChoice | undefined>
  reasons: Record<string, string | undefined>
  returnAll: boolean
  returnReason: string
  policyVersionId: string
  checklist: { code: string; answer: 'YES' | 'NO' | undefined }[]
}

export type GroupNeedBodyResult =
  { status: 'ok'; body: LineNeedDecisionBodyDto } | { status: 'incomplete' } | { status: 'reason' }

// A reason may be left out only when a "No" checklist answer already explains the refusal.
export function groupNeedBody(input: Input): GroupNeedBodyResult {
  if (!input.pending.length || input.checklist.some((item) => !item.answer)) return { status: 'incomplete' }
  const hasNo = input.checklist.some((item) => item.answer === 'NO')
  const checklist = {
    policyVersionId: input.policyVersionId,
    answers: input.checklist.map((item) => ({ itemCode: item.code, answer: item.answer ?? 'NO' }))
  }

  if (input.returnAll) {
    const reason = input.returnReason.trim()
    if (!reason && !hasNo) return { status: 'reason' }
    return {
      status: 'ok',
      body: {
        lines: input.pending.map((line) => ({
          employeeId: line.employee.employeeId,
          decision: 'RETURN' as const,
          ...(reason ? { reason } : {})
        })),
        checklist
      }
    }
  }

  const lines: LineNeedDecisionBodyDto['lines'] = []
  for (const line of input.pending) {
    const id = line.employee.employeeId
    const choice = input.choices[id]
    if (!choice) return { status: 'incomplete' }
    if (choice === 'APPROVE') {
      lines.push({ employeeId: id, decision: 'APPROVE' })
      continue
    }
    const reason = input.reasons[id]?.trim()
    if (!reason && !hasNo) return { status: 'reason' }
    lines.push({ employeeId: id, decision: 'REJECT', ...(reason ? { reason } : {}) })
  }
  return { status: 'ok', body: { lines, checklist } }
}
