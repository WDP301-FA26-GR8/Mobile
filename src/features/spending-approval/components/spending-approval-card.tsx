import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import type { SpendingApproval } from '../model/spending-approvals'

interface SpendingApprovalCardProps {
  onPress: (request: SpendingApproval) => void
  request: SpendingApproval
}

export function SpendingApprovalCard({ onPress, request }: SpendingApprovalCardProps) {
  const { i18n, t } = useTranslation()
  const slaCopy =
    request.slaHoursRemaining >= 24
      ? t('spending.slaRemainingDays', {
          days: Math.floor(request.slaHoursRemaining / 24),
          hours: request.slaHoursRemaining % 24
        })
      : t('spending.slaRemainingHours', { hours: request.slaHoursRemaining })

  return (
    <Pressable
      accessibilityLabel={t('spending.openRequest', { id: request.id, software: request.softwareName })}
      accessibilityRole='button'
      onPress={() => onPress(request)}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.softwareMark}>
          <Text style={styles.softwareInitial}>{request.softwareName[0]}</Text>
        </View>
        <View style={styles.softwareCopy}>
          <Text style={styles.softwareName}>{request.softwareName}</Text>
          <Text style={styles.requestId}>{request.id}</Text>
        </View>
        <Feather
          accessibilityElementsHidden
          color={mobileColors.muted}
          importantForAccessibility='no'
          name='chevron-right'
          size={18}
        />
      </View>

      <View style={styles.tags}>
        <View style={[styles.tag, request.step === 'need' && styles.needTag]}>
          <Text style={[styles.tagText, request.step === 'need' && styles.needTagText]}>
            {t(request.step === 'need' ? 'spending.needStep' : 'spending.spendingStep')}
          </Text>
        </View>
        {request.isSelfRequest ? (
          <View style={styles.sodTag}>
            <Text style={styles.sodText}>{t('spending.sodTag')}</Text>
          </View>
        ) : null}
        {request.overrideRequired ? (
          <View style={styles.overrideTag}>
            <Text style={styles.overrideText}>{t('spending.overrideRequired')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.department}>{request.department}</Text>
        <Text style={styles.sla}>{slaCopy}</Text>
      </View>
      {request.annualCostVnd !== undefined ? (
        <Text style={styles.cost}>
          {t('spending.annualCost', {
            amount: new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US').format(request.annualCostVnd)
          })}
        </Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 15,
    borderWidth: 1,
    gap: 12,
    padding: 14
  },
  cost: {
    color: mobileColors.foreground,
    fontSize: 13,
    fontWeight: '700'
  },
  department: {
    color: mobileColors.muted,
    fontSize: 11,
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  needTag: {
    backgroundColor: mobileColors.primarySoft
  },
  needTagText: {
    color: mobileColors.primaryInk
  },
  overrideTag: {
    backgroundColor: mobileColors.warningBackground,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  overrideText: {
    color: mobileColors.warning,
    fontSize: 10,
    fontWeight: '600'
  },
  requestId: {
    color: mobileColors.muted,
    fontSize: 11,
    marginTop: 2
  },
  sla: {
    color: mobileColors.warning,
    fontSize: 11,
    fontWeight: '600'
  },
  softwareCopy: {
    flex: 1
  },
  softwareInitial: {
    color: mobileColors.primaryInk,
    fontSize: 14,
    fontWeight: '700'
  },
  softwareMark: {
    alignItems: 'center',
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 11,
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  softwareName: {
    color: mobileColors.foreground,
    fontSize: 15,
    fontWeight: '700'
  },
  sodTag: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  sodText: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '700'
  },
  tag: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  tagText: {
    color: mobileColors.muted,
    fontSize: 10,
    fontWeight: '600'
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  }
})
