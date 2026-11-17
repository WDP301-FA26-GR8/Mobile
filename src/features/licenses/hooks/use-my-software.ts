import { useQuery } from '@tanstack/react-query'

import { employeeDashboardGet } from '@/shared/api/generated/api/dashboards/dashboards'
import { meSoftwareRightList } from '@/shared/api/generated/api/me/me'
import { useSession } from '@/shared/api/session-context'
import { useAccountProfile } from '@/shared/api/use-account-profile'

export function useMySoftware(page: number) {
  const session = useSession()
  const enabled = session.state === 'authenticated'
  const profile = useAccountProfile()
  const software = useQuery({
    queryKey: ['session', 'software', page],
    enabled,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await meSoftwareRightList(
          { view: 'current', page, pageSize: 20 },
          { signal, headers: { Authorization: `Bearer ${token}` } }
        )
        if (!result.data.data) throw new Error('Missing software response data')
        return result.data.data
      })
  })
  const summary = useQuery({
    queryKey: ['session', 'software-summary'],
    enabled,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await employeeDashboardGet({ signal, headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing dashboard response data')
        return result.data.data.sections
      })
  })

  return { profile, software, summary }
}
