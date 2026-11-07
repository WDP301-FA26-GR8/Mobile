import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'

import { findRequest } from '@/entities/access-request'
import { findSoftware } from '@/entities/software'
import { demoInbox, inboxGroups } from '@/entities/inbox'
import { Screen } from '@/shared/ui/screen'
import { ScreenHeader } from '@/shared/ui/screen-header'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'
import { RequirePersona, useSession } from '@/features/session'

export function InboxScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { requests, signOut } = useSession()

  function leave() {
    signOut()
    router.replace('/sign-in')
  }

  function openNotice(requestId: string | null, softwareId: string | null) {
    if (requestId) {
      router.push({ pathname: '/requests/[id]', params: { id: requestId } })
      return
    }
    if (softwareId) {
      router.push({ pathname: '/software/[id]', params: { id: softwareId } })
    }
  }

  return (
    <RequirePersona personaId='employee'>
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader onSignOut={leave} signOutLabel={t('common.signOut')} title={t('inbox.title')} />
          {demoInbox.length === 0 ? (
            <Surface>
              <Text style={styles.body}>{t('inbox.empty')}</Text>
            </Surface>
          ) : (
            inboxGroups().map((group) => {
              const notices = demoInbox.filter((notice) => notice.group === group)
              if (notices.length === 0) return null

              return (
                <Surface key={group}>
                  <Text style={styles.group}>{t(`inbox.groups.${group}`)}</Text>
                  {notices.map((notice) => {
                    const request = findRequest(requests, notice.requestId)
                    const software = findSoftware(notice.softwareId)
                    const name = request?.softwareName ?? software?.name ?? ''
                    const label =
                      notice.kind === 'license-ready'
                        ? t('inbox.licenseReady', { name })
                        : notice.kind === 'rejected'
                          ? t('inbox.rejected', { name })
                          : t('inbox.pending', { name })

                    return (
                      <Pressable
                        accessibilityRole='button'
                        key={notice.id}
                        onPress={() => openNotice(notice.requestId, notice.softwareId)}
                      >
                        <Text style={styles.notice}>{label}</Text>
                      </Pressable>
                    )
                  })}
                </Surface>
              )
            })
          )}
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
  group: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
    fontWeight: '700'
  },
  notice: {
    color: theme.colors.foreground,
    fontSize: 16,
    lineHeight: 22
  },
  body: {
    color: theme.colors.mutedForeground,
    fontSize: 15
  }
})
