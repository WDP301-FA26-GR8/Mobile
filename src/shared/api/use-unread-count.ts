import { useQuery } from '@tanstack/react-query'

import { notificationUnreadCount } from '@/shared/api/generated/api/notifications/notifications'
import { useSession } from '@/shared/api/session-context'

export function useUnreadCount() {
  const session = useSession()
  return useQuery({
    queryKey: ['session', 'notifications', 'count'],
    enabled: session.state === 'authenticated',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await notificationUnreadCount({ signal, headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing notification count')
        return result.data.data.unread
      })
  })
}
