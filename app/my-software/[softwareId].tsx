import { Redirect, useLocalSearchParams } from 'expo-router'

import { LiveSoftwareDetailsScreen } from '@/features/licenses'

export default function SoftwareDetailsRoute() {
  const { softwareId } = useLocalSearchParams<{ softwareId?: string | string[] }>()
  if (
    typeof softwareId !== 'string' ||
    !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(softwareId)
  ) {
    return <Redirect href='/my-software' />
  }
  return <LiveSoftwareDetailsScreen assignmentId={softwareId} />
}
