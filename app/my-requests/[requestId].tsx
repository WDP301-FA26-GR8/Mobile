import { Redirect, useLocalSearchParams } from 'expo-router'

import { RequestDetailsScreen } from '@/features/requests'

export default function RequestDetailsRoute() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>()

  if (!requestId) return <Redirect href='/my-requests' />

  return <RequestDetailsScreen requestId={requestId} />
}
