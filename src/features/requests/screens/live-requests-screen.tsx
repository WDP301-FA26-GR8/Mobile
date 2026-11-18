import { Feather } from '@expo/vector-icons'
import { usePreventRemove } from '@react-navigation/native'
import { Redirect, useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import { SoftwareIcon } from '@/entities/software'
import { mayCreateRequest } from '@/shared/api/request-eligibility'
import { useSession } from '@/shared/api/session-context'
import { useAccountProfile } from '@/shared/api/use-account-profile'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

import { LiveRequestStatus } from '../components/live-request-status'
import { LiveRequestType } from '../components/live-request-type'
import { useLiveRequests } from '../hooks/use-live-requests'
import { useLiveWithdraw } from '../hooks/use-live-withdraw'

export function LiveRequestsScreen() {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const session = useSession()
  const profile = useAccountProfile()
  const [view, setView] = useState<'open' | 'ended'>('open')
  const [page, setPage] = useState(1)
  const query = useLiveRequests(view, page)
  const withdrawal = useLiveWithdraw()
  const [confirmId, setConfirmId] = useState<string>()
  const withdrawing = useRef(false)
  const inFlight = withdrawal.isPending || withdrawing.current
  usePreventRemove(session.state === 'authenticated' && inFlight, () => undefined)
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => inFlight || withdrawing.current)
      return () => subscription.remove()
    }, [inFlight])
  )

  if (session.state === 'anonymous') return <Redirect href='/' />
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text accessibilityRole='header' style={styles.pageTitle}>
                {t('requests.title')}
              </Text>
              <Text style={styles.muted}>{t('requests.live.subtitle')}</Text>
            </View>
            {!profile.isError && mayCreateRequest(profile.data) ? (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={t('navigation.createRequest')}
                accessibilityState={{ disabled: inFlight }}
                disabled={inFlight}
                onPress={() => router.push('/live-request-create')}
                style={styles.createButton}
              >
                <Feather
                  accessibilityElementsHidden
                  importantForAccessibility='no'
                  name='plus'
                  size={18}
                  color={mobileColors.onPrimary}
                />
                <Text style={styles.createText}>{t('requests.live.createShort')}</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.filters}>
            {(['open', 'ended'] as const).map((value) => (
              <Pressable
                key={value}
                accessibilityRole='button'
                accessibilityState={{ selected: view === value, disabled: inFlight }}
                disabled={inFlight}
                onPress={() => {
                  if (withdrawing.current) return
                  setView(value)
                  setPage(1)
                  setConfirmId(undefined)
                }}
                style={[styles.filter, view === value && styles.selected]}
              >
                <Text style={[styles.filterText, view === value && styles.selectedText]}>
                  {t(`requests.live.views.${value}`)}
                </Text>
              </Pressable>
            ))}
          </View>
          {withdrawal.isError ? (
            <Text accessibilityRole='alert' style={styles.error}>
              {t('requests.createLive.withdrawError')}
            </Text>
          ) : null}
          {withdrawal.isSuccess ? (
            <View accessibilityRole='summary'>
              <Text style={styles.muted}>{t('requests.createLive.withdrawSuccess')}</Text>
              <Text style={styles.muted}>{t('requests.createLive.withdrawResultState')}</Text>
              <LiveRequestStatus state={withdrawal.data.state} />
            </View>
          ) : null}
          {confirmId ? (
            <View accessibilityRole='summary' style={styles.card}>
              <Text style={styles.itemTitle}>{t('requests.createLive.confirmWithdraw')}</Text>
              <Text style={styles.muted}>{t('requests.createLive.withdrawNote')}</Text>
              <Pressable
                accessibilityRole='button'
                disabled={inFlight}
                accessibilityState={{ disabled: inFlight }}
                onPress={() => {
                  if (!withdrawing.current) setConfirmId(undefined)
                }}
                style={styles.action}
              >
                <Text style={styles.actionText}>{t('requests.cancel')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole='button'
                disabled={inFlight || query.isFetching || query.isError}
                accessibilityState={{ disabled: inFlight || query.isFetching || query.isError, busy: inFlight }}
                onPress={() => {
                  if (withdrawing.current || query.isFetching || query.isError) return
                  withdrawing.current = true
                  withdrawal.mutate(confirmId, {
                    onSettled: () => {
                      withdrawing.current = false
                      setConfirmId(undefined)
                    }
                  })
                }}
                style={styles.action}
              >
                <Text style={styles.actionText}>{t('requests.createLive.withdrawAction')}</Text>
              </Pressable>
            </View>
          ) : null}
          {session.state === 'loading' || query.isLoading ? (
            <Text accessibilityRole='progressbar' style={styles.muted}>
              {t('requests.live.loading')}
            </Text>
          ) : null}
          {query.isError ? (
            <View style={styles.card}>
              <Text accessibilityRole='alert' style={styles.error}>
                {t('requests.live.listError')}
              </Text>
              <Pressable accessibilityRole='button' onPress={() => void query.refetch()} style={styles.action}>
                <Text style={styles.actionText}>{t('licenses.live.retry')}</Text>
              </Pressable>
              {page > 1 ? (
                <Pressable accessibilityRole='button' onPress={() => setPage(page - 1)} style={styles.action}>
                  <Text style={styles.actionText}>{t('licenses.live.previous')}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {query.data?.items.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.muted}>{t('requests.live.empty')}</Text>
            </View>
          ) : null}
          {query.data?.items.map((item) => {
            const name = item.plan?.applicationName ?? item.softwareName ?? t('requests.live.unnamed')
            const date = new Date(item.submittedAt)
            return (
              <View key={item.id} style={styles.card}>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel={t('requests.live.openNamed', { name })}
                  accessibilityState={{ disabled: inFlight }}
                  disabled={inFlight}
                  onPress={() => {
                    if (!withdrawing.current) {
                      router.push({ pathname: '/live-requests/[requestId]', params: { requestId: item.id } })
                    }
                  }}
                >
                  <View style={styles.row}>
                    <SoftwareIcon name={name} />
                    <View style={styles.itemHeading}>
                      <Text style={styles.itemTitle}>{name}</Text>
                      {item.plan ? (
                        <Text style={styles.muted}>{t('licenses.live.plan', { plan: item.plan.planName })}</Text>
                      ) : null}
                    </View>
                    <Feather
                      accessibilityElementsHidden
                      importantForAccessibility='no'
                      name='chevron-right'
                      size={20}
                      color={mobileColors.muted}
                    />
                  </View>
                  <View style={styles.statusRow}>
                    <LiveRequestType type={item.type} />
                    <LiveRequestStatus state={item.state} />
                  </View>
                  {item.involvement === 'FOR_ME' ? <Text style={styles.muted}>{t('requests.live.forMe')}</Text> : null}
                  <Text style={styles.muted}>
                    {t('requests.live.submitted', {
                      date: Number.isNaN(date.getTime())
                        ? t('licenses.live.dateUnavailable')
                        : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(date)
                    })}
                  </Text>
                </Pressable>
                {item.canWithdraw ? (
                  <Pressable
                    accessibilityRole='button'
                    accessibilityLabel={t('requests.createLive.withdrawNamed', { name })}
                    accessibilityState={{
                      disabled: inFlight || withdrawal.isError || query.isFetching || query.isError
                    }}
                    disabled={inFlight || withdrawal.isError || query.isFetching || query.isError}
                    onPress={() => {
                      if (!withdrawing.current) setConfirmId(item.id)
                    }}
                    style={styles.action}
                  >
                    <Text style={styles.actionText}>{t('requests.createLive.withdraw')}</Text>
                  </Pressable>
                ) : null}
              </View>
            )
          })}
          {query.data && query.data.pagination.totalPages > 1 ? (
            <View style={styles.pagination}>
              <Pressable
                accessibilityRole='button'
                accessibilityState={{ disabled: page <= 1 || inFlight }}
                disabled={page <= 1 || inFlight}
                onPress={() => {
                  if (!withdrawing.current) setPage(page - 1)
                }}
                style={[styles.action, page <= 1 && styles.disabled]}
              >
                <Text style={styles.actionText}>{t('licenses.live.previous')}</Text>
              </Pressable>
              <Text style={styles.muted}>
                {t('licenses.live.page', { page: new Intl.NumberFormat(i18n.language).format(page) })}
              </Text>
              <Pressable
                accessibilityRole='button'
                accessibilityState={{ disabled: page >= query.data.pagination.totalPages || inFlight }}
                disabled={page >= query.data.pagination.totalPages || inFlight}
                onPress={() => {
                  if (!withdrawing.current) setPage(page + 1)
                }}
                style={[styles.action, page >= query.data.pagination.totalPages && styles.disabled]}
              >
                <Text style={styles.actionText}>{t('licenses.live.next')}</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const createStyles = (mobileColors: MobileColors) =>
  StyleSheet.create({
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
    titleBlock: { flex: 1, gap: 4 },
    pageTitle: { color: mobileColors.foreground, fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
    createButton: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: mobileColors.primary
    },
    createText: { color: mobileColors.onPrimary, fontWeight: '700' },
    safe: { flex: 1, backgroundColor: mobileColors.background },
    screen: { flex: 1 },
    content: { padding: 20, paddingBottom: 24, gap: 14 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 20,
      borderRadius: 22,
      backgroundColor: mobileColors.primarySoft
    },
    heading: { flex: 1, gap: 5 },
    kicker: {
      color: mobileColors.primaryInk,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase'
    },
    title: { color: mobileColors.foreground, fontSize: 25, fontWeight: '700' },
    headerSubtitle: { color: mobileColors.foreground, fontSize: 13, lineHeight: 19 },
    muted: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: mobileColors.surface,
      alignItems: 'center',
      justifyContent: 'center'
    },
    filters: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      backgroundColor: mobileColors.surfaceSubtle,
      padding: 4,
      borderRadius: 14
    },
    filter: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 15, borderRadius: 12 },
    selected: { backgroundColor: mobileColors.primary },
    filterText: { color: mobileColors.muted, fontWeight: '600', fontSize: 12 },
    selectedText: { color: mobileColors.onPrimary },
    card: {
      backgroundColor: mobileColors.white,
      borderColor: mobileColors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 18,
      gap: 9
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    itemHeading: { flex: 1, minWidth: 0, gap: 3 },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    itemTitle: { color: mobileColors.foreground, fontWeight: '700', fontSize: 16 },
    error: { color: mobileColors.danger, fontSize: 13 },
    action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8, alignSelf: 'flex-start' },
    actionText: { color: mobileColors.primaryInk, fontWeight: '700' },
    disabled: { opacity: 0.4 },
    pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
  })
