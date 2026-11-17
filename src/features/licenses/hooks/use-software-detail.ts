import { useQuery } from '@tanstack/react-query'

import { meSoftwareRightList } from '@/shared/api/generated/api/me/me'
import { useSession } from '@/shared/api/session-context'

export function useSoftwareDetail(assignmentId: string) {
  const session = useSession()
  return useQuery({
    queryKey: ['session', 'software-detail', assignmentId],
    enabled: session.state === 'authenticated',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        for (const view of ['current', 'ended'] as const) {
          let page = 1
          for (;;) {
            const result = await meSoftwareRightList(
              { view, page, pageSize: 100 },
              { signal, headers: { Authorization: `Bearer ${token}` } }
            )
            const data = result.data.data
            if (
              !data ||
              !Array.isArray(data.items) ||
              data.view !== view ||
              data.pagination.page !== page ||
              !Number.isSafeInteger(data.pagination.totalPages) ||
              data.pagination.totalPages < 0
            ) {
              throw new Error('Missing or inconsistent software page')
            }
            const item = data.items.find((right) => right.assignmentId === assignmentId)
            if (item) return item
            if (page >= data.pagination.totalPages) break
            page += 1
          }
        }
        return null
      })
  })
}
