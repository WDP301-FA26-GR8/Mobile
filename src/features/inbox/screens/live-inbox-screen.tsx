import { Feather } from '@expo/vector-icons'
import { Redirect, useRouter } from 'expo-router'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/shared/api/session-context'
import { goBackOr } from '@/shared/lib/go-back-or'
import { mobileColors } from '@/shared/theme/colors'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { useLiveInbox } from '../hooks/use-live-inbox'

export function LiveInboxScreen({ navigation }: { navigation?: ReactNode } = {}) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const session = useSession()
  const [page, setPage] = useState(1)
  const { list, count, markRead } = useLiveInbox(page)

  if (session.state === 'anonymous') return <Redirect href='/' />

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          {!navigation ? (
            <Pressable
              accessibilityRole='button'
              onPress={() => goBackOr(router, '/my-software')}
              style={styles.action}
            >
              <Text style={styles.actionText}>{t('common.back')}</Text>
            </Pressable>
          ) : null}
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.kicker}>{t('licenses.live.kicker')}</Text>
              <Text accessibilityRole='header' style={styles.title}>
                {t('inbox.title')}
              </Text>
              <Text style={styles.muted}>
                {count.data !== undefined
                  ? t('inbox.live.unreadCount', {
                      count: count.data,
                      formattedCount: new Intl.NumberFormat(i18n.language).format(count.data)
                    })
                  : t('inbox.live.countUnavailable')}
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <Feather
                accessibilityElementsHidden
                importantForAccessibility='no'
                name='bell'
                size={21}
                color={mobileColors.primaryInk}
              />
            </View>
          </View>
          {count.isError ? (
            <Pressable accessibilityRole='button' onPress={() => void count.refetch()} style={styles.action}>
              <Text accessibilityRole='alert' style={styles.muted}>
                {t('inbox.live.countError')}
              </Text>
              <Text style={styles.actionText}>{t('licenses.live.retry')}</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole='button'
            accessibilityLabel={t('inbox.live.markAll')}
            accessibilityState={{ disabled: markRead.isPending || count.data === 0, busy: markRead.isPending }}
            disabled={markRead.isPending || count.data === 0}
            onPress={() => markRead.mutate(null)}
            style={[styles.action, (markRead.isPending || count.data === 0) && styles.disabled]}
          >
            <Feather
              accessibilityElementsHidden
              importantForAccessibility='no'
              name='check-circle'
              size={16}
              color={mobileColors.primaryInk}
            />
            <Text style={styles.actionText}>{t('inbox.live.markAll')}</Text>
          </Pressable>
          {markRead.isError ? (
            <Text accessibilityRole='alert' style={styles.error}>
              {t('inbox.live.writeError')}
            </Text>
          ) : null}
          {session.state === 'loading' || list.isLoading ? (
            <Text accessibilityRole='progressbar' style={styles.muted}>
              {t('inbox.live.loading')}
            </Text>
          ) : null}
          {list.isError ? (
            <View style={styles.card}>
              <Text accessibilityRole='alert' style={styles.error}>
                {t('inbox.live.loadError')}
              </Text>
              <Pressable accessibilityRole='button' onPress={() => void list.refetch()} style={styles.action}>
                <Text style={styles.actionText}>{t('licenses.live.retry')}</Text>
              </Pressable>
              {page > 1 ? (
                <Pressable accessibilityRole='button' onPress={() => setPage(page - 1)} style={styles.action}>
                  <Text style={styles.actionText}>{t('licenses.live.previous')}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {list.data?.items.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.muted}>{t('inbox.live.empty')}</Text>
            </View>
          ) : null}
          {list.data?.items.map((item) => {
            const codes = [
              'REQUEST_SUBMITTED',
              'REQUEST_GRANTED',
              'REQUEST_NEED_APPROVED',
              'REQUEST_NEED_REJECTED',
              'REQUEST_SPEND_APPROVED',
              'REQUEST_SPEND_REJECTED',
              'STEP_ASSIGNED',
              'REQUEST_WITHDRAWN',
              'HANDOVER_REQUIRED'
            ] as const
            const code = codes.find((value) => value === item.code)
            const date = new Date(item.createdAt)
            const requestId = item.params.requestId
            return (
              <View key={item.id} style={[styles.card, !item.readAt && styles.unread]}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {code ? t(`inbox.live.codes.${code}`) : t('inbox.live.unknown', { code: item.code })}
                  </Text>
                  <Text style={styles.muted}>{item.readAt ? t('inbox.live.read') : t('inbox.live.unread')}</Text>
                </View>
                <Text style={styles.muted}>
                  {Number.isNaN(date.getTime())
                    ? t('licenses.live.dateUnavailable')
                    : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(date)}
                </Text>
                {typeof requestId === 'string' &&
                /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(requestId) ? (
                  <>
                    <Text style={styles.muted}>{t('inbox.live.requestReference', { id: requestId })}</Text>
                    <Pressable
                      accessibilityRole='button'
                      onPress={() => router.push({ pathname: '/live-requests/[requestId]', params: { requestId } })}
                      style={styles.action}
                    >
                      <Text style={styles.actionText}>{t('requests.live.viewRequest')}</Text>
                    </Pressable>
                  </>
                ) : null}
                {!item.readAt ? (
                  <Pressable
                    accessibilityRole='button'
                    accessibilityLabel={t('inbox.live.markNamed', {
                      code: code ? t(`inbox.live.codes.${code}`) : item.code
                    })}
                    accessibilityState={{ disabled: markRead.isPending }}
                    disabled={markRead.isPending}
                    onPress={() => markRead.mutate(item.id)}
                    style={styles.action}
                  >
                    <Text style={styles.actionText}>{t('inbox.live.markRead')}</Text>
                  </Pressable>
                ) : null}
              </View>
            )
          })}
          {list.data && list.data.pagination.totalPages > 1 ? (
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
                accessibilityState={{ disabled: page >= list.data.pagination.totalPages }}
                disabled={page >= list.data.pagination.totalPages}
                onPress={() => setPage(page + 1)}
                style={[styles.action, page >= list.data.pagination.totalPages && styles.disabled]}
              >
                <Text style={styles.actionText}>{t('licenses.live.next')}</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
        {navigation ?? (
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
                selected: false,
                accessibilityLabel: t('navigation.openTab', { tab: t('navigation.requests') }),
                onPress: () => router.replace('/live-requests')
              },
              {
                id: 'inbox',
                label: t('navigation.inbox'),
                icon: 'bell',
                selected: true,
                accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') })
              }
            ]}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: mobileColors.background },
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heading: { flex: 1, gap: 4 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: mobileColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  kicker: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  title: { color: mobileColors.foreground, fontSize: 25, fontWeight: '700' },
  muted: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 },
  card: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8
  },
  unread: { borderColor: mobileColors.primary, backgroundColor: mobileColors.primarySoft },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  itemTitle: { flex: 1, color: mobileColors.foreground, fontSize: 15, fontWeight: '700' },
  action: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { color: mobileColors.primaryInk, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  error: { color: mobileColors.danger, fontSize: 13 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
})
