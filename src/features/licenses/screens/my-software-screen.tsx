import { Feather } from '@expo/vector-icons'
import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/shared/api/session-context'
import { mobileColors } from '@/shared/theme/colors'
import { EmployeeProfileHeader } from '@/shared/ui/employee-profile-header'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { LiveSoftwareCard } from '../components/live-software-card'
import { useMySoftware } from '../hooks/use-my-software'

export function MySoftwareScreen() {
  const { t, i18n } = useTranslation()
  const session = useSession()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'expiring'>('all')
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(false)
  const { profile, software, summary } = useMySoftware(page)
  const items = software.data?.items.filter((item) => filter === 'all' || item.expiringSoon) ?? []
  const expiring = summary.data?.expiringRights
  const expiringCount = expiring?.state === 'COUNTED' && expiring.count !== null ? expiring.count : undefined
  const formatCount = (value: number) => new Intl.NumberFormat(i18n.language).format(value)

  async function logout() {
    if (loggingOut) return
    setLogoutError(false)
    setLoggingOut(true)
    try {
      await session.logout()
    } catch {
      setLogoutError(true)
    } finally {
      setLoggingOut(false)
    }
  }

  if (session.state === 'anonymous') return <Redirect href='/' />

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          {session.state === 'authenticated' ? (
            <View style={styles.profile}>
              <View style={styles.profileCopy}>
                {profile.data ? (
                  <EmployeeProfileHeader
                    initials={profile.data.employee.fullName.trim().slice(0, 1).toLocaleUpperCase()}
                    name={profile.data.employee.fullName}
                    meta={profile.data.employee.department?.name ?? t('licenses.live.noDepartment')}
                  />
                ) : null}
              </View>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={loggingOut ? t('auth.loading') : t('licenses.live.logout')}
                accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
                disabled={loggingOut}
                onPress={() => void logout()}
                style={styles.inboxButton}
              >
                <Feather
                  accessibilityElementsHidden
                  importantForAccessibility='no'
                  name='log-out'
                  size={18}
                  color={mobileColors.primaryInk}
                />
              </Pressable>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={t('navigation.openTab', { tab: t('navigation.inbox') })}
                onPress={() => router.push('/live-inbox')}
                style={styles.inboxButton}
              >
                <Feather
                  accessibilityElementsHidden
                  importantForAccessibility='no'
                  name='bell'
                  size={18}
                  color={mobileColors.primaryInk}
                />
              </Pressable>
            </View>
          ) : null}
          {logoutError ? (
            <Text accessibilityRole='alert' style={styles.error}>
              {t('licenses.live.logoutError')}
            </Text>
          ) : null}
          <View style={styles.heading}>
            <Text style={styles.kicker}>{t('licenses.live.kicker')}</Text>
            <Text accessibilityRole='header' style={styles.title}>
              {t('licenses.screenTitle')}
            </Text>
            <Text style={styles.subtitle}>{t('licenses.live.description')}</Text>
            {profile.data?.roles.includes('MANAGER') ? (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={t('manager.live.openQueue')}
                onPress={() => router.push('/live-need-approvals')}
                style={styles.approvalsLink}
              >
                <Feather
                  accessibilityElementsHidden
                  importantForAccessibility='no'
                  name='check-square'
                  size={16}
                  color={mobileColors.primaryInk}
                />
                <Text style={styles.buttonText}>{t('manager.live.openQueue')}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Feather
                  accessibilityElementsHidden
                  importantForAccessibility='no'
                  name='grid'
                  size={16}
                  color={mobileColors.primaryInk}
                />
              </View>
              <Text style={styles.summaryValue}>
                {software.data
                  ? t('licenses.live.total', {
                      count: software.data.pagination.totalItems,
                      formattedCount: formatCount(software.data.pagination.totalItems)
                    })
                  : t('licenses.live.countUnavailable')}
              </Text>
              <Text style={styles.summaryLabel}>{t('licenses.live.currentRights')}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, styles.summaryIconWarning]}>
                <Feather
                  accessibilityElementsHidden
                  importantForAccessibility='no'
                  name='clock'
                  size={16}
                  color={mobileColors.warning}
                />
              </View>
              <Text style={styles.summaryValue}>
                {expiringCount !== undefined
                  ? t('licenses.live.expiringTotal', {
                      count: expiringCount,
                      formattedCount: formatCount(expiringCount)
                    })
                  : t('licenses.live.countUnavailable')}
              </Text>
              <Text style={styles.summaryLabel}>{t('licenses.live.expiringLabel')}</Text>
            </View>
          </View>
          {summary.isError ? (
            <Pressable accessibilityRole='button' onPress={() => void summary.refetch()} style={styles.retryInline}>
              <Text accessibilityRole='alert' style={styles.subtitle}>
                {t('licenses.live.summaryError')}
              </Text>
              <Text style={styles.buttonText}>{t('licenses.live.retry')}</Text>
            </Pressable>
          ) : null}

          <View style={styles.sectionHeading}>
            <Text accessibilityRole='header' style={styles.sectionTitle}>
              {t('licenses.listTitle')}
            </Text>
          </View>
          <View accessibilityLabel={t('licenses.filterLabel')} style={styles.filters}>
            {(['all', 'expiring'] as const).map((value) => (
              <Pressable
                key={value}
                accessibilityRole='button'
                accessibilityState={{ selected: filter === value }}
                onPress={() => setFilter(value)}
                style={[styles.filterButton, filter === value && styles.filterSelected]}
              >
                <Text style={[styles.filterText, filter === value && styles.filterTextSelected]}>
                  {t(`licenses.listFilters.${value}`)}
                </Text>
              </Pressable>
            ))}
          </View>
          {filter === 'expiring' ? <Text style={styles.subtitle}>{t('licenses.live.pageFilterNote')}</Text> : null}
          {session.state === 'loading' || profile.isLoading || software.isLoading ? (
            <Text accessibilityRole='progressbar' style={styles.subtitle}>
              {t('licenses.live.loading')}
            </Text>
          ) : null}
          {profile.isError || software.isError ? (
            <View style={styles.messageCard}>
              <Text accessibilityRole='alert' style={styles.subtitle}>
                {t('licenses.live.error')}
              </Text>
              <Pressable
                accessibilityRole='button'
                onPress={() => {
                  if (profile.isError) void profile.refetch()
                  if (software.isError) void software.refetch()
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{t('licenses.live.retry')}</Text>
              </Pressable>
              {page > 1 && software.isError ? (
                <Pressable
                  accessibilityRole='button'
                  onPress={() => setPage((current) => current - 1)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{t('licenses.live.previous')}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {software.data ? (
            <View style={styles.list}>
              {items.map((item) => (
                <LiveSoftwareCard key={item.assignmentId} item={item} />
              ))}
              {items.length === 0 ? (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <Feather
                      accessibilityElementsHidden
                      importantForAccessibility='no'
                      name='inbox'
                      size={24}
                      color={mobileColors.primaryInk}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {filter === 'expiring'
                      ? t('licenses.live.noExpiringPage')
                      : page === 1
                        ? t('licenses.live.empty')
                        : t('licenses.live.emptyPage')}
                  </Text>
                  {filter === 'all' && page === 1 ? (
                    <Text style={styles.emptyHint}>{t('licenses.live.emptyHint')}</Text>
                  ) : null}
                </View>
              ) : null}
              {software.data.pagination.totalPages > 1 ? (
                <View style={styles.pagination}>
                  <Pressable
                    accessibilityRole='button'
                    accessibilityState={{ disabled: page <= 1 }}
                    disabled={page <= 1}
                    onPress={() => setPage((current) => current - 1)}
                    style={[styles.button, page <= 1 && styles.disabledButton]}
                  >
                    <Text style={styles.buttonText}>{t('licenses.live.previous')}</Text>
                  </Pressable>
                  <Text style={styles.subtitle}>{t('licenses.live.page', { page: formatCount(page) })}</Text>
                  <Pressable
                    accessibilityRole='button'
                    accessibilityState={{ disabled: page >= software.data.pagination.totalPages }}
                    disabled={page >= software.data.pagination.totalPages}
                    onPress={() => setPage((current) => current + 1)}
                    style={[styles.button, page >= software.data.pagination.totalPages && styles.disabledButton]}
                  >
                    <Text style={styles.buttonText}>{t('licenses.live.next')}</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
        <MobileTabBar
          accessibilityLabel={t('navigation.tabs')}
          tabs={[
            {
              id: 'software',
              label: t('navigation.software'),
              icon: 'grid',
              selected: true,
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.software') })
            },
            {
              id: 'create',
              label: t('navigation.createRequest'),
              icon: 'plus-circle',
              selected: false,
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.createRequest') }),
              onPress: () => router.push('/live-request-create')
            },
            {
              id: 'requests',
              label: t('navigation.requests'),
              icon: 'clock',
              selected: false,
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.requests') }),
              onPress: () => router.push('/live-requests')
            },
            {
              id: 'inbox',
              label: t('navigation.inbox'),
              icon: 'bell',
              selected: false,
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
              onPress: () => router.push('/live-inbox')
            }
          ]}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: mobileColors.background, flex: 1 },
  screen: { flex: 1 },
  content: { gap: 15, padding: 16, paddingBottom: 24 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileCopy: { flex: 1 },
  inboxButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: mobileColors.border,
    backgroundColor: mobileColors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heading: { gap: 5, paddingHorizontal: 2 },
  approvalsLink: { minHeight: 44, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8 },
  kicker: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  title: { color: mobileColors.foreground, fontSize: 25, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 },
  summary: { flexDirection: 'row', gap: 9 },
  summaryCard: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    padding: 13
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 12,
    height: 30,
    justifyContent: 'center',
    marginBottom: 2,
    width: 34
  },
  summaryIconWarning: { backgroundColor: mobileColors.warningBackground },
  summaryValue: { color: mobileColors.foreground, fontSize: 17, fontWeight: '700' },
  summaryLabel: { color: mobileColors.muted, fontSize: 10, fontWeight: '500' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: mobileColors.foreground, fontSize: 16, fontWeight: '700' },
  filters: { alignSelf: 'flex-start', backgroundColor: '#f6eee6', borderRadius: 14, flexDirection: 'row', padding: 4 },
  filterButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 15
  },
  filterSelected: { backgroundColor: mobileColors.primary },
  filterText: { color: mobileColors.muted, fontSize: 12, fontWeight: '600' },
  filterTextSelected: { color: mobileColors.white },
  list: { gap: 9 },
  messageCard: { backgroundColor: mobileColors.white, borderRadius: 16, padding: 16, gap: 8 },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 22,
    gap: 8
  },
  emptyIcon: {
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 16,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTitle: { color: mobileColors.foreground, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  emptyHint: { color: mobileColors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  pagination: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  button: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  disabledButton: { opacity: 0.4 },
  buttonText: { color: mobileColors.primaryInk, fontWeight: '700' },
  retryInline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 44 },
  error: { color: mobileColors.danger, fontSize: 13, lineHeight: 19 }
})
