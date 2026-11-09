import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { accessRequestGet, accessRequestNeedDecide } from '@/shared/api/generated/api/access-requests/access-requests'
import { needDecisionList } from '@/shared/api/generated/api/need-decisions/need-decisions'
import type { NeedDecisionBodyDto } from '@/shared/api/generated/contracts/access-requests'
import { useSession } from '@/shared/api/session-context'

export function useLiveNeedApprovals(page: number, requestId?: string, permitted = true) {
  const session = useSession()
  const client = useQueryClient()
  const enabled = session.state === 'authenticated' && permitted
  const queue = useQuery({
    queryKey: ['session', 'need-approvals', page],
    enabled,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await needDecisionList(
          { type: 'GRANT', page, pageSize: 20 },
          { signal, headers: { Authorization: `Bearer ${token}` } }
        )
        if (!result.data.data) throw new Error('Missing need approval queue')
        return result.data.data
      })
  })
  const detail = useQuery({
    queryKey: ['session', 'need-approval-detail', requestId],
    enabled: enabled && !!requestId,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        if (!requestId) throw new Error('Missing request ID')
        const result = await accessRequestGet(requestId, { signal, headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data || !('request' in result.data.data) || result.data.data.request.id !== requestId) {
          throw new Error('Missing or inconsistent request details')
        }
        return result.data.data.request
      })
  })
  const decision = useMutation({
    retry: false,
    mutationFn: ({ id, body }: { id: string; body: NeedDecisionBodyDto }) =>
      session.write(async (token) => {
        const result = await accessRequestNeedDecide(id, body, { headers: { Authorization: `Bearer ${token}` } })
        const request = result.data.data?.request
        const expected = body.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'
        if (!request || request.id !== id || request.needDecision?.decision !== expected) {
          throw new Error('Missing or inconsistent decision response')
        }
        return request
      }),
    onSettled: async (_, __, { id }) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['session', 'need-approvals'] }),
        client.invalidateQueries({ queryKey: ['session', 'need-approval-detail', id] }),
        client.invalidateQueries({ queryKey: ['session', 'request', id] }),
        client.invalidateQueries({ queryKey: ['session', 'notifications'] })
      ])
    }
  })
  return { queue, detail, decision }
}
