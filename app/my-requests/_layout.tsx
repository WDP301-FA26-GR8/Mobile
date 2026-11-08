import { Stack } from 'expo-router'

import { RequestsProvider } from '@/features/requests'

export default function MyRequestsLayout() {
  return (
    <RequestsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RequestsProvider>
  )
}
