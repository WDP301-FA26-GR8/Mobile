import { Redirect, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { goBackOr } from '@/shared/lib/go-back-or'

import { useRequests } from '../context/requests-context'
import { canWithdrawRequest, type RequestTimelineEvent } from '../model/employee-requests'

const timelineLabels: Record<RequestTimelineEvent, string> = {
  awaitingExecution: 'requests.timeline.awaitingExecution',
  created: 'requests.timeline.created',
  executionStarted: 'requests.timeline.executionStarted',
  financeReview: 'requests.timeline.financeReview',
  needApproved: 'requests.timeline.needApproved',
  needReviewPending: 'requests.timeline.needReviewPending',
  rejected: 'requests.timeline.rejected',
  spendReviewPending: 'requests.timeline.spendReviewPending',
  spendApproved: 'requests.timeline.spendApproved',
  submittedWeb: 'requests.timeline.submittedWeb',
  withdrawn: 'requests.timeline.withdrawn'
}

interface RequestDetailsScreenProps {
  requestId: string
}

export function RequestDetailsScreen({ requestId }: RequestDetailsScreenProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { requests, withdrawRequest } = useRequests()
  const [confirmingWithdrawal, setConfirmingWithdrawal] = useState(false)
  const [withdrawalError, setWithdrawalError] = useState(false)
  const request = requests.find((item) => item.id === requestId)

  if (!request) return <Redirect href='/my-requests' />

  const currentRequestId = request.id
  function confirmWithdrawal() {
    setWithdrawalError(!withdrawRequest(currentRequestId))
    setConfirmingWithdrawal(false)
  }

  const noticeText = request.notice ? t(`requests.notices.${request.notice}`) : undefined
  const rejectedAt = request.timeline.find((item) => item.event === 'rejected')?.at

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole='button'
          onPress={() => goBackOr(router, '/my-requests')}
          style={styles.backButton}
        >
          <Text style={styles.backLabel}>{t('requests.back')}</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.requestId}>{request.id}</Text>
          <Text accessibilityRole='header' style={styles.title}>
            {request.softwareName}
          </Text>
          <Text style={styles.status}>{t(`requests.status.${request.status}`)}</Text>
          <Text style={styles.duration}>{t('requests.duration', { months: request.durationMonths })}</Text>
        </View>
        {withdrawalError ? <Text accessibilityRole='alert'>{t('common.demoDecisionError')}</Text> : null}

        {noticeText ? (
          <View accessibilityRole='summary' style={styles.notice}>
            <Text style={styles.noticeText}>{noticeText}</Text>
          </View>
        ) : null}

        {(request.rejectionReason === 'adobeBudgetOptimized' || request.decisionReason) && rejectedAt ? (
          <View accessibilityRole='summary' style={styles.notice}>
            <Text style={styles.noticeText}>
              {t(request.rejectedBy === 'spending' ? 'requests.rejectedBySpending' : 'requests.rejectedBy', {
                date: new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                  day: '2-digit',
                  month: '2-digit',
                  timeZone: 'Asia/Ho_Chi_Minh',
                  year: 'numeric'
                }).format(new Date(rejectedAt)),
                name: request.rejectedBy === 'spending' ? t('spending.approverName') : t('requests.managerName')
              })}
            </Text>
            <Text style={styles.reasonText}>
              {request.decisionReason ?? t('requests.rejectionReasons.adobeBudgetOptimized')}
            </Text>
            <Text style={styles.note}>{t('requests.noBudgetCode')}</Text>
          </View>
        ) : null}

        {request.costVnd !== undefined ? (
          <View style={styles.summaryCard}>
            <Text style={styles.fieldLabel}>{t('requests.estimatedCost')}</Text>
            <Text style={styles.fieldValue}>
              {t(request.costPeriod === 'annual' ? 'requests.annualCost' : 'requests.cost', {
                amount: new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US').format(request.costVnd)
              })}
            </Text>
            {request.budgetPlan ? (
              <>
                <Text style={styles.fieldLabel}>{t('requests.planReference')}</Text>
                <Text style={styles.fieldValue}>{request.budgetPlan}</Text>
              </>
            ) : null}
          </View>
        ) : null}

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>{t('requests.timelineTitle')}</Text>
          {request.timeline.map((item, index) => (
            <View key={`${item.event}-${item.at}-${index}`} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={styles.timelineDot} />
                {index < request.timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineLabel}>{t(timelineLabels[item.event])}</Text>
                <Text style={styles.timelineDate}>
                  {new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                    dateStyle: 'medium',
                    timeZone: 'Asia/Ho_Chi_Minh',
                    timeStyle: 'short'
                  }).format(new Date(item.at))}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {canWithdrawRequest(request.status) ? (
          <Pressable
            accessibilityRole='button'
            onPress={() => setConfirmingWithdrawal(true)}
            style={styles.withdrawButton}
          >
            <Text style={styles.withdrawLabel}>{t('requests.withdraw')}</Text>
          </Pressable>
        ) : null}

        {confirmingWithdrawal ? (
          <View accessibilityRole='alert' style={styles.confirmation}>
            <Text style={styles.confirmationTitle}>{t('requests.confirmWithdraw', { id: request.id })}</Text>
            <Text style={styles.note}>{t('requests.withdrawResult')}</Text>
            <View style={styles.confirmationActions}>
              <Pressable accessibilityRole='button' onPress={() => setConfirmingWithdrawal(false)}>
                <Text style={styles.backLabel}>{t('requests.cancel')}</Text>
              </Pressable>
              <Pressable accessibilityRole='button' onPress={confirmWithdrawal} style={styles.confirmButton}>
                <Text style={styles.confirmLabel}>{t('requests.confirm')}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 44
  },
  backLabel: {
    color: '#a33700',
    fontSize: 14,
    fontWeight: '600'
  },
  confirmation: {
    backgroundColor: '#fdf3e7',
    borderColor: '#ffb987',
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  confirmationActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'flex-end'
  },
  confirmationTitle: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '700'
  },
  confirmButton: {
    backgroundColor: '#ff7020',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14
  },
  confirmLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  content: {
    gap: 16,
    padding: 20
  },
  duration: {
    color: '#7c7068',
    fontSize: 13,
    marginTop: 6
  },
  fieldLabel: {
    color: '#7c7068',
    fontSize: 12,
    marginTop: 5
  },
  fieldValue: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '600'
  },
  heading: {
    alignItems: 'center',
    backgroundColor: '#fefbf6',
    borderColor: '#efe3d7',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18
  },
  notice: {
    backgroundColor: '#fff2d6',
    borderRadius: 14,
    padding: 14
  },
  noticeText: {
    color: '#7a4500',
    fontSize: 13,
    lineHeight: 19
  },
  reasonText: {
    color: '#241c18',
    fontSize: 14,
    lineHeight: 20
  },
  note: {
    color: '#7c7068',
    fontSize: 13,
    lineHeight: 19
  },
  requestId: {
    color: '#7c7068',
    fontSize: 12
  },
  safeArea: {
    backgroundColor: '#fef7ef',
    flex: 1
  },
  sectionTitle: {
    color: '#241c18',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8
  },
  status: {
    color: '#a33700',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8
  },
  summaryCard: {
    backgroundColor: '#fefbf6',
    borderColor: '#efe3d7',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 14
  },
  timelineCard: {
    backgroundColor: '#fefbf6',
    borderColor: '#efe3d7',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14
  },
  timelineCopy: {
    flex: 1,
    paddingBottom: 18
  },
  timelineDate: {
    color: '#7c7068',
    fontSize: 11,
    marginTop: 4
  },
  timelineDot: {
    backgroundColor: '#ff7020',
    borderRadius: 5,
    height: 10,
    marginTop: 3,
    width: 10
  },
  timelineLabel: {
    color: '#241c18',
    fontSize: 13,
    fontWeight: '600'
  },
  timelineLine: {
    backgroundColor: '#efe3d7',
    flex: 1,
    marginVertical: 3,
    width: 2
  },
  timelineRail: {
    alignItems: 'center',
    marginRight: 10,
    width: 12
  },
  timelineRow: {
    flexDirection: 'row'
  },
  title: {
    color: '#241c18',
    fontSize: 23,
    fontWeight: '700',
    marginTop: 8
  },
  withdrawButton: {
    alignItems: 'center',
    borderColor: '#c95f32',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46
  },
  withdrawLabel: {
    color: '#a33700',
    fontSize: 14,
    fontWeight: '700'
  }
})
