import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text } from 'react-native'

import { RequirePersona, useSession } from '@/features/session'
import { Screen } from '@/shared/ui/screen'
import { ScreenHeader } from '@/shared/ui/screen-header'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'

export function SpendQueueScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { signOut } = useSession()

  return (
    <RequirePersona personaId='approver'>
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            onSignOut={() => {
              signOut()
              router.replace('/sign-in')
            }}
            signOutLabel={t('common.signOut')}
            title={t('placeholders.approver.title')}
          />
          <Surface>
            <Text style={styles.body}>{t('placeholders.approver.body')}</Text>
          </Surface>
        </ScrollView>
      </Screen>
    </RequirePersona>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  body: {
    color: theme.colors.foreground,
    fontSize: 16,
    lineHeight: 22
  }
})
