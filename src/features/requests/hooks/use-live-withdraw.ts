import { useMutation, useQueryClient } from '@tanstack/react-query'

import { accessRequestWithdraw } from '@/shared/api/generated/api/access-requests/access-requests'
import { useSession } from '@/shared/api/session-context'

export function useLiveWithdraw() {
  const session = useSession()
  const client = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: (id: string) =>
      session.write(async (token) => {
        const result = await accessRequestWithdraw(id, {}, { headers: { Authorization: `Bearer ${token}` } })
        const request = result.data.data?.request
        if (!request || request.id !== id || typeof request.state !== 'string' || !request.state) {
          throw new Error('Missing or inconsistent withdrawal response')
        }
        return request
      }),
    onSettled: async (_, __, id) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['session', 'requests'] }),
        client.invalidateQueries({ queryKey: ['session', 'request', id] }),
        client.invalidateQueries({ queryKey: ['session', 'request-events', id] })
      ])
    }
  })
}
