import { useQuery } from '@tanstack/react-query'

import { accessRequestEventList } from '@/shared/api/generated/api/access-requests/access-requests'
import { useSession } from '@/shared/api/session-context'

export function useRequestEvents(requestId: string, page: number) {
  const session = useSession()
  return useQuery({
    queryKey: ['session', 'request-events', requestId, page],
    enabled: session.state === 'authenticated',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await accessRequestEventList(
          requestId,
          { page, pageSize: 20 },
          { signal, headers: { Authorization: `Bearer ${token}` } }
        )
        if (!result.data.data) throw new Error('Missing request events')
        return result.data.data
      })
  })
}
