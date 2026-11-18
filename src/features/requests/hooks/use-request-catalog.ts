import { useQuery } from '@tanstack/react-query'

import { meDepartmentSoftwareList } from '@/shared/api/generated/api/department-software-list/department-software-list'
import {
  requestableApplicationList,
  requestablePlanList
} from '@/shared/api/generated/api/requestable-software/requestable-software'
import { useSession } from '@/shared/api/session-context'

export function isNoDepartment(error: unknown) {
  if (typeof error !== 'object' || error === null || !('info' in error)) return false
  const info = error.info
  if (typeof info !== 'object' || info === null || !('error' in info)) return false
  const detail = info.error
  return (
    typeof detail === 'object' &&
    detail !== null &&
    'code' in detail &&
    detail.code === 'REQUESTABLE_SOFTWARE.NO_DEPARTMENT'
  )
}

export function useRequestCatalog(
  mode: 'department' | 'applications' | 'plans',
  search: string,
  page: number,
  applicationId?: string
) {
  const session = useSession()
  const authenticated = session.state === 'authenticated'
  const department = useQuery({
    queryKey: ['session', 'department-software', page],
    enabled: authenticated && mode === 'department',
    retry: false,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await meDepartmentSoftwareList(
          { page, pageSize: 20 },
          {
            signal,
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        if (!result.data.data) throw new Error('Missing department software')
        return result.data.data
      })
  })
  const applications = useQuery({
    queryKey: ['session', 'requestable-applications', search, page],
    enabled: authenticated && mode === 'applications',
    retry: false,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await requestableApplicationList(
          { search: search || undefined, page, pageSize: 20 },
          {
            signal,
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        if (!result.data.data) throw new Error('Missing requestable applications')
        return result.data.data
      })
  })
  const plans = useQuery({
    queryKey: ['session', 'requestable-plans', applicationId, page],
    enabled: authenticated && mode === 'plans' && !!applicationId,
    retry: false,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        if (!applicationId) throw new Error('Missing application ID')
        const result = await requestablePlanList(
          { applicationId, page, pageSize: 20 },
          {
            signal,
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        if (!result.data.data || result.data.data.items.some((item) => item.application.id !== applicationId)) {
          throw new Error('Missing or inconsistent requestable plans')
        }
        return result.data.data
      })
  })
  return { department, applications, plans }
}
