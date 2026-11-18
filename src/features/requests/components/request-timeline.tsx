import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { RequestEventPageResponseDtoDataItemsItemKind } from '@/shared/api/generated/contracts/access-requests'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

import { useRequestEvents } from '../hooks/use-request-events'

export function RequestTimeline({ requestId }: { requestId: string }) {
  const { t, i18n } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const [page, setPage] = useState(1)
  const events = useRequestEvents(requestId, page)

  return (
    <View style={styles.card}>
      <Text accessibilityRole='header' style={styles.heading}>
        {t('requests.live.timeline.title')}
      </Text>
      {events.isLoading ? (
        <Text accessibilityRole='progressbar' style={styles.muted}>
          {t('requests.live.timeline.loading')}
        </Text>
      ) : null}
      {events.isError ? (
        <View>
          <Text accessibilityRole='alert' style={styles.error}>
            {t('requests.live.timeline.error')}
          </Text>
          <Pressable accessibilityRole='button' onPress={() => void events.refetch()} style={styles.action}>
            <Text style={styles.link}>{t('account.retry')}</Text>
          </Pressable>
          {page > 1 ? (
            <Pressable accessibilityRole='button' onPress={() => setPage((value) => value - 1)} style={styles.action}>
              <Text style={styles.link}>{t('licenses.live.previous')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {!events.isError && events.data?.items.length === 0 ? (
        <Text style={styles.muted}>{t('requests.live.timeline.empty')}</Text>
      ) : null}
      {!events.isError
        ? events.data?.items.map((item) => {
            const kind = Object.values(RequestEventPageResponseDtoDataItemsItemKind).find(
              (value) => value === item.kind
            )
            const date = new Date(item.occurredAt)
            return (
              <View key={item.id} style={styles.event}>
                <View style={styles.dot} />
                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle}>
                    {kind
                      ? t(`requests.live.timeline.kinds.${kind}`)
                      : t('requests.live.timeline.unknown', { kind: item.kind })}
                  </Text>
                  <Text style={styles.muted}>
                    {Number.isNaN(date.getTime())
                      ? t('licenses.live.dateUnavailable')
                      : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
                          date
                        )}
                  </Text>
                  <Text style={styles.muted}>
                    {item.actor?.fullName ??
                      (item.actorKind === 'SYSTEM'
                        ? t('requests.live.timeline.system')
                        : t('requests.live.timeline.unknownActor'))}
                  </Text>
                  {item.line ? (
                    <Text style={styles.muted}>{t('requests.live.timeline.person', { name: item.line.fullName })}</Text>
                  ) : null}
                  {item.reason ? (
                    <Text style={styles.reason}>{t('requests.live.timeline.reason', { reason: item.reason })}</Text>
                  ) : null}
                </View>
              </View>
            )
          })
        : null}
      {events.data && !events.isError && events.data.pagination.totalPages > 1 ? (
        <View style={styles.pagination}>
          <Pressable
            accessibilityRole='button'
            disabled={page <= 1}
            accessibilityState={{ disabled: page <= 1 }}
            onPress={() => setPage((value) => value - 1)}
            style={styles.action}
          >
            <Text style={styles.link}>{t('licenses.live.previous')}</Text>
          </Pressable>
          <Text style={styles.muted}>
            {t('licenses.live.page', { page: new Intl.NumberFormat(i18n.language).format(page) })}
          </Text>
          <Pressable
            accessibilityRole='button'
            disabled={page >= events.data.pagination.totalPages}
            accessibilityState={{ disabled: page >= events.data.pagination.totalPages }}
            onPress={() => setPage((value) => value + 1)}
            style={styles.action}
          >
            <Text style={styles.link}>{t('licenses.live.next')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 18,
      gap: 14
    },
    heading: { color: colors.foreground, fontWeight: '700', fontSize: 16 },
    event: { flexDirection: 'row', gap: 12 },
    dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, backgroundColor: colors.primary },
    eventBody: { flex: 1, gap: 3 },
    eventTitle: { color: colors.foreground, fontWeight: '700', fontSize: 14 },
    muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    reason: { color: colors.foreground, fontSize: 13, lineHeight: 19 },
    error: { color: colors.danger, fontSize: 13 },
    action: { minHeight: 44, justifyContent: 'center' },
    link: { color: colors.primaryInk, fontWeight: '700' },
    pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }
  })
