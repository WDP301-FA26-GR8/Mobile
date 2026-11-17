import { useQuery } from '@tanstack/react-query'

import { meGet } from '@/shared/api/generated/api/me/me'
import { useSession } from '@/shared/api/session-context'

export function useAccountProfile() {
  const session = useSession()
  return useQuery({
    queryKey: ['session', 'me'],
    enabled: session.state === 'authenticated',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await meGet({ signal, headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing account response data')
        return result.data.data
      })
  })
}
