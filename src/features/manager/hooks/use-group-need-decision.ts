import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  accessRequestLineList,
  accessRequestLineNeedDecide
} from '@/shared/api/generated/api/group-requests/group-requests'
import type { LineNeedDecisionBodyDto } from '@/shared/api/generated/contracts/group-requests'
import { useSession } from '@/shared/api/session-context'

export function useGroupNeedLines(requestId: string | undefined, enabled: boolean) {
  const session = useSession()
  return useQuery({
    queryKey: ['session', 'need-approval-lines', requestId],
    enabled: session.state === 'authenticated' && enabled && !!requestId,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        if (!requestId) throw new Error('Missing group request ID')
        const result = await accessRequestLineList(
          requestId,
          { page: 1, pageSize: 100 },
          { signal, headers: { Authorization: `Bearer ${token}` } }
        )
        const data = result.data.data
        if (
          !data ||
          !Array.isArray(data.items) ||
          data.pagination.page !== 1 ||
          data.pagination.totalPages > 1 ||
          data.items.length !== data.pagination.totalItems
        ) {
          throw new Error('Missing or inconsistent group request lines')
        }
        return data.items
      })
  })
}

export function useGroupNeedDecision() {
  const session = useSession()
  const client = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: ({ id, body }: { id: string; body: LineNeedDecisionBodyDto }) =>
      session.write(async (token) => {
        const result = await accessRequestLineNeedDecide(id, body, { headers: { Authorization: `Bearer ${token}` } })
        const request = result.data.data?.request
        if (!request || request.id !== id) throw new Error('Missing or inconsistent group decision response')
        return request
      }),
    onSettled: async (_, __, { id }) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['session', 'need-approvals'] }),
        client.invalidateQueries({ queryKey: ['session', 'need-approval-detail', id] }),
        client.invalidateQueries({ queryKey: ['session', 'need-approval-lines', id] }),
        client.invalidateQueries({ queryKey: ['session', 'request', id] }),
        client.invalidateQueries({ queryKey: ['session', 'notifications'] })
      ])
    }
  })
}
