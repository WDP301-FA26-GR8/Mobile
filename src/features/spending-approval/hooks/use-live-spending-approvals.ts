import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  accessRequestLineList,
  spendApprovalLineDecide
} from '@/shared/api/generated/api/group-requests/group-requests'
import { policyStepGet } from '@/shared/api/generated/api/policies/policies'
import {
  spendApprovalDecide,
  spendApprovalGet,
  spendApprovalList
} from '@/shared/api/generated/api/spend-approvals/spend-approvals'
import type {
  ApprovalListResponseDtoDataItemsItem,
  LineSpendDecisionBodyDto,
  SpendApprovalListParams,
  SpendDecisionBodyDto
} from '@/shared/api/generated/contracts'
import { useSession } from '@/shared/api/session-context'

const QUEUE_PAGE_SIZE = 20
const NOTIFICATION_PAGE_SIZE = 100
const MAX_NOTIFICATION_PAGES = 100

function assertQueuePage(
  data: unknown,
  page: number
): asserts data is {
  items: ApprovalListResponseDtoDataItemsItem[]
  pagination: { page: number; totalPages: number }
} {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('items' in data) ||
    !Array.isArray(data.items) ||
    !('pagination' in data) ||
    typeof data.pagination !== 'object' ||
    data.pagination === null ||
    !('page' in data.pagination) ||
    data.pagination.page !== page ||
    !('totalPages' in data.pagination) ||
    typeof data.pagination.totalPages !== 'number' ||
    !Number.isSafeInteger(data.pagination.totalPages) ||
    data.pagination.totalPages < 0 ||
    data.items.some(
      (item) =>
        typeof item !== 'object' ||
        item === null ||
        typeof item.requestId !== 'string' ||
        typeof item.lineCount !== 'number'
    )
  ) {
    throw new Error('Missing or inconsistent spend approval queue page')
  }
}

export function useLiveSpendingApprovals(
  page: number,
  notificationRequestId?: string,
  permitted = true,
  selectedRequestId = notificationRequestId
) {
  const session = useSession()
  const client = useQueryClient()
  const enabled = session.state === 'authenticated' && permitted

  const queue = useQuery({
    queryKey: ['session', 'spend-approvals', page],
    enabled,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const params: SpendApprovalListParams = { page, pageSize: QUEUE_PAGE_SIZE }
        const result = await spendApprovalList(params, {
          signal,
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = result.data.data
        assertQueuePage(data, page)
        return data
      })
  })

  const notificationItem = useQuery({
    queryKey: ['session', 'spend-approval-notification', notificationRequestId],
    enabled: enabled && !!notificationRequestId,
    staleTime: 0,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        if (!notificationRequestId) throw new Error('Missing spend approval notification request ID')
        for (let currentPage = 1; currentPage <= MAX_NOTIFICATION_PAGES; currentPage += 1) {
          const result = await spendApprovalList(
            { page: currentPage, pageSize: NOTIFICATION_PAGE_SIZE },
            { signal, headers: { Authorization: `Bearer ${token}` } }
          )
          const data = result.data.data
          assertQueuePage(data, currentPage)
          const item = data.items.find((candidate) => candidate.requestId === notificationRequestId)
          if (item) return item
          if (currentPage >= data.pagination.totalPages) return null
        }
        throw new Error('Spend approval notification search exceeded page limit')
      })
  })

  const detail = useQuery({
    queryKey: ['session', 'spend-approval-detail', selectedRequestId],
    enabled: enabled && !!selectedRequestId,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        if (!selectedRequestId) throw new Error('Missing spend approval request ID')
        const result = await spendApprovalGet(selectedRequestId, {
          signal,
          headers: { Authorization: `Bearer ${token}` }
        })
        const spendApproval = result.data.data?.spendApproval
        if (
          !spendApproval ||
          spendApproval.requestId !== selectedRequestId ||
          !spendApproval.request ||
          !Number.isSafeInteger(spendApproval.request.lineCount) ||
          spendApproval.request.lineCount < 1 ||
          (spendApproval.request.beneficiary !== null &&
            (typeof spendApproval.request.beneficiary !== 'object' ||
              typeof spendApproval.request.beneficiary?.employeeId !== 'string'))
        ) {
          throw new Error('Missing or inconsistent spend approval details')
        }
        return spendApproval
      })
  })

  const lines = useQuery({
    queryKey: ['session', 'spend-approval-lines', selectedRequestId],
    enabled: enabled && !!selectedRequestId && detail.data?.request.beneficiary === null,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        if (!selectedRequestId) throw new Error('Missing grouped spend approval request ID')
        const result = await accessRequestLineList(
          selectedRequestId,
          { page: 1, pageSize: 100 },
          {
            signal,
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        const data = result.data.data
        if (
          !data ||
          !Array.isArray(data.items) ||
          data.pagination.page !== 1 ||
          data.pagination.totalPages > 1 ||
          data.items.length !== data.pagination.totalItems
        ) {
          throw new Error('Missing or inconsistent grouped spend approval lines')
        }
        return data.items
      })
  })

  const policy = useQuery({
    queryKey: ['session', 'policy-step', 'POL-MF1', '1.7'],
    enabled: enabled && !!selectedRequestId,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await policyStepGet('POL-MF1', '1.7', {
          signal,
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = result.data.data
        if (!data || data.step.code !== '1.7' || !data.step.checklist.length) {
          throw new Error('Missing spend approval policy checklist')
        }
        return data
      })
  })

  const decide = useMutation({
    retry: false,
    mutationFn: ({ id, stepId, body }: { id: string; stepId: string; body: SpendDecisionBodyDto }) =>
      session.write(async (token) => {
        const result = await spendApprovalDecide(id, body, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const spendApproval = result.data.data?.spendApproval
        const expectedStep =
          body.decision === 'RETURN' ? 'CLOSED' : body.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'
        const expectedState =
          body.decision === 'RETURN'
            ? spendApproval?.routing.mode === 'ONE_STEP'
              ? 'AWAITING_REQUESTER_REVISION'
              : 'AWAITING_SPEND_SUBMISSION'
            : body.decision === 'APPROVE'
              ? 'AWAITING_EXECUTION'
              : 'REJECTED'
        if (
          !spendApproval ||
          spendApproval.requestId !== id ||
          spendApproval.step.id !== stepId ||
          spendApproval.step.state !== expectedStep ||
          spendApproval.request.state !== expectedState ||
          (body.decision !== 'RETURN' && spendApproval.decision?.decision !== expectedStep)
        ) {
          throw new Error('Missing or inconsistent spend approval decision response')
        }
        return spendApproval
      }),
    onSettled: async (_, __, { id }) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['session', 'spend-approvals'] }),
        client.invalidateQueries({ queryKey: ['session', 'spend-approval-detail', id] }),
        client.invalidateQueries({ queryKey: ['session', 'spend-approval-lines', id] }),
        client.invalidateQueries({ queryKey: ['session', 'spend-approval-notification'] }),
        client.invalidateQueries({ queryKey: ['session', 'notifications'] })
      ])
    }
  })

  const decideLines = useMutation({
    retry: false,
    mutationFn: ({ id, stepId, body }: { id: string; stepId: string; body: LineSpendDecisionBodyDto }) =>
      session.write(async (token) => {
        const result = await spendApprovalLineDecide(id, body, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const spendApproval = result.data.data?.spendApproval
        const isReturn = body.lines.every((line) => line.decision === 'RETURN')
        const expectedStep = isReturn
          ? 'CLOSED'
          : body.lines.some((line) => line.decision === 'APPROVE')
            ? 'APPROVED'
            : 'REJECTED'
        if (
          !spendApproval ||
          spendApproval.requestId !== id ||
          spendApproval.request.beneficiary !== null ||
          spendApproval.step.id !== stepId ||
          spendApproval.step.state !== expectedStep ||
          spendApproval.request.state !==
            (isReturn
              ? spendApproval.routing.mode === 'ONE_STEP'
                ? 'AWAITING_REQUESTER_REVISION'
                : 'AWAITING_SPEND_SUBMISSION'
              : expectedStep === 'APPROVED'
                ? 'AWAITING_EXECUTION'
                : 'REJECTED') ||
          (!isReturn && spendApproval.decision?.decision !== expectedStep)
        ) {
          throw new Error('Missing or inconsistent grouped spend decision response')
        }
        return spendApproval
      }),
    onSettled: async (_, __, { id }) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['session', 'spend-approvals'] }),
        client.invalidateQueries({ queryKey: ['session', 'spend-approval-detail', id] }),
        client.invalidateQueries({ queryKey: ['session', 'spend-approval-lines', id] }),
        client.invalidateQueries({ queryKey: ['session', 'spend-approval-notification'] }),
        client.invalidateQueries({ queryKey: ['session', 'notifications'] })
      ])
    }
  })

  return { queue, notificationItem, detail, lines, policy, decide, decideLines }
}
