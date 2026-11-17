import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import type { ApprovalDetailResponseDtoDataSpendApproval } from '@/shared/api/generated/contracts/approvalDetailResponseDtoDataSpendApproval'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

import { formatSpendMoney } from '../model/live-spending-approvals'

export function LiveSpendingBudgetSnapshot({ approval }: { approval: ApprovalDetailResponseDtoDataSpendApproval }) {
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const { t, i18n } = useTranslation()
  const snapshot = approval.budgetSnapshot

  if (!snapshot) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t('spending.live.budgetTitleGeneric')}</Text>
        <Text style={styles.muted}>{t('spending.live.budgetUnavailable')}</Text>
      </View>
    )
  }

  const values = [
    ['budgetBase', snapshot.base],
    ['reserve', snapshot.reserve],
    ['spent', snapshot.spent],
    ['committed', snapshot.committed],
    ['pending', snapshot.pending],
    ['remainingBase', snapshot.remainingBase],
    ['remainingWithReserve', snapshot.remainingWithReserve]
  ] as const
  const outcomeKey =
    snapshot.outcome === 'WITHIN_BASE' ? 'withinBase' : snapshot.outcome === 'USES_RESERVE' ? 'usesReserve' : 'blocked'

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>{t('spending.live.budgetTitle', { year: snapshot.year })}</Text>
          <Text style={styles.muted}>{t('spending.live.budgetReadOnly')}</Text>
        </View>
        <Text style={styles.readOnly}>{t('spending.live.readOnly')}</Text>
      </View>
      {snapshot.base === null ? <Text style={styles.notice}>{t('spending.live.noApprovedBudget')}</Text> : null}
      <View style={styles.values}>
        {values.map(([key, value]) => (
          <View key={key} style={styles.valueRow}>
            <Text style={styles.label}>{t(`spending.live.budgetFields.${key}`)}</Text>
            <Text style={styles.value}>
              {value
                ? (formatSpendMoney(value, i18n.language) ?? t('spending.live.amountUnavailable'))
                : t('spending.live.notAvailable')}
            </Text>
          </View>
        ))}
        {snapshot.overBy ? (
          <View style={styles.valueRow}>
            <Text style={styles.label}>{t('spending.live.budgetFields.overBy')}</Text>
            <Text style={styles.value}>
              {formatSpendMoney(snapshot.overBy, i18n.language) ?? t('spending.live.amountUnavailable')}
            </Text>
          </View>
        ) : null}
        {snapshot.overBaseBy ? (
          <View style={styles.valueRow}>
            <Text style={styles.label}>{t('spending.live.budgetFields.overBaseBy')}</Text>
            <Text style={styles.value}>
              {formatSpendMoney(snapshot.overBaseBy, i18n.language) ?? t('spending.live.amountUnavailable')}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.outcome}>{t(`spending.live.budgetOutcomes.${outcomeKey}`)}</Text>
      {snapshot.blockedReasons.length > 0 ? (
        <View style={styles.reasons}>
          {snapshot.blockedReasons.map((reason) => (
            <Text key={reason} style={styles.notice}>
              {t(`spending.live.blockedReasons.${reason}`)}
            </Text>
          ))}
        </View>
      ) : null}
      {approval.nextYearBudget ? (
        <View style={styles.nextYear}>
          <Text style={styles.sectionTitle}>
            {t('spending.live.nextYearBudget', { year: approval.nextYearBudget.year })}
          </Text>
          <ValueRow
            colors={colors}
            label={t('spending.live.nextYearApproved')}
            value={approval.nextYearBudget.approved}
            locale={i18n.language}
            unavailable={t('spending.live.notAvailable')}
            formatError={t('spending.live.amountUnavailable')}
          />
          <ValueRow
            colors={colors}
            label={t('spending.live.nextYearRemaining')}
            value={approval.nextYearBudget.remaining}
            locale={i18n.language}
            unavailable={t('spending.live.notAvailable')}
            formatError={t('spending.live.amountUnavailable')}
          />
          <ValueRow
            colors={colors}
            label={t('spending.live.nextYearRemainingAfter')}
            value={approval.nextYearBudget.remainingAfter}
            locale={i18n.language}
            unavailable={t('spending.live.notAvailable')}
            formatError={t('spending.live.amountUnavailable')}
          />
          {approval.nextYearBudget.warning ? (
            <Text style={styles.notice}>{t('spending.live.nextYearWarning')}</Text>
          ) : null}
        </View>
      ) : null}
      {snapshot.reserveConfirmation ? (
        <View style={styles.nextYear}>
          <Text style={styles.sectionTitle}>{t('spending.live.reserveConfirmation')}</Text>
          <Text style={styles.muted}>
            {t('spending.live.reserveConfirmedBy', { name: snapshot.reserveConfirmation.confirmedBy.fullName })}
          </Text>
          <Text style={styles.muted}>{snapshot.reserveConfirmation.reason}</Text>
        </View>
      ) : null}
    </View>
  )
}

function ValueRow({
  colors,
  label,
  value,
  locale,
  unavailable,
  formatError
}: {
  colors: MobileColors
  label: string
  value: { amount: string; currency: string } | null
  locale: string
  unavailable: string
  formatError: string
}) {
  const styles = createValueStyles(colors)
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ? (formatSpendMoney(value, locale) ?? formatError) : unavailable}</Text>
    </View>
  )
}

const createValueStyles = (colors: MobileColors) =>
  StyleSheet.create({
    row: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
    label: { color: colors.muted, flex: 1, fontSize: 12, lineHeight: 18 },
    value: {
      color: colors.foreground,
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 18,
      textAlign: 'right'
    }
  })

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      gap: 12,
      padding: 15
    },
    heading: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
    headingCopy: { flex: 1, gap: 3 },
    title: { color: colors.foreground, fontSize: 15, fontWeight: '700' },
    sectionTitle: { color: colors.foreground, fontSize: 13, fontWeight: '700' },
    muted: { color: colors.muted, fontSize: 11, lineHeight: 16 },
    readOnly: {
      backgroundColor: colors.surfaceSubtle,
      borderRadius: 8,
      color: colors.muted,
      fontSize: 10,
      fontWeight: '700',
      overflow: 'hidden',
      paddingHorizontal: 8,
      paddingVertical: 5
    },
    notice: {
      backgroundColor: colors.surfaceSubtle,
      borderRadius: 10,
      color: colors.foreground,
      fontSize: 12,
      lineHeight: 17,
      overflow: 'hidden',
      padding: 10
    },
    values: { gap: 9 },
    valueRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
    label: { color: colors.muted, flex: 1, fontSize: 12, lineHeight: 18 },
    value: {
      color: colors.foreground,
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 18,
      textAlign: 'right'
    },
    outcome: { color: colors.primaryInk, fontSize: 12, fontWeight: '700' },
    reasons: { gap: 6 },
    nextYear: { borderTopColor: colors.border, borderTopWidth: 1, gap: 8, paddingTop: 12 }
  })
