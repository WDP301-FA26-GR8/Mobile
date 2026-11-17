import { Feather } from '@expo/vector-icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import { BudgetSnapshotCard } from './budget-snapshot-card'
import type { SpendingApproval } from '../model/spending-approvals'

type DecisionSheet = 'override' | 'reject' | undefined

interface SpendingApprovalDetailsProps {
  onApprove: (reason?: string) => void
  onBack: () => void
  onReject: (reason: string) => void
  request: SpendingApproval
}

export function SpendingApprovalDetails({ onApprove, onBack, onReject, request }: SpendingApprovalDetailsProps) {
  const { i18n, t } = useTranslation()
  const [decisionSheet, setDecisionSheet] = useState<DecisionSheet>()
  const [reason, setReason] = useState('')
  const slaCopy =
    request.slaHoursRemaining >= 24
      ? t('spending.slaRemainingDays', {
          days: Math.floor(request.slaHoursRemaining / 24),
          hours: request.slaHoursRemaining % 24
        })
      : t('spending.slaRemainingHours', { hours: request.slaHoursRemaining })

  function confirmDecision() {
    const trimmedReason = reason.trim()
    if (trimmedReason.length < 10 || !decisionSheet) return

    if (decisionSheet === 'override') {
      onApprove(trimmedReason)
    } else {
      onReject(trimmedReason)
    }

    setDecisionSheet(undefined)
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <Pressable
          accessibilityLabel={t('spending.backToQueue')}
          accessibilityRole='button'
          onPress={onBack}
          style={styles.backButton}
        >
          <Feather
            accessibilityElementsHidden
            color={mobileColors.primaryInk}
            importantForAccessibility='no'
            name='arrow-left'
            size={17}
          />
          <Text style={styles.backLabel}>{t('spending.backToQueue')}</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.requestId}>{request.id}</Text>
          <Text accessibilityRole='header' style={styles.title}>
            {request.softwareName}
          </Text>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>
              {t(request.step === 'need' ? 'spending.needStep' : 'spending.spendingStep')}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('spending.requestContext')}</Text>
          <InfoRow label={t('spending.department')} value={request.department} />
          <InfoRow label={t('spending.requestId')} value={request.id} />
          <InfoRow
            label={t('spending.annualCostLabel')}
            value={
              request.annualCostVnd === undefined
                ? t('spending.noDemoQuote')
                : t('spending.annualCost', {
                    amount: new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US').format(
                      request.annualCostVnd
                    )
                  })
            }
          />
          {request.budgetPlan ? <InfoRow label={t('spending.budgetPlan')} value={request.budgetPlan} /> : null}
          <InfoRow label={t('spending.slaTitle')} value={slaCopy} />
        </View>

        {request.step === 'spending' ? (
          <BudgetSnapshotCard
            annualCostVnd={request.annualCostVnd}
            budgetPlan={request.budgetPlan}
            financeOpinion={request.financeOpinion}
          />
        ) : null}

        {request.isSelfRequest ? (
          <View style={styles.sodNotice}>
            <Text style={styles.sodTitle}>{t('spending.sodTitle')}</Text>
            <Text style={styles.body}>{t('spending.sodNeedStepNotice')}</Text>
          </View>
        ) : null}

        {request.overrideRequired ? (
          <View style={styles.overrideNotice}>
            <Text style={styles.overrideTitle}>{t('spending.overrideTitle')}</Text>
            <Text style={styles.body}>{t('spending.overrideDescription')}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole='button'
            onPress={() => {
              if (request.overrideRequired) {
                setReason('')
                setDecisionSheet('override')
              } else {
                onApprove()
              }
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryText}>
              {t(request.step === 'need' ? 'spending.approveNeed' : 'spending.approveSpending')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole='button'
            onPress={() => {
              setReason('')
              setDecisionSheet('reject')
            }}
            style={styles.rejectButton}
          >
            <Text style={styles.rejectText}>{t('spending.reject')}</Text>
          </Pressable>
        </View>

        <Text style={styles.demoNote}>{t('spending.demoActionNote')}</Text>
      </ScrollView>

      <Modal
        animationType='slide'
        onRequestClose={() => setDecisionSheet(undefined)}
        presentationStyle='overFullScreen'
        transparent
        visible={decisionSheet !== undefined}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
          <Pressable
            accessibilityLabel={t('spending.closeDecisionSheet')}
            accessibilityRole='button'
            onPress={() => setDecisionSheet(undefined)}
            style={styles.modalBackdrop}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text accessibilityRole='header' style={styles.sheetTitle}>
              {t(decisionSheet === 'override' ? 'spending.overrideReasonTitle' : 'spending.rejectTitle')}
            </Text>
            <Text style={styles.body}>
              {t(decisionSheet === 'override' ? 'spending.overrideReasonDescription' : 'spending.rejectDescription')}
            </Text>
            <TextInput
              accessibilityLabel={t('spending.reasonLabel')}
              maxLength={500}
              multiline
              onChangeText={setReason}
              placeholder={t('spending.reasonPlaceholder')}
              placeholderTextColor={mobileColors.muted}
              style={styles.reasonInput}
              textAlignVertical='top'
              value={reason}
            />
            <Text style={styles.helperText}>{t('spending.reasonLength', { count: reason.trim().length })}</Text>
            <View style={styles.sheetActions}>
              <Pressable
                accessibilityRole='button'
                onPress={() => setDecisionSheet(undefined)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>{t('spending.cancel')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole='button'
                disabled={reason.trim().length < 10}
                onPress={confirmDecision}
                style={[styles.primaryButton, reason.trim().length < 10 && styles.disabledButton]}
              >
                <Text style={styles.primaryText}>
                  {t(decisionSheet === 'override' ? 'spending.confirmOverride' : 'spending.confirmRejection')}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

interface InfoRowProps {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {
    gap: 9
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 7,
    minHeight: 44
  },
  backLabel: {
    color: mobileColors.primaryInk,
    fontSize: 13,
    fontWeight: '600'
  },
  body: {
    color: mobileColors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: mobileColors.border,
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48
  },
  cancelText: {
    color: mobileColors.foreground,
    fontSize: 13,
    fontWeight: '600'
  },
  card: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 15,
    borderWidth: 1,
    gap: 12,
    padding: 14
  },
  content: {
    gap: 13,
    padding: 18,
    paddingBottom: 28
  },
  demoNote: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center'
  },
  disabledButton: {
    opacity: 0.45
  },
  heading: {
    alignItems: 'flex-start',
    gap: 5
  },
  helperText: {
    color: mobileColors.muted,
    fontSize: 11
  },
  infoLabel: {
    color: mobileColors.muted,
    flex: 1,
    fontSize: 12,
    lineHeight: 17
  },
  infoRow: {
    alignItems: 'flex-start',
    borderBottomColor: mobileColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'space-between',
    paddingBottom: 7
  },
  infoValue: {
    color: mobileColors.foreground,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'right'
  },
  modalBackdrop: {
    backgroundColor: 'rgba(36, 28, 24, 0.45)',
    flex: 1
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  overrideNotice: {
    backgroundColor: mobileColors.warningBackground,
    borderRadius: 13,
    gap: 5,
    padding: 13
  },
  overrideTitle: {
    color: mobileColors.warning,
    fontSize: 13,
    fontWeight: '700'
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: mobileColors.primary,
    borderRadius: 11,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12
  },
  primaryText: {
    color: mobileColors.white,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center'
  },
  reasonInput: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 11,
    borderWidth: 1,
    color: mobileColors.foreground,
    fontSize: 16,
    minHeight: 96,
    padding: 12
  },
  rejectButton: {
    alignItems: 'center',
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.danger,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14
  },
  rejectText: {
    color: mobileColors.danger,
    fontSize: 13,
    fontWeight: '700'
  },
  requestId: {
    color: mobileColors.primaryInk,
    fontSize: 11,
    fontWeight: '700'
  },
  screen: {
    flex: 1
  },
  sectionTitle: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  sheet: {
    backgroundColor: mobileColors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    gap: 11,
    maxHeight: '90%',
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 10
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 3
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: mobileColors.border,
    borderRadius: 3,
    height: 5,
    marginBottom: 4,
    width: 36
  },
  sheetTitle: {
    color: mobileColors.foreground,
    fontSize: 18,
    fontWeight: '700'
  },
  sodNotice: {
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 13,
    gap: 5,
    padding: 13
  },
  sodTitle: {
    color: mobileColors.primaryInk,
    fontSize: 13,
    fontWeight: '700'
  },
  stepBadge: {
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  stepText: {
    color: mobileColors.primaryInk,
    fontSize: 11,
    fontWeight: '700'
  },
  title: {
    color: mobileColors.foreground,
    fontSize: 23,
    fontWeight: '700'
  }
})
