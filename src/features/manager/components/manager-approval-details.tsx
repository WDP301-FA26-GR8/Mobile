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

import type { ManagerApproval } from '../model/manager-approvals'

interface ManagerApprovalDetailsProps {
  onApprove: () => void
  onBack: () => void
  onReject: (reason: string) => void
  request: ManagerApproval
}

const rejectionReasonKeys = [
  'manager.rejectionSuggestions.standardAlternative',
  'manager.rejectionSuggestions.projectTiming',
  'manager.rejectionSuggestions.cost'
] as const

export function ManagerApprovalDetails({ onApprove, onBack, onReject, request }: ManagerApprovalDetailsProps) {
  const { t } = useTranslation()
  const [confirmingLongTerm, setConfirmingLongTerm] = useState(false)
  const [longTermConfirmed, setLongTermConfirmed] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const slaCopy =
    request.slaHoursRemaining === undefined
      ? t('manager.slaUnavailable')
      : request.slaHoursRemaining >= 24
        ? t('manager.slaRemainingDays', {
            days: Math.floor(request.slaHoursRemaining / 24),
            hours: request.slaHoursRemaining % 24
          })
        : t('manager.slaRemainingHours', { hours: request.slaHoursRemaining })

  function beginApproval() {
    if (request.durationMonths > 12) {
      setConfirmingLongTerm(true)
    } else {
      onApprove()
    }
  }

  function confirmRejection() {
    const reason = rejectionReason.trim()
    if (reason.length < 10) return
    onReject(reason)
    setRejecting(false)
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <Pressable
          accessibilityLabel={t('manager.backToQueue')}
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
          <Text style={styles.backLabel}>{t('manager.backToQueue')}</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.requestId}>{request.id}</Text>
          <Text accessibilityRole='header' style={styles.title}>
            {request.softwareName}
          </Text>
          <Text style={styles.subtitle}>{t('manager.detailSubtitle')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('manager.requesterTitle')}</Text>
          <View style={styles.personRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {request.requesterName
                  .split(' ')
                  .slice(-2)
                  .map((part) => part[0])
                  .join('')}
              </Text>
            </View>
            <View style={styles.personCopy}>
              <Text style={styles.personName}>{request.requesterName}</Text>
              <Text style={styles.mutedText}>{request.requesterRole}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('manager.department')}</Text>
            <Text style={styles.value}>{request.department}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('manager.durationLabel')}</Text>
            <Text style={styles.value}>{t('manager.duration', { months: request.durationMonths })}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('manager.budgetLink')}</Text>
            <Text style={styles.value}>
              {request.budgetPlanUnknown
                ? t('manager.planUnavailable')
                : request.budgetPlan
                  ? t('manager.plannedBudget', { plan: request.budgetPlan })
                  : t('manager.unplannedBudget')}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('manager.businessReason')}</Text>
          <Text style={styles.body}>
            {request.reason || (request.reasonKey ? t(request.reasonKey) : t('manager.reasonUnavailable'))}
          </Text>
          {request.isStandard === false ? (
            <View style={styles.warning}>
              <Text style={styles.warningText}>{t('manager.outsideStandardDetail')}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{t('manager.slaTitle')}</Text>
          <Text style={styles.body}>{slaCopy}</Text>
        </View>

        {request.durationMonths > 12 ? (
          <View style={styles.longTermNotice}>
            <Text style={styles.longTermTitle}>{t('manager.longTermNoticeTitle')}</Text>
            <Text style={styles.body}>{t('manager.longTermNoticeBody')}</Text>
          </View>
        ) : null}

        {confirmingLongTerm ? (
          <View style={styles.confirmation}>
            <Pressable
              accessibilityRole='checkbox'
              accessibilityState={{ checked: longTermConfirmed }}
              onPress={() => setLongTermConfirmed((checked) => !checked)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, longTermConfirmed && styles.checkboxChecked]}>
                {longTermConfirmed ? (
                  <Feather
                    accessibilityElementsHidden
                    color={mobileColors.white}
                    importantForAccessibility='no'
                    name='check'
                    size={14}
                  />
                ) : null}
              </View>
              <Text style={styles.checkboxLabel}>{t('manager.longTermConfirmation')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole='button'
              disabled={!longTermConfirmed}
              onPress={onApprove}
              style={[styles.primaryButton, !longTermConfirmed && styles.disabledButton]}
            >
              <Text style={styles.primaryButtonText}>{t('manager.confirmApproval')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actions}>
            <Pressable accessibilityRole='button' onPress={beginApproval} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{t('manager.approveNeed')}</Text>
            </Pressable>
            <Pressable accessibilityRole='button' onPress={() => setRejecting(true)} style={styles.rejectButton}>
              <Text style={styles.rejectButtonText}>{t('manager.reject')}</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.footerNote}>{t('manager.demoActionNote')}</Text>
      </ScrollView>

      <Modal
        animationType='slide'
        onRequestClose={() => setRejecting(false)}
        presentationStyle='overFullScreen'
        transparent
        visible={rejecting}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
          <Pressable
            accessibilityLabel={t('manager.closeRejectSheet')}
            accessibilityRole='button'
            onPress={() => setRejecting(false)}
            style={styles.modalBackdrop}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text accessibilityRole='header' style={styles.sheetTitle}>
              {t('manager.rejectTitle')}
            </Text>
            <Text style={styles.body}>{t('manager.rejectDescription')}</Text>
            <TextInput
              accessibilityLabel={t('manager.rejectReasonLabel')}
              maxLength={500}
              multiline
              onChangeText={setRejectionReason}
              placeholder={t('manager.rejectReasonPlaceholder')}
              placeholderTextColor={mobileColors.muted}
              style={styles.reasonInput}
              textAlignVertical='top'
              value={rejectionReason}
            />
            <Text style={styles.helperText}>
              {t('manager.rejectReasonLength', { count: rejectionReason.trim().length })}
            </Text>
            <Text style={styles.suggestionsTitle}>{t('manager.suggestionsTitle')}</Text>
            <View style={styles.suggestions}>
              {rejectionReasonKeys.map((key) => (
                <Pressable key={key} onPress={() => setRejectionReason(t(key))} style={styles.suggestion}>
                  <Text style={styles.suggestionText}>{t(key)}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.sheetActions}>
              <Pressable accessibilityRole='button' onPress={() => setRejecting(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>{t('manager.cancel')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole='button'
                disabled={rejectionReason.trim().length < 10}
                onPress={confirmRejection}
                style={[styles.rejectButton, rejectionReason.trim().length < 10 && styles.disabledButton]}
              >
                <Text style={styles.rejectButtonText}>{t('manager.confirmRejection')}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {
    gap: 9
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38
  },
  avatarText: {
    color: mobileColors.primaryInk,
    fontSize: 12,
    fontWeight: '700'
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
  cancelButtonText: {
    color: mobileColors.foreground,
    fontSize: 13,
    fontWeight: '600'
  },
  card: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 15,
    borderWidth: 1,
    gap: 13,
    padding: 15
  },
  checkbox: {
    alignItems: 'center',
    borderColor: mobileColors.border,
    borderRadius: 5,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22
  },
  checkboxChecked: {
    backgroundColor: mobileColors.primary,
    borderColor: mobileColors.primary
  },
  checkboxLabel: {
    color: mobileColors.foreground,
    flex: 1,
    fontSize: 13,
    lineHeight: 19
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 44
  },
  confirmation: {
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
  detailRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between'
  },
  disabledButton: {
    opacity: 0.45
  },
  footerNote: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center'
  },
  heading: {
    gap: 4
  },
  helperText: {
    color: mobileColors.muted,
    fontSize: 11
  },
  label: {
    color: mobileColors.muted,
    flex: 1,
    fontSize: 12
  },
  longTermNotice: {
    backgroundColor: mobileColors.warningBackground,
    borderColor: mobileColors.warningBackground,
    borderRadius: 13,
    borderWidth: 1,
    gap: 5,
    padding: 13
  },
  longTermTitle: {
    color: mobileColors.warning,
    fontSize: 13,
    fontWeight: '700'
  },
  modalBackdrop: {
    backgroundColor: 'rgba(36, 28, 24, 0.45)',
    flex: 1
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  mutedText: {
    color: mobileColors.muted,
    fontSize: 11
  },
  notice: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 13,
    gap: 5,
    padding: 13
  },
  noticeTitle: {
    color: mobileColors.foreground,
    fontSize: 13,
    fontWeight: '700'
  },
  personCopy: {
    flex: 1,
    gap: 2
  },
  personName: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  personRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: mobileColors.primary,
    borderRadius: 11,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 15
  },
  primaryButtonText: {
    color: mobileColors.white,
    fontSize: 14,
    fontWeight: '700'
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
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14
  },
  rejectButtonText: {
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
  suggestions: {
    gap: 7
  },
  suggestionsTitle: {
    color: mobileColors.foreground,
    fontSize: 12,
    fontWeight: '700'
  },
  suggestion: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 9
  },
  suggestionText: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  subtitle: {
    color: mobileColors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  title: {
    color: mobileColors.foreground,
    fontSize: 23,
    fontWeight: '700'
  },
  value: {
    color: mobileColors.foreground,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right'
  },
  warning: {
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 9,
    padding: 10
  },
  warningText: {
    color: mobileColors.primaryInk,
    fontSize: 12,
    lineHeight: 18
  }
})
