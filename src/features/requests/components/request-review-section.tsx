import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import type { CatalogSoftware } from '../model/employee-requests'

interface RequestReviewSectionProps {
  durationMonths: 12 | 18
  reason: string
  software: CatalogSoftware
}

export function RequestReviewSection({ durationMonths, reason, software }: RequestReviewSectionProps) {
  const { t } = useTranslation()

  return (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('requests.summaryTitle')}</Text>
        <View style={styles.summaryList}>
          <SummaryRow label={t('requests.selectedTool')} value={software.name} />
          <SummaryRow label={t('requests.durationLabel')} value={t('requests.duration', { months: durationMonths })} />
          <SummaryRow label={t('requests.requestFor')} value={t('requests.personalAccess')} />
          {reason.trim() ? <SummaryRow label={t('requests.reasonLabel')} value={reason.trim()} /> : null}
          <SummaryRow label={t('requests.estimatedCost')} value={t('requests.noDemoQuote')} />
        </View>
      </View>

      {durationMonths > 12 ? (
        <View accessibilityRole='summary' style={styles.warning}>
          <Feather
            accessibilityElementsHidden
            color={mobileColors.warning}
            importantForAccessibility='no'
            name='alert-triangle'
            size={16}
          />
          <Text style={styles.warningText}>{t('requests.longTermWarning')}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('requests.possibleStepsTitle')}</Text>
        <Text style={styles.sectionHint}>{t('requests.possibleSteps')}</Text>
        <Text style={styles.webNote}>{t('requests.noMobileBatch')}</Text>
      </View>
    </View>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 14
  },
  section: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
    padding: 15
  },
  sectionHint: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  sectionTitle: {
    color: mobileColors.foreground,
    fontSize: 15,
    fontWeight: '700'
  },
  summaryLabel: {
    color: mobileColors.muted,
    flexShrink: 1,
    fontSize: 12
  },
  summaryList: {
    marginTop: 2
  },
  summaryRow: {
    alignItems: 'center',
    borderBottomColor: mobileColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  summaryValue: {
    color: mobileColors.foreground,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right'
  },
  warning: {
    alignItems: 'flex-start',
    backgroundColor: mobileColors.warningBackground,
    borderColor: '#f3d9a7',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    padding: 12
  },
  warningText: {
    color: mobileColors.warning,
    flex: 1,
    fontSize: 12,
    lineHeight: 18
  },
  webNote: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 8,
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18,
    padding: 11
  }
})
