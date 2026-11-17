import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import {
  getRemainingBudgetAfterApproval,
  spendingBudgetSnapshot,
  type SpendingApproval
} from '../model/spending-approvals'

interface BudgetSnapshotCardProps {
  annualCostVnd?: number
  budgetPlan?: string
  financeOpinion: SpendingApproval['financeOpinion']
}

export function BudgetSnapshotCard({ annualCostVnd, budgetPlan, financeOpinion }: BudgetSnapshotCardProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US'
  const amount = (value: number) => new Intl.NumberFormat(locale).format(value)
  const remainingAfterApproval = getRemainingBudgetAfterApproval(annualCostVnd)

  return (
    <View accessibilityLabel={t('spending.snapshotAccessibleLabel')} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{t('spending.snapshotTitle')}</Text>
          <Text style={styles.subtitle}>{t('spending.snapshotReadOnly')}</Text>
        </View>
        <View style={styles.readOnlyBadge}>
          <Text style={styles.readOnlyText}>{t('spending.readOnly')}</Text>
        </View>
      </View>

      {budgetPlan ? (
        <View style={styles.plan}>
          <Text style={styles.planLabel}>{t('spending.budgetPlan')}</Text>
          <Text style={styles.planValue}>{budgetPlan}</Text>
        </View>
      ) : null}

      <SnapshotRow
        label={t('spending.budgetLimit')}
        value={t('spending.amountVnd', { amount: amount(spendingBudgetSnapshot.limitVnd) })}
      />
      <SnapshotRow
        label={t('spending.committed')}
        value={t('spending.amountVnd', { amount: amount(spendingBudgetSnapshot.committedVnd) })}
      />
      <SnapshotRow
        emphasized
        label={t('spending.availableBefore')}
        value={t('spending.amountVnd', { amount: amount(spendingBudgetSnapshot.availableVnd) })}
      />
      <SnapshotRow
        emphasized={remainingAfterApproval !== undefined}
        label={t('spending.availableAfter')}
        value={
          remainingAfterApproval === undefined
            ? t('spending.notCalculated')
            : t('spending.amountVnd', { amount: amount(remainingAfterApproval) })
        }
      />
      <View style={styles.opinion}>
        <Text style={styles.opinionLabel}>{t('spending.snapshotStatus')}</Text>
        <Text style={styles.opinionValue}>
          {t(financeOpinion === 'withinBudget' ? 'spending.withinBudget' : 'spending.noDemoQuote')}
        </Text>
      </View>
    </View>
  )
}

interface SnapshotRowProps {
  emphasized?: boolean
  label: string
  value: string
}

function SnapshotRow({ emphasized = false, label, value }: SnapshotRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, emphasized && styles.emphasizedValue]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 15,
    borderWidth: 1,
    gap: 11,
    padding: 14
  },
  emphasizedValue: {
    color: mobileColors.success,
    fontWeight: '700'
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between'
  },
  headerCopy: {
    flex: 1,
    gap: 3
  },
  opinion: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 10,
    gap: 4,
    padding: 10
  },
  opinionLabel: {
    color: mobileColors.muted,
    fontSize: 11
  },
  opinionValue: {
    color: mobileColors.foreground,
    fontSize: 12,
    fontWeight: '700'
  },
  plan: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 9,
    gap: 2,
    padding: 10
  },
  planLabel: {
    color: mobileColors.muted,
    fontSize: 10
  },
  planValue: {
    color: mobileColors.foreground,
    fontSize: 12,
    fontWeight: '700'
  },
  readOnlyBadge: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  readOnlyText: {
    color: mobileColors.muted,
    fontSize: 10,
    fontWeight: '700'
  },
  row: {
    alignItems: 'flex-start',
    borderBottomColor: mobileColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingBottom: 8
  },
  rowLabel: {
    color: mobileColors.muted,
    flex: 1,
    fontSize: 11,
    lineHeight: 16
  },
  rowValue: {
    color: mobileColors.foreground,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'right'
  },
  subtitle: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  title: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  }
})
