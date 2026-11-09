import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { accessRequestPreview, accessRequestSubmit } from '@/shared/api/generated/api/access-requests/access-requests'
import { requestablePlanList } from '@/shared/api/generated/api/requestable-software/requestable-software'
import type { PreviewBodyDto, SubmitBodyDto } from '@/shared/api/generated/contracts/access-requests'
import { useSession } from '@/shared/api/session-context'

export function useLiveRequestCreate(search: string, page: number) {
  const session = useSession()
  const client = useQueryClient()
  const plans = useQuery({
    queryKey: ['session', 'requestable-plans', search, page],
    enabled: session.state === 'authenticated',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await requestablePlanList(
          { search: search || undefined, page, pageSize: 20 },
          { signal, headers: { Authorization: `Bearer ${token}` } }
        )
        if (!result.data.data) throw new Error('Missing requestable plans')
        return result.data.data
      })
  })
  const preview = useMutation({
    retry: false,
    mutationFn: ({ body, reason }: { body: PreviewBodyDto; reason: string }) =>
      session.write(async (token) => {
        const result = await accessRequestPreview(body, { headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing preview')
        return { input: body, reason, preview: result.data.data.preview }
      })
  })
  const submit = useMutation({
    retry: false,
    mutationFn: (body: SubmitBodyDto) =>
      session.write(async (token) => {
        const result = await accessRequestSubmit(body, { headers: { Authorization: `Bearer ${token}` } })
        if (
          !result.data.data?.request.id ||
          !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(result.data.data.request.id)
        ) {
          throw new Error('Missing or invalid created request ID')
        }
        return result.data.data.request.id
      }),
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ['session', 'requests'] })
    }
  })
  return { plans, preview, submit }
}
