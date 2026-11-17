import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/shared/api/session-context'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

const NotificationReadErrorContext = createContext<(() => void) | undefined>(undefined)

export function useNotificationReadError() {
  const showError = useContext(NotificationReadErrorContext)
  if (!showError) throw new Error('NotificationReadErrorProvider is missing')
  return showError
}

export function NotificationReadErrorProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const session = useSession()
  const [visible, setVisible] = useState(false)
  const styles = createStyles(colors)

  useEffect(() => {
    if (session.state !== 'authenticated') setVisible(false)
  }, [session.state])

  return (
    <NotificationReadErrorContext.Provider value={() => setVisible(true)}>
      <View style={styles.root}>
        {children}
        {visible ? (
          <SafeAreaView edges={['top']} style={styles.overlay}>
            <View style={styles.notice}>
              <Text accessibilityRole='alert' accessibilityLiveRegion='assertive' style={styles.message}>
                {t('inbox.live.writeError')}
              </Text>
              <Pressable accessibilityRole='button' onPress={() => setVisible(false)} style={styles.dismiss}>
                <Text style={styles.dismissText}>{t('inbox.live.dismiss')}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        ) : null}
      </View>
    </NotificationReadErrorContext.Provider>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    root: { flex: 1 },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
    notice: {
      backgroundColor: colors.surface,
      borderColor: colors.danger,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    },
    message: { flex: 1, color: colors.danger, fontSize: 14, lineHeight: 20 },
    dismiss: { minHeight: 44, justifyContent: 'center' },
    dismissText: { color: colors.primaryInk, fontWeight: '700' }
  })
