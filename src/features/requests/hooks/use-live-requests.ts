import { useQuery } from '@tanstack/react-query'

import { accessRequestGet } from '@/shared/api/generated/api/access-requests/access-requests'
import { meAccessRequestList } from '@/shared/api/generated/api/me/me'
import { useSession } from '@/shared/api/session-context'

export function useLiveRequests(view: 'open' | 'ended', page: number) {
  const session = useSession()
  return useQuery({
    queryKey: ['session', 'requests', view, page],
    enabled: session.state === 'authenticated',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await meAccessRequestList(
          { view, page, pageSize: 20 },
          { signal, headers: { Authorization: `Bearer ${token}` } }
        )
        if (!result.data.data) throw new Error('Missing request list')
        return result.data.data
      })
  })
}

export function useLiveRequest(requestId: string) {
  const session = useSession()
  return useQuery({
    queryKey: ['session', 'request', requestId],
    enabled: session.state === 'authenticated',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await accessRequestGet(requestId, { signal, headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing request details')
        return result.data.data
      })
  })
}
