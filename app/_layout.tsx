import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { NotificationReadErrorProvider } from '@/features/inbox'
import { PolicyGate } from '@/features/policy'
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
    <>
      <PolicyGate>
        <NotificationReadErrorProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='index' />
          </Stack>
        </NotificationReadErrorProvider>
      </PolicyGate>
      <StatusBar style={dark ? 'light' : 'dark'} />
    </>
  )
}
