import { useLocalSearchParams } from 'expo-router'

import { RequestDetailScreen } from '@/features/employee'
import { routeParam } from '@/shared/lib/route-param'

export default function RequestDetailRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>()

  return <RequestDetailScreen requestId={routeParam(params.id)} />
}
