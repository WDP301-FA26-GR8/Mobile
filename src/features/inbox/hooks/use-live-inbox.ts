import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  notificationList,
  notificationMarkAllRead,
  notificationMarkRead,
  notificationUnreadCount
} from '@/shared/api/generated/api/notifications/notifications'
import { useSession } from '@/shared/api/session-context'

export function useLiveInbox(page: number) {
  const session = useSession()
  const client = useQueryClient()
  const enabled = session.state === 'authenticated'
  const list = useQuery({
    queryKey: ['session', 'notifications', 'list', page],
    enabled,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await notificationList(
          { page, pageSize: 20 },
          { signal, headers: { Authorization: `Bearer ${token}` } }
        )
        if (!result.data.data) throw new Error('Missing notification list')
        return result.data.data
      })
  })
  const count = useQuery({
    queryKey: ['session', 'notifications', 'count'],
    enabled,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await notificationUnreadCount({ signal, headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing notification count')
        return result.data.data.unread
      })
  })
  const markRead = useMutation({
    retry: false,
    mutationFn: (id: string | null) =>
      session.write(async (token) => {
        if (id) await notificationMarkRead(id, { headers: { Authorization: `Bearer ${token}` } })
        else await notificationMarkAllRead({ headers: { Authorization: `Bearer ${token}` } })
      }),
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ['session', 'notifications'] })
    }
  })
  return { list, count, markRead }
}
