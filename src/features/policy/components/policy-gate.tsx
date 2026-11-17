import { type PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/shared/api/session-context'
import { useAccountProfile } from '@/shared/api/use-account-profile'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

import { usePolicyAcknowledgement } from '../hooks/use-policy-acknowledgement'

export function PolicyGate({ children }: PropsWithChildren) {
  const { t, i18n } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const session = useSession()
  const profile = useAccountProfile()
  const [forced, setForced] = useState<{ owner: string; code: string }>()
  const [changed, setChanged] = useState(false)
  const [writeError, setWriteError] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [logoutError, setLogoutError] = useState(false)
  const busy = useRef(false)
  const account = session.state === 'authenticated' && !profile.isError ? profile.data : undefined
  const code =
    account && forced?.owner === account.appUserId ? forced.code : account?.pendingPolicyAcknowledgements[0]?.code
  const blocked = session.state === 'authenticated' && (!account || !!code)
  const { policy, acknowledge } = usePolicyAcknowledgement(code)

  useEffect(() => {
    if (session.state !== 'anonymous') return
    setForced(undefined)
    setChanged(false)
    setWriteError(false)
    setConfirmLogout(false)
  }, [session.state])

  useEffect(() => {
    if (!blocked) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => subscription.remove()
  }, [blocked])

  async function confirm() {
    if (!account || !code || !policy.data || policy.isError || policy.isFetching || busy.current) return
    const version = policy.data.versionNumber
    busy.current = true
    setWriteError(false)
    try {
      const result = await acknowledge.mutateAsync(code)
      const versionChanged = result.versionNumber !== version
      setForced(versionChanged ? { owner: account.appUserId, code } : undefined)
      setChanged(versionChanged)
      const refreshed = await profile.refetch()
      if (refreshed.isError) setWriteError(true)
    } catch {
      setWriteError(true)
      await profile.refetch()
    } finally {
      busy.current = false
    }
  }

  async function logout() {
    if (logoutBusy || busy.current) return
    setLogoutBusy(true)
    setLogoutError(false)
    try {
      await session.logout()
    } catch {
      setLogoutError(true)
    } finally {
      setLogoutBusy(false)
    }
  }

  const content = policy.data && !policy.isError ? policy.data : undefined
  return (
    <View style={styles.root}>
      <View
        style={styles.root}
        pointerEvents={blocked ? 'none' : 'auto'}
        accessibilityElementsHidden={blocked}
        importantForAccessibility={blocked ? 'no-hide-descendants' : 'auto'}
      >
        {children}
      </View>
      {blocked ? (
        <SafeAreaView style={styles.overlay} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.content}>
            <Text accessibilityRole='header' style={styles.title}>
              {code ? t('policy.title') : t('account.title')}
            </Text>
            {!account ? (
              <>
                <Text accessibilityRole={profile.isError ? 'alert' : 'progressbar'} style={styles.text}>
                  {profile.isError ? t('account.error') : t('account.loading')}
                </Text>
                {profile.isError ? (
                  <Pressable accessibilityRole='button' onPress={() => void profile.refetch()} style={styles.secondary}>
                    <Text style={styles.link}>{t('account.retry')}</Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.text}>{t('policy.intro')}</Text>
                {changed ? (
                  <Text accessibilityRole='alert' style={styles.error}>
                    {t('policy.changed')}
                  </Text>
                ) : null}
                {writeError ? (
                  <Text accessibilityRole='alert' style={styles.error}>
                    {t('policy.writeError')}
                  </Text>
                ) : null}
                {policy.isLoading || policy.isFetching ? (
                  <Text accessibilityRole='progressbar' style={styles.text}>
                    {t('policy.loading')}
                  </Text>
                ) : null}
                {policy.isError ? (
                  <View>
                    <Text accessibilityRole='alert' style={styles.error}>
                      {t('policy.loadError')}
                    </Text>
                    <Pressable
                      accessibilityRole='button'
                      onPress={() => void policy.refetch()}
                      style={styles.secondary}
                    >
                      <Text style={styles.link}>{t('account.retry')}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole='button'
                      onPress={() => void profile.refetch()}
                      style={styles.secondary}
                    >
                      <Text style={styles.link}>{t('policy.refreshAccount')}</Text>
                    </Pressable>
                  </View>
                ) : null}
                {content ? (
                  <View style={styles.card}>
                    <Text accessibilityRole='header' style={styles.heading}>
                      {content.title}
                    </Text>
                    <Text style={styles.text}>
                      {t('policy.version', {
                        version: new Intl.NumberFormat(i18n.language).format(content.versionNumber)
                      })}
                    </Text>
                    <Text style={styles.text}>
                      {t('policy.published', {
                        date: Number.isNaN(new Date(content.publishedAt).getTime())
                          ? t('licenses.live.dateUnavailable')
                          : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
                              new Date(content.publishedAt)
                            )
                      })}
                    </Text>
                    {content.changeNote ? <Text style={styles.text}>{content.changeNote}</Text> : null}
                    {content.content.sections.map((section, index) => (
                      <View key={`${index}-${section.heading}`} style={styles.section}>
                        <Text accessibilityRole='header' style={styles.heading}>
                          {section.heading}
                        </Text>
                        <Text style={styles.text}>{section.body}</Text>
                      </View>
                    ))}
                    {content.content.steps.map((step) => (
                      <View key={step.code} style={styles.section}>
                        <Text accessibilityRole='header' style={styles.heading}>
                          {step.title}
                        </Text>
                        {step.checklist.map((item) => (
                          <Text key={item.code} style={styles.text}>
                            {item.text}
                          </Text>
                        ))}
                      </View>
                    ))}
                    <Pressable
                      accessibilityRole='button'
                      accessibilityState={{
                        disabled: acknowledge.isPending || policy.isFetching,
                        busy: acknowledge.isPending
                      }}
                      disabled={acknowledge.isPending || policy.isFetching}
                      onPress={() => void confirm()}
                      style={styles.primary}
                    >
                      <Text style={styles.primaryText}>{t('policy.confirm')}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </>
            )}
            {confirmLogout ? (
              <View style={styles.card}>
                <Text style={styles.heading}>{t('account.logoutTitle')}</Text>
                <Text style={styles.text}>{t('account.logoutMessage')}</Text>
                <Pressable
                  accessibilityRole='button'
                  disabled={logoutBusy}
                  onPress={() => setConfirmLogout(false)}
                  style={styles.secondary}
                >
                  <Text style={styles.link}>{t('account.logoutCancel')}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole='button'
                  disabled={logoutBusy}
                  onPress={() => void logout()}
                  style={styles.secondary}
                >
                  <Text style={styles.link}>{t('account.logoutConfirm')}</Text>
                </Pressable>
                {logoutError ? (
                  <Text accessibilityRole='alert' style={styles.error}>
                    {t('licenses.live.logoutError')}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Pressable
                accessibilityRole='button'
                disabled={acknowledge.isPending}
                onPress={() => setConfirmLogout(true)}
                style={styles.secondary}
              >
                <Text style={styles.link}>{t('licenses.live.logout')}</Text>
              </Pressable>
            )}
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </View>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    root: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background },
    content: { padding: 20, gap: 16, paddingBottom: 36 },
    title: { color: colors.foreground, fontSize: 24, fontWeight: '700' },
    heading: { color: colors.foreground, fontSize: 16, fontWeight: '700' },
    text: { color: colors.foreground, fontSize: 14, lineHeight: 22 },
    error: { color: colors.danger, fontSize: 14, lineHeight: 21 },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      gap: 12
    },
    section: { gap: 6, marginTop: 6 },
    primary: { backgroundColor: colors.primary, borderRadius: 14, padding: 14, alignItems: 'center', minHeight: 48 },
    primaryText: { color: colors.onPrimary, fontWeight: '700' },
    secondary: { minHeight: 44, justifyContent: 'center' },
    link: { color: colors.primaryInk, fontWeight: '700' }
  })
