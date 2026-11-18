import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { policyAcknowledgementCreate, policyGet } from '@/shared/api/generated/api/policies/policies'
import { useSession } from '@/shared/api/session-context'

export function usePolicyAcknowledgement(code?: string) {
  const session = useSession()
  const client = useQueryClient()
  const policy = useQuery({
    queryKey: ['session', 'policy', code],
    enabled: session.state === 'authenticated' && !!code,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        if (!code || !/^[A-Z0-9-]{3,30}$/.test(code)) throw new Error('Missing or invalid policy code')
        const result = await policyGet(code, undefined, { signal, headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data || result.data.data.code !== code || !result.data.data.isCurrent) {
          throw new Error('Missing or inconsistent current policy')
        }
        return result.data.data
      })
  })
  const acknowledge = useMutation({
    retry: false,
    mutationFn: (policyCode: string) =>
      session.write(async (token) => {
        const result = await policyAcknowledgementCreate(policyCode, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!result.data.data || result.data.data.policyCode !== policyCode) {
          throw new Error('Missing or inconsistent policy acknowledgement')
        }
        return result.data.data
      }),
    onSettled: async (_, __, policyCode) => {
      await client.invalidateQueries({ queryKey: ['session', 'policy', policyCode] })
    }
  })
  return { policy, acknowledge }
}
