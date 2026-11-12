import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { RequestsProvider } from '@/entities/demo-requests'
import { AppProviders } from '@/providers/app-providers'
import { useMobileTheme } from '@/shared/theme/theme-provider'

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  )
}

function RootNavigator() {
  const { dark } = useMobileTheme()
  return (
    <RequestsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
      </Stack>
      <StatusBar style={dark ? 'light' : 'dark'} />
    </RequestsProvider>
  )
}
