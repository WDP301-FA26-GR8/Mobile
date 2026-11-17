import { Redirect, useLocalSearchParams } from 'expo-router'

import { LiveRequestDetailsScreen } from '@/features/requests'

export default function LiveRequestDetailsRoute() {
  const { requestId } = useLocalSearchParams<{ requestId?: string | string[] }>()
  if (typeof requestId !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(requestId)) {
    return <Redirect href='/live-requests' />
  }
  return <LiveRequestDetailsScreen requestId={requestId} />
}
