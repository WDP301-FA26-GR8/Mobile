import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Redirect, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { notificationUnreadCount } from '@/shared/api/generated/api/notifications/notifications'
import { mayCreateRequest } from '@/shared/api/request-eligibility'
import { useSession } from '@/shared/api/session-context'
import { useAccountProfile } from '@/shared/api/use-account-profile'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { EmployeeProfileHeader } from '@/shared/ui/employee-profile-header'
import { ThemeSwitch } from '@/shared/ui/theme-switch'

export function LiveHomeScreen() {
  const { t, i18n } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const router = useRouter()
  const session = useSession()
  const profile = useAccountProfile()
  const count = useQuery({
    queryKey: ['session', 'notifications', 'count'],
    enabled: session.state === 'authenticated',
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await notificationUnreadCount({ signal, headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing notification count')
        return result.data.data.unread
      })
  })

  if (session.state === 'anonymous') return <Redirect href='/' />
  const account = !profile.isError ? profile.data : undefined
  const role = account?.roles.length === 1 ? account.roles[0] : undefined
  const mayRequest = mayCreateRequest(account)
  const manager = role === 'MANAGER' && !!account?.managerScope

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {account && role ? (
          <>
            <View style={styles.header}>
              <View style={styles.profile}>
                <EmployeeProfileHeader
                  initials={account.employee.fullName.trim().slice(0, 1).toLocaleUpperCase()}
                  name={account.employee.fullName}
                  meta={account.employee.department?.name ?? t('licenses.live.noDepartment')}
                  onOpenProfile={() => router.push('/profile')}
                />
              </View>
              <ThemeSwitch />
            </View>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>{t('home.live.eyebrow')}</Text>
              <Text accessibilityRole='header' style={styles.title}>
                {t('home.live.greeting', { name: account.employee.fullName })}
              </Text>
              <Text style={styles.subtitle}>{t('home.live.subtitle')}</Text>
            </View>
            {manager ? (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={t('manager.live.openQueue')}
                onPress={() => router.push('/live-need-approvals')}
                style={styles.featured}
              >
                <View style={styles.cardIcon}>
                  <Feather name='check-square' size={22} color={colors.primaryInk} />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{t('manager.live.openQueue')}</Text>
                  <Text style={styles.cardDescription}>{t('home.live.approvalsDescription')}</Text>
                </View>
                <Feather name='chevron-right' size={20} color={colors.muted} />
              </Pressable>
            ) : null}
            {role === 'MANAGER' && !account.managerScope ? (
              <Text accessibilityRole='alert' style={styles.notice}>
                {t('home.live.noManagerScope')}
              </Text>
            ) : null}
            {role === 'SPENDING_APPROVER' ? (
              <Text style={styles.notice}>{t('home.live.spendingUnavailable')}</Text>
            ) : null}
            <Text accessibilityRole='header' style={styles.sectionTitle}>
              {t('home.live.actions')}
            </Text>
            <View style={styles.grid}>
              <Pressable accessibilityRole='button' onPress={() => router.push('/my-software')} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Feather name='grid' size={21} color={colors.primaryInk} />
                </View>
                <Text style={styles.cardTitle}>{t('home.live.software')}</Text>
                <Text style={styles.cardDescription}>{t('home.live.softwareDescription')}</Text>
              </Pressable>
              {mayRequest ? (
                <Pressable
                  accessibilityRole='button'
                  onPress={() => router.push('/live-request-create')}
                  style={styles.card}
                >
                  <View style={styles.cardIcon}>
                    <Feather name='plus-circle' size={21} color={colors.primaryInk} />
                  </View>
                  <Text style={styles.cardTitle}>{t('navigation.createRequest')}</Text>
                  <Text style={styles.cardDescription}>{t('home.live.createDescription')}</Text>
                </Pressable>
              ) : null}
              <Pressable accessibilityRole='button' onPress={() => router.push('/live-requests')} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Feather name='file-text' size={21} color={colors.primaryInk} />
                </View>
                <Text style={styles.cardTitle}>{t('home.live.requests')}</Text>
                <Text style={styles.cardDescription}>{t('home.live.requestsDescription')}</Text>
              </Pressable>
              <Pressable accessibilityRole='button' onPress={() => router.push('/live-inbox')} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Feather name='bell' size={21} color={colors.primaryInk} />
                </View>
                <Text style={styles.cardTitle}>{t('navigation.inbox')}</Text>
                <Text style={styles.cardDescription}>
                  {count.data !== undefined
                    ? t('home.live.unread', {
                        count: count.data,
                        formattedCount: new Intl.NumberFormat(i18n.language).format(count.data)
                      })
                    : count.isError
                      ? t('home.live.countError')
                      : t('home.live.countLoading')}
                </Text>
              </Pressable>
            </View>
          </>
        ) : profile.isError || (account && !role) ? (
          <View style={styles.notice}>
            <Text accessibilityRole='alert' style={styles.cardDescription}>
              {t('account.error')}
            </Text>
            <Pressable accessibilityRole='button' onPress={() => void profile.refetch()}>
              <Text style={styles.link}>{t('account.retry')}</Text>
            </Pressable>
          </View>
        ) : (
          <Text accessibilityRole='progressbar' style={styles.subtitle}>
            {t('account.loading')}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 18, paddingBottom: 36 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    profile: { flex: 1 },
    hero: { paddingVertical: 12, gap: 7 },
    eyebrow: { color: colors.primaryInk, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
    title: { color: colors.foreground, fontWeight: '700', fontSize: 27 },
    subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
    sectionTitle: { color: colors.foreground, fontSize: 18, fontWeight: '700' },
    featured: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.primarySoft,
      borderRadius: 18,
      padding: 16,
      minHeight: 84
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: {
      flexGrow: 1,
      flexBasis: '46%',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      gap: 9,
      minHeight: 148
    },
    cardIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center'
    },
    cardCopy: { flex: 1, gap: 5 },
    cardTitle: { color: colors.foreground, fontSize: 15, fontWeight: '700' },
    cardDescription: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    notice: { backgroundColor: colors.surfaceSubtle, borderRadius: 14, padding: 14, color: colors.foreground },
    link: { color: colors.primaryInk, fontWeight: '700', paddingTop: 10 }
  })
