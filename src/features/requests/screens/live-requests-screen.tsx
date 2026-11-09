import { Feather } from '@expo/vector-icons'
import { Redirect, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/shared/api/session-context'
import { goBackOr } from '@/shared/lib/go-back-or'
import { mobileColors } from '@/shared/theme/colors'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { LiveRequestStatus } from '../components/live-request-status'
import { LiveRequestType } from '../components/live-request-type'
import { useLiveRequests } from '../hooks/use-live-requests'
import { useLiveWithdraw } from '../hooks/use-live-withdraw'

export function LiveRequestsScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const session = useSession()
  const [view, setView] = useState<'open' | 'ended'>('open')
  const [page, setPage] = useState(1)
  const query = useLiveRequests(view, page)
  const withdrawal = useLiveWithdraw()
  const [confirmId, setConfirmId] = useState<string>()
  const withdrawing = useRef(false)

  if (session.state === 'anonymous') return <Redirect href='/' />
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable accessibilityRole='button' onPress={() => goBackOr(router, '/my-software')} style={styles.action}>
            <Text style={styles.actionText}>{t('common.back')}</Text>
          </Pressable>
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.kicker}>{t('licenses.live.kicker')}</Text>
              <Text accessibilityRole='header' style={styles.title}>
                {t('requests.title')}
              </Text>
              <Text style={styles.muted}>{t('requests.live.subtitle')}</Text>
            </View>
            <View style={styles.icon}>
              <Feather
                accessibilityElementsHidden
                importantForAccessibility='no'
                name='file-text'
                size={21}
                color={mobileColors.primaryInk}
              />
            </View>
          </View>
          <View style={styles.filters}>
            {(['open', 'ended'] as const).map((value) => (
              <Pressable
                key={value}
                accessibilityRole='button'
                accessibilityState={{ selected: view === value }}
                onPress={() => {
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
            <Text accessibilityRole='summary' style={styles.muted}>
              {t('requests.createLive.withdrawSuccess')}
            </Text>
          ) : null}
          {confirmId ? (
            <View accessibilityRole='summary' style={styles.card}>
              <Text style={styles.itemTitle}>{t('requests.createLive.confirmWithdraw')}</Text>
              <Text style={styles.muted}>{t('requests.createLive.withdrawNote')}</Text>
              <Pressable
                accessibilityRole='button'
                disabled={withdrawal.isPending}
                accessibilityState={{ disabled: withdrawal.isPending }}
                onPress={() => setConfirmId(undefined)}
                style={styles.action}
              >
                <Text style={styles.actionText}>{t('requests.cancel')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole='button'
                disabled={withdrawal.isPending}
                accessibilityState={{ disabled: withdrawal.isPending, busy: withdrawal.isPending }}
                onPress={() => {
                  if (withdrawing.current) return
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
                  onPress={() =>
                    router.push({ pathname: '/live-requests/[requestId]', params: { requestId: item.id } })
                  }
                >
                  <View style={styles.row}>
                    <Text style={styles.itemTitle}>{name}</Text>
                    <Feather
                      accessibilityElementsHidden
                      importantForAccessibility='no'
                      name='chevron-right'
                      size={20}
                      color={mobileColors.muted}
                    />
                  </View>
                  {item.plan ? (
                    <Text style={styles.muted}>{t('licenses.live.plan', { plan: item.plan.planName })}</Text>
                  ) : null}
                  <LiveRequestType type={item.type} />
                  <LiveRequestStatus state={item.state} />
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
                    accessibilityState={{ disabled: withdrawal.isPending || withdrawal.isError }}
                    disabled={withdrawal.isPending || withdrawal.isError}
                    onPress={() => setConfirmId(item.id)}
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
                accessibilityState={{ disabled: page <= 1 }}
                disabled={page <= 1}
                onPress={() => setPage(page - 1)}
                style={[styles.action, page <= 1 && styles.disabled]}
              >
                <Text style={styles.actionText}>{t('licenses.live.previous')}</Text>
              </Pressable>
              <Text style={styles.muted}>
                {t('licenses.live.page', { page: new Intl.NumberFormat(i18n.language).format(page) })}
              </Text>
              <Pressable
                accessibilityRole='button'
                accessibilityState={{ disabled: page >= query.data.pagination.totalPages }}
                disabled={page >= query.data.pagination.totalPages}
                onPress={() => setPage(page + 1)}
                style={[styles.action, page >= query.data.pagination.totalPages && styles.disabled]}
              >
                <Text style={styles.actionText}>{t('licenses.live.next')}</Text>
              </Pressable>
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
              selected: false,
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.software') }),
              onPress: () => router.replace('/my-software')
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
              selected: true,
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.requests') })
            },
            {
              id: 'inbox',
              label: t('navigation.inbox'),
              icon: 'bell',
              selected: false,
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
              onPress: () => router.replace('/live-inbox')
            }
          ]}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: mobileColors.background },
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 24, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heading: { flex: 1, gap: 5 },
  kicker: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  title: { color: mobileColors.foreground, fontSize: 25, fontWeight: '700' },
  muted: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: mobileColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filters: { alignSelf: 'flex-start', flexDirection: 'row', backgroundColor: '#f6eee6', padding: 4, borderRadius: 14 },
  filter: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 15, borderRadius: 12 },
  selected: { backgroundColor: mobileColors.primary },
  filterText: { color: mobileColors.muted, fontWeight: '600', fontSize: 12 },
  selectedText: { color: mobileColors.white },
  card: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 9
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: { flex: 1, color: mobileColors.foreground, fontWeight: '700', fontSize: 16 },
  error: { color: mobileColors.danger, fontSize: 13 },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8, alignSelf: 'flex-start' },
  actionText: { color: mobileColors.primaryInk, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
})
