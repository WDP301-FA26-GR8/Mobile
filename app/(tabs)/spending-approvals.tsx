import { useLocalSearchParams } from 'expo-router'

import { LiveSpendingApprovalsScreen } from '@/features/spending-approval'

export default function SpendingApprovalsRoute() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>()
  return <LiveSpendingApprovalsScreen requestId={requestId} />
}
