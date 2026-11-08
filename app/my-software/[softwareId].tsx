import { Redirect, useLocalSearchParams } from 'expo-router'

import { SoftwareDetailsScreen } from '@/features/licenses'
import { getMySoftwareById } from '@/features/licenses/model/my-software'

export default function SoftwareDetailsRoute() {
  const { softwareId } = useLocalSearchParams<{ softwareId?: string }>()
  const software = softwareId ? getMySoftwareById(softwareId) : undefined

  if (!software) return <Redirect href='/my-software' />

  return <SoftwareDetailsScreen software={software} />
}
