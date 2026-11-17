import { useQuery } from '@tanstack/react-query'

import { accessRequestSimilarSeatList } from '@/shared/api/generated/api/access-requests/access-requests'
import { useSession } from '@/shared/api/session-context'

export function useSimilarSeats(requestId: string, page: number) {
  const session = useSession()
  return useQuery({
    queryKey: ['session', 'need-approval-similar-seats', requestId, page],
    enabled: session.state === 'authenticated',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await accessRequestSimilarSeatList(
          requestId,
          { page, pageSize: 20 },
          {
            signal,
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        if (!result.data.data) throw new Error('Missing similar seats')
        return result.data.data
      })
  })
}
