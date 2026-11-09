import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { RequestsProvider } from '@/entities/demo-requests'
import { AppProviders } from '@/providers/app-providers'

export default function RootLayout() {
  return (
    <AppProviders>
      <RequestsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='index' />
        </Stack>
        <StatusBar style='dark' />
      </RequestsProvider>
    </AppProviders>
  )
}
