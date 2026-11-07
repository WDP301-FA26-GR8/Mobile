import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { SessionProvider } from '@/features/session'
import { AppProviders } from '@/providers/app-providers'

export default function RootLayout() {
  return (
    <AppProviders>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style='dark' />
      </SessionProvider>
    </AppProviders>
  )
}
