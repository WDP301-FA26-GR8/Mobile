import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { findRequest } from '@/entities/access-request'
import { demoInbox, inboxGroups } from '@/entities/inbox'
import { findSoftware } from '@/entities/software'
import { RequirePersona, useSession } from '@/features/session'
import { PersonaHeader } from '@/shared/ui/persona-header'
import { Screen } from '@/shared/ui/screen'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'

export function InboxScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { persona, requests, signOut } = useSession()
  const [readIds, setReadIds] = useState<string[]>([])

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
        {persona ? (
          <PersonaHeader
            avatarLabel={t('common.signOut')}
            bellLabel={t('nav.inbox')}
            departmentLine={persona.departmentLine}
            initials={persona.initials}
            jobTitle={persona.jobTitle}
            name={persona.name}
            onPressAvatar={leave}
            onPressBell={() => undefined}
          />
        ) : null}
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.sectionRow}>
            <Text style={styles.section}>{t('inbox.section')}</Text>
            <Pressable accessibilityRole='button' onPress={() => setReadIds(demoInbox.map((notice) => notice.id))}>
              <Text style={styles.markRead}>{t('inbox.markRead')}</Text>
            </Pressable>
          </View>
          {demoInbox.length === 0 ? (
            <Surface>
              <Text style={styles.body}>{t('inbox.empty')}</Text>
            </Surface>
          ) : (
            inboxGroups().map((group) => {
              const notices = demoInbox.filter((notice) => notice.group === group)
              if (notices.length === 0) return null

              return (
                <View key={group} style={styles.group}>
                  <Text style={styles.groupLabel}>{t(`inbox.groups.${group}`)}</Text>
                  {notices.map((notice) => {
                    const request = findRequest(requests, notice.requestId)
                    const software = findSoftware(notice.softwareId)
                    const name = request?.softwareName ?? software?.name ?? ''
                    const title =
                      notice.kind === 'license-ready'
                        ? t('inbox.licenseReady', { name })
                        : notice.kind === 'rejected'
                          ? t('inbox.rejected', { name })
                          : t('inbox.pending', { name })
                    const unread = !readIds.includes(notice.id)

                    return (
                      <Pressable
                        accessibilityRole='button'
                        key={notice.id}
                        onPress={() => {
                          setReadIds((current) => (current.includes(notice.id) ? current : [...current, notice.id]))
                          openNotice(notice.requestId, notice.softwareId)
                        }}
                        style={[styles.card, unread ? styles.unread : styles.read]}
                      >
                        <View style={[styles.icon, unread ? styles.iconUnread : styles.iconRead]}>
                          <Ionicons
                            color={unread ? theme.colors.primary : theme.colors.mutedForeground}
                            name={notice.kind === 'rejected' ? 'close' : 'notifications-outline'}
                            size={16}
                          />
                        </View>
                        <Text style={styles.notice}>{title}</Text>
                      </Pressable>
                    )
                  })}
                </View>
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
    gap: 14,
    padding: 16
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  section: {
    color: theme.colors.mutedForeground,
    flex: 1,
    fontSize: 11,
    fontWeight: '700'
  },
  markRead: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '600'
  },
  group: {
    gap: 8
  },
  groupLabel: {
    color: theme.colors.mutedForeground,
    fontSize: 11,
    fontWeight: '700'
  },
  card: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14
  },
  unread: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary
  },
  read: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.border
  },
  icon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  iconUnread: {
    backgroundColor: theme.colors.primarySoft
  },
  iconRead: {
    backgroundColor: theme.colors.surface
  },
  notice: {
    color: theme.colors.foreground,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18
  },
  body: {
    color: theme.colors.mutedForeground,
    fontSize: 14
  }
})
