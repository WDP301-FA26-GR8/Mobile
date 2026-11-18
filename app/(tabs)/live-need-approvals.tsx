import { useLocalSearchParams } from 'expo-router'

import { LiveNeedApprovalsScreen } from '@/features/manager'

export default function LiveNeedApprovalsRoute() {
  const { requestId, source } = useLocalSearchParams<{ requestId?: string; source?: string }>()
  const validId =
    typeof requestId === 'string' && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(requestId)
  const notification: { requestId: string; source: 'assigned' | 'reminder' } | undefined =
    validId && (source === 'assigned' || source === 'reminder') ? { requestId, source } : undefined
  return <LiveNeedApprovalsScreen notification={notification} />
}
