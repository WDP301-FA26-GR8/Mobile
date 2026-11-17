import { useQuery } from '@tanstack/react-query'

import { meGet } from '@/shared/api/generated/api/me/me'
import { useSession } from '@/shared/api/session-context'

export function useAccountProfile() {
  const session = useSession()
  return useQuery({
    queryKey: ['session', 'me'],
    enabled: session.state === 'authenticated',
    refetchOnWindowFocus: 'always',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await meGet({ signal, headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing account response data')
        if (!Array.isArray(result.data.data.pendingPolicyAcknowledgements)) {
          throw new Error('Missing pending policy acknowledgements')
        }
        return result.data.data
      })
  })
}
