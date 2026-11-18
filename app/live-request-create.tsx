import { useLocalSearchParams } from 'expo-router'

import { LiveRequestCreateScreen } from '@/features/requests'

const uuid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i

export default function LiveRequestCreateRoute() {
  const { applicationId, applicationName } = useLocalSearchParams<{
    applicationId?: string
    applicationName?: string
  }>()
  const initialApplication =
    typeof applicationId === 'string' && uuid.test(applicationId) && typeof applicationName === 'string'
      ? { id: applicationId, name: applicationName.slice(0, 200) }
      : undefined
  return <LiveRequestCreateScreen key={initialApplication?.id} initialApplication={initialApplication} />
}
