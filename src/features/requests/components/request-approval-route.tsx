import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

import type { ApprovalRouteStep } from '../model/request-detail.model'

export function RequestApprovalRoute({ steps }: { steps: ApprovalRouteStep[] }) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)

  return (
    <View style={styles.card}>
      <Text accessibilityRole='header' style={styles.title}>
        {t('requests.live.route.title')}
      </Text>
      {steps.map((step, index) => (
        <View
          key={step.kind}
          accessible
          accessibilityLabel={t('requests.live.route.stepLabel', {
            index: index + 1,
            step: t(`requests.live.route.steps.${step.kind}`),
            status: t(`requests.live.route.status.${step.status}`)
          })}
          style={styles.row}
        >
          <View style={[styles.dot, styles[step.status]]} />
          <View style={styles.copy}>
            <Text style={styles.step}>{t(`requests.live.route.steps.${step.kind}`)}</Text>
            <Text style={styles.muted}>{t(`requests.live.route.status.${step.status}`)}</Text>
            {step.holder ? (
              <Text style={styles.muted}>{t('requests.live.route.holder', { name: step.holder })}</Text>
            ) : null}
            {step.note ? <Text style={styles.muted}>{t(`requests.live.route.notes.${step.note}`)}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 18,
      gap: 12
    },
    title: { color: colors.foreground, fontSize: 16, fontWeight: '700' },
    row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, borderWidth: 2 },
    done: { backgroundColor: colors.successDot, borderColor: colors.successDot },
    current: { backgroundColor: colors.primary, borderColor: colors.primary },
    upcoming: { backgroundColor: 'transparent', borderColor: colors.muted },
    stopped: { backgroundColor: colors.danger, borderColor: colors.danger },
    copy: { flex: 1, gap: 2 },
    step: { color: colors.foreground, fontWeight: '700', fontSize: 14 },
    muted: { color: colors.muted, fontSize: 13, lineHeight: 19 }
  })
