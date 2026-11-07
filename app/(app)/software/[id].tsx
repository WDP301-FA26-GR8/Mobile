import { useLocalSearchParams } from 'expo-router'

import { SoftwareDetailScreen } from '@/features/employee'
import { routeParam } from '@/shared/lib/route-param'

export default function SoftwareDetailRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>()

  return <SoftwareDetailScreen softwareId={routeParam(params.id)} />
}
