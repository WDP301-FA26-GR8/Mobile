import { focusManager, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { AppState, Platform } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { createQueryClient } from '@/shared/api/query-client'
import { SessionProvider } from '@/shared/api/session-context'
import { i18n, initializeMobileLanguage } from '@/shared/i18n/i18n'

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient)

  useEffect(() => {
    void initializeMobileLanguage()

    if (Platform.OS === 'web') {
      return
    }

    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active')
    })

    return () => subscription.remove()
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>{children}</SessionProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </I18nextProvider>
  )
}
