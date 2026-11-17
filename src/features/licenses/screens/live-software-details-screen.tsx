import { Redirect, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/shared/api/session-context'
import { goBackOr } from '@/shared/lib/go-back-or'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

import { LiveSoftwareCard } from '../components/live-software-card'
import { useSoftwareDetail } from '../hooks/use-software-detail'

export function LiveSoftwareDetailsScreen({ assignmentId }: { assignmentId: string }) {
  const { t, i18n } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const router = useRouter()
  const session = useSession()
  const detail = useSoftwareDetail(assignmentId)

  if (session.state === 'anonymous') return <Redirect href='/' />
  const formatDate = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`)
    return Number.isNaN(date.getTime())
      ? t('licenses.live.dateUnavailable')
      : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
  }
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole='button' onPress={() => goBackOr(router, '/my-software')} style={styles.action}>
          <Text style={styles.link}>{t('common.back')}</Text>
        </Pressable>
        <Text accessibilityRole='header' style={styles.title}>
          {t('licenses.live.detailTitle')}
        </Text>
        {session.state === 'loading' || detail.isLoading ? (
          <Text accessibilityRole='progressbar' style={styles.text}>
            {t('licenses.live.loading')}
          </Text>
        ) : null}
        {detail.isError ? (
          <>
            <Text accessibilityRole='alert' style={styles.error}>
              {t('licenses.live.error')}
            </Text>
            <Pressable accessibilityRole='button' onPress={() => void detail.refetch()} style={styles.action}>
              <Text style={styles.link}>{t('licenses.live.retry')}</Text>
            </Pressable>
          </>
        ) : null}
        {!detail.isError && detail.data === null ? (
          <Text style={styles.text}>{t('licenses.live.detailNotFound')}</Text>
        ) : null}
        {!detail.isError && detail.data ? (
          <>
            <LiveSoftwareCard item={detail.data} />
            {detail.data.grantedOn ? (
              <Text style={styles.text}>
                {t('licenses.live.grantedOn', { date: formatDate(detail.data.grantedOn) })}
              </Text>
            ) : detail.data.effectiveFromLabel ? (
              <Text style={styles.text}>{detail.data.effectiveFromLabel}</Text>
            ) : null}
            {detail.data.validUntil ? (
              <Text style={styles.text}>
                {t('licenses.live.validUntil', { date: formatDate(detail.data.validUntil) })}
              </Text>
            ) : null}
            {detail.data.successorAssignmentId ? <Text style={styles.text}>{t('licenses.live.renewed')}</Text> : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 16 },
    action: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    link: { color: colors.primaryInk, fontWeight: '700' },
    title: { color: colors.foreground, fontSize: 24, fontWeight: '700' },
    text: { color: colors.foreground, fontSize: 14, lineHeight: 21 },
    error: { color: colors.danger, fontSize: 14 }
  })
