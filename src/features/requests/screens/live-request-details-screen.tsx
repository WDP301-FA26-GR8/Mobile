import { Redirect, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { SoftwareIcon } from '@/entities/software'
import { useSession } from '@/shared/api/session-context'
import { goBackOr } from '@/shared/lib/go-back-or'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

import { LiveRequestStatus } from '../components/live-request-status'
import { LiveRequestType } from '../components/live-request-type'
import { useLiveRequest } from '../hooks/use-live-requests'

export function LiveRequestDetailsScreen({ requestId }: { requestId: string }) {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t, i18n } = useTranslation()
  const session = useSession()
  const router = useRouter()
  const query = useLiveRequest(requestId)
  const data = query.data
  const request = data && 'request' in data ? data.request : undefined
  const draft = data && 'draft' in data ? data.draft : undefined
  const submitted = request ? new Date(request.submittedAt) : null
  const expectedEnd = request?.expectedEndDate ? new Date(`${request.expectedEndDate}T00:00:00.000Z`) : null
  const name = request?.plan?.applicationName ?? request?.proposal?.softwareName ?? t('requests.live.unnamed')

  if (session.state === 'anonymous') return <Redirect href='/' />
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole='button' onPress={() => goBackOr(router, '/live-requests')} style={styles.action}>
          <Text style={styles.actionText}>{t('common.back')}</Text>
        </Pressable>
        <Text accessibilityRole='header' style={styles.title}>
          {t('requests.live.detailsTitle')}
        </Text>
        {session.state === 'loading' || query.isLoading ? (
          <Text accessibilityRole='progressbar' style={styles.muted}>
            {t('requests.live.loading')}
          </Text>
        ) : null}
        {query.isError ? (
          <View style={styles.card}>
            <Text accessibilityRole='alert' style={styles.error}>
              {t('requests.live.detailError')}
            </Text>
            <Pressable accessibilityRole='button' onPress={() => void query.refetch()} style={styles.action}>
              <Text style={styles.actionText}>{t('licenses.live.retry')}</Text>
            </Pressable>
          </View>
        ) : null}
        {request ? (
          <>
            <View style={styles.card}>
              <View style={styles.identity}>
                <SoftwareIcon name={name} />
                <View style={styles.identityCopy}>
                  <Text style={styles.name}>{name}</Text>
                  {request.plan ? (
                    <Text style={styles.muted}>{t('licenses.live.plan', { plan: request.plan.planName })}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.statusRow}>
                <LiveRequestStatus state={request.state} />
                <LiveRequestType type={request.type} />
              </View>
              {request.type === 'GROUP_GRANT' ? (
                <Text style={styles.muted}>
                  {t('requests.live.lineCount', {
                    count: request.lineCount,
                    formattedCount: new Intl.NumberFormat(i18n.language).format(request.lineCount)
                  })}
                </Text>
              ) : null}
              <Text style={styles.muted}>{t('requests.live.reference', { id: request.id })}</Text>
            </View>
            <View style={styles.card}>
              <Text accessibilityRole='header' style={styles.sectionTitle}>
                {t('requests.live.informationHeading')}
              </Text>
              <Text style={styles.label}>{t('requests.live.reason')}</Text>
              <Text style={styles.value}>{request.businessReason}</Text>
              <Text style={styles.label}>{t('requests.live.endDate')}</Text>
              <Text style={styles.value}>
                {expectedEnd
                  ? Number.isNaN(expectedEnd.getTime())
                    ? t('licenses.live.dateUnavailable')
                    : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeZone: 'UTC' }).format(
                        expectedEnd
                      )
                  : t('requests.live.noEndDate')}
              </Text>
              <Text style={styles.label}>{t('requests.live.requester')}</Text>
              <Text style={styles.value}>{request.requester.fullName}</Text>
              {request.beneficiary ? (
                <>
                  <Text style={styles.label}>{t('requests.live.beneficiary')}</Text>
                  <Text style={styles.value}>{request.beneficiary.fullName}</Text>
                </>
              ) : null}
              <Text style={styles.muted}>
                {t('requests.live.submitted', {
                  date:
                    submitted && !Number.isNaN(submitted.getTime())
                      ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
                          submitted
                        )
                      : t('licenses.live.dateUnavailable')
                })}
              </Text>
              {request.needDecision?.reason ? (
                <>
                  <Text style={styles.label}>{t('requests.live.needReason')}</Text>
                  <Text style={styles.value}>{request.needDecision.reason}</Text>
                </>
              ) : null}
              {request.spend?.refusalReason ? (
                <>
                  <Text style={styles.label}>{t('requests.live.spendReason')}</Text>
                  <Text style={styles.value}>{request.spend.refusalReason}</Text>
                </>
              ) : null}
              {request.withdrawal?.reason ? (
                <>
                  <Text style={styles.label}>{t('requests.live.withdrawalReason')}</Text>
                  <Text style={styles.value}>{request.withdrawal.reason}</Text>
                </>
              ) : null}
            </View>
          </>
        ) : null}
        {draft ? (
          <View style={styles.card}>
            <Text style={styles.name}>{t('requests.live.draft')}</Text>
            <Text style={styles.muted}>{t('requests.live.reference', { id: draft.id })}</Text>
            <Text style={styles.muted}>{t('requests.live.draftNote')}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (mobileColors: MobileColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: mobileColors.background },
    content: { padding: 20, paddingBottom: 24, gap: 14 },
    action: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
    actionText: { color: mobileColors.primaryInk, fontWeight: '700' },
    title: { color: mobileColors.foreground, fontSize: 25, fontWeight: '700' },
    card: {
      backgroundColor: mobileColors.white,
      borderColor: mobileColors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 18,
      gap: 8
    },
    name: { color: mobileColors.foreground, fontSize: 18, fontWeight: '700' },
    identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    identityCopy: { flex: 1, minWidth: 0, gap: 4 },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    sectionTitle: { color: mobileColors.foreground, fontSize: 16, fontWeight: '700', marginBottom: 4 },
    label: { color: mobileColors.muted, fontSize: 12, marginTop: 6 },
    value: { color: mobileColors.foreground, fontSize: 14, lineHeight: 20 },
    muted: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 },
    error: { color: mobileColors.danger, fontSize: 13 }
  })
