import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import { useSimilarSeats } from '../hooks/use-similar-seats'

export function SimilarSeats({ requestId }: { requestId: string }) {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const seats = useSimilarSeats(requestId, page)

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('manager.live.similarTitle')}</Text>
      {seats.isLoading ? <Text style={styles.muted}>{t('manager.live.similarLoading')}</Text> : null}
      {seats.isError ? (
        <Pressable accessibilityRole='button' onPress={() => void seats.refetch()} style={styles.action}>
          <Text accessibilityRole='alert' style={styles.error}>
            {t('manager.live.similarError')}
          </Text>
          <Text style={styles.link}>{t('licenses.live.retry')}</Text>
        </Pressable>
      ) : null}
      {!seats.isError && seats.data?.items.length === 0 ? (
        <Text style={styles.muted}>{t('manager.live.similarEmpty')}</Text>
      ) : null}
      {!seats.isError
        ? seats.data?.items.map((seat) => (
            <View key={seat.assignmentId} style={styles.item}>
              <Text style={styles.value}>{seat.plan.applicationName}</Text>
              <Text style={styles.muted}>{t('licenses.live.plan', { plan: seat.plan.planName })}</Text>
            </View>
          ))
        : null}
      {seats.data && seats.data.pagination.totalPages > 1 ? (
        <View style={styles.pagination}>
          <Pressable
            accessibilityRole='button'
            accessibilityState={{ disabled: page <= 1 }}
            disabled={page <= 1}
            onPress={() => setPage(page - 1)}
            style={[styles.action, page <= 1 && styles.disabled]}
          >
            <Text style={styles.link}>{t('licenses.live.previous')}</Text>
          </Pressable>
          <Text style={styles.muted}>
            {t('licenses.live.page', { page: new Intl.NumberFormat(i18n.language).format(page) })}
          </Text>
          <Pressable
            accessibilityRole='button'
            accessibilityState={{ disabled: page >= seats.data.pagination.totalPages }}
            disabled={page >= seats.data.pagination.totalPages}
            onPress={() => setPage(page + 1)}
            style={[styles.action, page >= seats.data.pagination.totalPages && styles.disabled]}
          >
            <Text style={styles.link}>{t('licenses.live.next')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { borderTopWidth: 1, borderTopColor: mobileColors.border, marginTop: 8, paddingTop: 12, gap: 8 },
  title: { color: mobileColors.foreground, fontSize: 16, fontWeight: '700' },
  item: { backgroundColor: mobileColors.surfaceSubtle, borderRadius: 10, padding: 10, gap: 3 },
  value: { color: mobileColors.foreground, fontSize: 14, lineHeight: 20 },
  muted: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 },
  error: { color: mobileColors.danger, fontSize: 13, lineHeight: 19 },
  link: { color: mobileColors.primaryInk, fontWeight: '700' },
  action: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
})
