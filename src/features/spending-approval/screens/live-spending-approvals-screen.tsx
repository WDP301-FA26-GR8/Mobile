import { Feather } from '@expo/vector-icons'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Redirect, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import type {
  ApprovalDetailResponseDtoDataSpendApproval,
  LineSpendDecisionBodyDto,
  SpendDecisionBodyDto
} from '@/shared/api/generated/contracts'
import type { LinesResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/group-requests'
import type { PolicyStepResponseDtoDataStepChecklistItem } from '@/shared/api/generated/contracts/policies'
import { useSession } from '@/shared/api/session-context'
import { useAccountProfile } from '@/shared/api/use-account-profile'
import { LiveInboxScreen } from '@/features/inbox'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { EmployeeProfileHeader } from '@/shared/ui/employee-profile-header'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'
import { ThemeSwitch } from '@/shared/ui/theme-switch'

import { LiveSpendingApprovalCard } from '../components/live-spending-approval-card'
import { LiveSpendingBudgetSnapshot } from '../components/live-spending-budget-snapshot'
import { useLiveSpendingApprovals } from '../hooks/use-live-spending-approvals'
import {
  filterSpendApprovals,
  formatSpendDate,
  formatSpendMoney,
  pendingSpendApprovalLines,
  spendDecisionErrorCode,
  type SpendDecision
} from '../model/live-spending-approvals'

type ActiveTab = 'queue' | 'inbox'
type ChecklistAnswers = Record<string, 'YES' | 'NO'>

export function LiveSpendingApprovalsScreen({ requestId }: { requestId?: string }) {
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const session = useSession()
  const profile = useAccountProfile()
  const account = profile.data
  const isApprover = account?.roles.length === 1 && account.roles[0] === 'SPENDING_APPROVER'
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<ActiveTab>('queue')
  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const [notificationUnavailable, setNotificationUnavailable] = useState(false)
  const [notificationLookupError, setNotificationLookupError] = useState(false)
  const [decision, setDecision] = useState<SpendDecision>()
  const [answers, setAnswers] = useState<ChecklistAnswers>({})
  const [reason, setReason] = useState('')
  const [lineDecisions, setLineDecisions] = useState<Record<string, 'APPROVE' | 'REJECT'>>({})
  const handledNotification = useRef<string | undefined>(undefined)
  const submissionStarted = useRef(false)
  const live = useLiveSpendingApprovals(page, requestId, !!isApprover, selectedRequestId)
  const { queue, notificationItem, detail, lines, policy, decide, decideLines } = live
  const { reset: resetIndividualDecision } = decide
  const { reset: resetGroupDecision } = decideLines

  useEffect(() => {
    if (!requestId) {
      handledNotification.current = undefined
      return
    }
    if (handledNotification.current === requestId || notificationItem.isPending) return
    if (notificationItem.isError) {
      setNotificationLookupError(true)
      return
    }
    if (!notificationItem.isSuccess) return

    handledNotification.current = requestId
    setNotificationLookupError(false)
    if (notificationItem.data) {
      resetIndividualDecision()
      resetGroupDecision()
      submissionStarted.current = false
      setDecision(undefined)
      setAnswers({})
      setReason('')
      setLineDecisions({})
      setNotificationUnavailable(false)
      setSelectedRequestId(requestId)
    } else {
      setNotificationUnavailable(true)
    }
  }, [
    notificationItem.data,
    notificationItem.isError,
    notificationItem.isPending,
    notificationItem.isSuccess,
    resetGroupDecision,
    resetIndividualDecision,
    requestId
  ])

  const items = queue.data?.items
  const filteredItems = useMemo(() => filterSpendApprovals(items ?? [], search), [items, search])
  const selectedItem =
    (notificationItem.data?.requestId === selectedRequestId ? notificationItem.data : undefined) ??
    items?.find((item) => item.requestId === selectedRequestId)
  const dueOn = formatSpendDate(selectedItem?.dueOn, i18n.language)
  const approval = detail.data
  const checklist = policy.data?.step.checklist ?? []
  const checklistReady = !!policy.data && !policy.isPending && !policy.isFetching && !policy.isError
  const hasNoAnswer = checklist.some((item) => item.check === 'PERSON' && answers[item.code] === 'NO')
  const checklistComplete = checklist.every((item) => item.check === 'SYSTEM' || answers[item.code] !== undefined)
  const groupedLines = useMemo(() => pendingSpendApprovalLines(lines.data ?? []), [lines.data])
  const groupedLinesReady = !lines.isPending && !lines.isFetching && !lines.isError && groupedLines.length > 0
  const allLinesChosen =
    groupedLines.length > 0 && groupedLines.every((line) => lineDecisions[line.employee.employeeId])
  const effectiveDecision = decision
  const request = approval?.request
  const isGroup = (request?.lineCount ?? 0) > 1
  const mutationError = isGroup ? decideLines.error : decide.error
  const mutationPending = isGroup ? decideLines.isPending : decide.isPending
  const result = isGroup ? decideLines.data : decide.data
  const submissionLocked = !!mutationError || !!result
  const hasRejectedLine = groupedLines.some((line) => lineDecisions[line.employee.employeeId] === 'REJECT')
  const hasApprovedLine = groupedLines.some((line) => lineDecisions[line.employee.employeeId] === 'APPROVE')
  const requiresReason = isGroup
    ? effectiveDecision === 'RETURN' || hasRejectedLine
    : !!effectiveDecision && effectiveDecision !== 'APPROVE'
  const reasonNeeded = requiresReason && !hasNoAnswer && reason.trim().length === 0
  const approvalBlocked = hasNoAnswer && (isGroup ? hasApprovedLine : effectiveDecision === 'APPROVE')
  const canConfirm =
    !!effectiveDecision &&
    checklistReady &&
    checklistComplete &&
    !approvalBlocked &&
    !reasonNeeded &&
    (!isGroup || (groupedLinesReady && (effectiveDecision === 'RETURN' || allLinesChosen))) &&
    !mutationPending &&
    !submissionLocked

  function resetDecision() {
    setDecision(undefined)
    setAnswers({})
    setReason('')
    setLineDecisions({})
  }

  function openRequest(id: string) {
    resetDecision()
    decide.reset()
    decideLines.reset()
    submissionStarted.current = false
    setNotificationUnavailable(false)
    setSelectedRequestId(id)
  }

  function closeRequest() {
    resetDecision()
    decide.reset()
    decideLines.reset()
    submissionStarted.current = false
    setSelectedRequestId(undefined)
    void queue.refetch()
  }

  function setAnswer(code: string, answer: 'YES' | 'NO') {
    setAnswers((current) => ({ ...current, [code]: answer }))
  }

  function checklistBody() {
    if (!policy.data) throw new Error('Spending checklist is unavailable')
    return {
      policyVersionId: policy.data.policyVersionId,
      answers: checklist.map((item) => {
        const answer = item.check === 'SYSTEM' ? 'YES' : answers[item.code]
        if (!answer) throw new Error('Incomplete spending approval checklist')
        return { itemCode: item.code, answer }
      })
    }
  }

  function submitDecision() {
    if (!selectedRequestId || !canConfirm || !effectiveDecision || submissionStarted.current) return
    if (isGroup) {
      if (!groupedLinesReady || !request || (effectiveDecision !== 'RETURN' && !allLinesChosen)) return
      const body: LineSpendDecisionBodyDto = {
        lines: groupedLines.map((line) => {
          const lineDecision = effectiveDecision === 'RETURN' ? 'RETURN' : lineDecisions[line.employee.employeeId]
          if (!lineDecision) throw new Error('Incomplete grouped spending decision')
          return {
            employeeId: line.employee.employeeId,
            decision: lineDecision,
            ...(lineDecision !== 'APPROVE' && reason.trim() ? { reason: reason.trim() } : {})
          }
        }),
        checklist: checklistBody()
      }
      submissionStarted.current = true
      decideLines.mutate({ id: selectedRequestId, body })
      return
    }
    if (!effectiveDecision) return
    const body: SpendDecisionBodyDto = {
      decision: effectiveDecision,
      checklist: checklistBody(),
      ...(effectiveDecision !== 'APPROVE' && reason.trim() ? { reason: reason.trim() } : {})
    }
    submissionStarted.current = true
    decide.mutate({ id: selectedRequestId, body })
  }

  if (session.state === 'anonymous') return <Redirect href='/' />
  if (session.state === 'authenticated' && account && !isApprover) return <Redirect href='/home' />

  const tabs = (
    <MobileTabBar
      accessibilityLabel={t('navigation.tabs')}
      tabs={[
        {
          accessibilityLabel: t('navigation.openTab', { tab: t('spending.live.tabs.queue') }),
          icon: 'check-square',
          id: 'spending-queue',
          label: t('spending.live.tabs.queue'),
          onPress: () => setActiveTab('queue'),
          selected: activeTab === 'queue'
        },
        {
          accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
          icon: 'bell',
          id: 'spending-inbox',
          label: t('navigation.inbox'),
          onPress: () => setActiveTab('inbox'),
          selected: activeTab === 'inbox'
        }
      ]}
    />
  )

  if (activeTab === 'inbox') return <LiveInboxScreen navigation={tabs} />

  const appName =
    approval?.request.plan?.applicationName ?? approval?.request.softwareName ?? t('spending.live.unnamed')
  const planName = approval?.request.plan?.planName
  const errorCode = spendDecisionErrorCode(mutationError)
  const mutationErrorKey = getMutationErrorKey(errorCode)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
          <View style={styles.header}>
            <View style={styles.profile}>
              {account ? (
                <EmployeeProfileHeader
                  initials={account.employee.fullName.trim().slice(0, 1).toLocaleUpperCase()}
                  meta={account.employee.department?.name ?? t('licenses.live.noDepartment')}
                  name={account.employee.fullName}
                  onOpenProfile={() => router.push('/profile')}
                />
              ) : null}
            </View>
            <ThemeSwitch />
          </View>

          {profile.isError ? (
            <View style={styles.notice}>
              <Text accessibilityRole='alert' style={styles.bodyText}>
                {t('spending.live.profileError')}
              </Text>
              <ActionButton label={t('account.retry')} onPress={() => void profile.refetch()} />
            </View>
          ) : !account ? (
            <Text accessibilityRole='progressbar' style={styles.muted}>
              {t('account.loading')}
            </Text>
          ) : null}

          {profile.isError || !account || !isApprover ? null : selectedRequestId ? (
            <View style={styles.section}>
              <ActionButton label={t('spending.live.backToQueue')} onPress={closeRequest} />
              {result ? (
                <View accessibilityRole='alert' style={styles.successCard}>
                  <Text style={styles.successText}>{t('spending.live.decisionSucceeded')}</Text>
                  <ActionButton label={t('spending.live.backToQueue')} onPress={closeRequest} />
                </View>
              ) : mutationError ? (
                <View style={styles.errorCard}>
                  <Text accessibilityRole='alert' style={styles.errorText}>
                    {t(mutationErrorKey)}
                  </Text>
                  {errorCode === 'POLICY.VERSION_CHANGED' || errorCode === 'POLICY.NOT_IN_FORCE' ? (
                    <ActionButton
                      label={t('spending.live.reloadPolicy')}
                      onPress={() => {
                        resetDecision()
                        if (isGroup) decideLines.reset()
                        else decide.reset()
                        submissionStarted.current = false
                        void policy.refetch()
                        void detail.refetch()
                        void lines.refetch()
                      }}
                    />
                  ) : (
                    <ActionButton label={t('spending.live.backToQueue')} onPress={closeRequest} />
                  )}
                </View>
              ) : detail.isPending || detail.isFetching ? (
                <Text accessibilityRole='progressbar' style={styles.muted}>
                  {t('spending.live.detailLoading')}
                </Text>
              ) : detail.isError || !approval ? (
                <View style={styles.notice}>
                  <Text accessibilityRole='alert' style={styles.bodyText}>
                    {t('spending.live.detailError')}
                  </Text>
                  <ActionButton label={t('account.retry')} onPress={() => void detail.refetch()} />
                </View>
              ) : (
                <>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewIcon}>
                      <Feather
                        accessibilityElementsHidden
                        color={colors.primaryInk}
                        importantForAccessibility='no'
                        name='credit-card'
                        size={20}
                      />
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.kicker}>{t('spending.live.detailTitle')}</Text>
                      <Text accessibilityRole='header' style={styles.title}>
                        {appName}
                      </Text>
                      {planName ? <Text style={styles.muted}>{planName}</Text> : null}
                    </View>
                  </View>
                  <ApprovalSummary
                    approval={approval}
                    dueOn={dueOn}
                    locale={i18n.language}
                    onFormatUnavailable={t('spending.live.amountUnavailable')}
                  />
                  <LiveSpendingBudgetSnapshot approval={approval} />
                  {approval.termCost ? (
                    <InfoCard title={t('spending.live.termCostTitle')}>
                      <InfoRow
                        label={t('spending.live.currentYearCost', { year: approval.termCost.currentYear.year })}
                        value={
                          formatSpendMoney(approval.termCost.currentYear.amount, i18n.language) ??
                          t('spending.live.amountUnavailable')
                        }
                      />
                      {approval.termCost.nextYear ? (
                        <InfoRow
                          label={t('spending.live.nextYearCost')}
                          value={
                            formatSpendMoney(approval.termCost.nextYear.amount, i18n.language) ??
                            t('spending.live.amountUnavailable')
                          }
                        />
                      ) : null}
                      {approval.termCost.termCutAt ? (
                        <InfoRow
                          label={t('spending.live.termCutAt')}
                          value={
                            formatSpendDate(approval.termCost.termCutAt, i18n.language) ??
                            t('spending.live.notAvailable')
                          }
                        />
                      ) : null}
                    </InfoCard>
                  ) : null}
                  {approval.assessment ? (
                    <InfoCard title={t('spending.live.assessmentTitle')}>
                      {approval.assessment.classification ? (
                        <InfoRow
                          label={t('spending.live.classification')}
                          value={t(
                            approval.assessment.classification === 'INTERNAL'
                              ? 'spending.live.classifications.internal'
                              : 'spending.live.classifications.paidLicensed'
                          )}
                        />
                      ) : null}
                      {approval.assessment.controlLevel ? (
                        <InfoRow
                          label={t('spending.live.controlLevel')}
                          value={t(`spending.live.controlLevels.${approval.assessment.controlLevel}`)}
                        />
                      ) : null}
                      {approval.assessment.dataSensitivity ? (
                        <InfoRow
                          label={t('spending.live.dataSensitivity')}
                          value={approval.assessment.dataSensitivity}
                        />
                      ) : null}
                      {approval.assessment.controlRiskNote ? (
                        <InfoRow label={t('spending.live.controlRisk')} value={approval.assessment.controlRiskNote} />
                      ) : null}
                      {approval.assessment.equivalentTool ? (
                        <InfoRow
                          label={t('spending.live.equivalentTool')}
                          value={approval.assessment.equivalentTool.planName}
                        />
                      ) : null}
                    </InfoCard>
                  ) : null}
                  {isGroup ? (
                    <GroupLines
                      decisionError={lines.isError}
                      decisions={lineDecisions}
                      hasNoAnswer={hasNoAnswer}
                      items={groupedLines}
                      onChoose={(employeeId, nextDecision) =>
                        setLineDecisions((current) => ({ ...current, [employeeId]: nextDecision }))
                      }
                      onRetry={() => void lines.refetch()}
                      loading={lines.isPending || lines.isFetching}
                    />
                  ) : null}
                  <DecisionForm
                    answers={answers}
                    canConfirm={canConfirm}
                    checklist={checklist}
                    checklistComplete={checklistComplete}
                    checklistError={policy.isError}
                    checklistLoading={policy.isPending || policy.isFetching}
                    decision={decision}
                    hasRejectedLine={hasRejectedLine}
                    hasNoAnswer={hasNoAnswer}
                    isGroup={isGroup}
                    loading={mutationPending}
                    onAnswer={setAnswer}
                    onChooseDecision={setDecision}
                    onReasonChange={setReason}
                    onRetryChecklist={() => void policy.refetch()}
                    onSubmit={submitDecision}
                    reason={reason}
                    reasonNeeded={reasonNeeded}
                  />
                </>
              )}
            </View>
          ) : (
            <>
              <View style={styles.hero}>
                <Text style={styles.kicker}>{t('spending.live.kicker')}</Text>
                <Text accessibilityRole='header' style={styles.title}>
                  {t('spending.live.title')}
                </Text>
                <Text style={styles.muted}>{t('spending.live.subtitle')}</Text>
              </View>
              {notificationLookupError ? (
                <View style={styles.notice}>
                  <Text accessibilityRole='alert' style={styles.bodyText}>
                    {t('spending.live.notificationError')}
                  </Text>
                  <ActionButton
                    label={t('account.retry')}
                    onPress={() => {
                      setNotificationLookupError(false)
                      void notificationItem.refetch()
                    }}
                  />
                </View>
              ) : notificationUnavailable ? (
                <Text accessibilityRole='alert' style={styles.noticeText}>
                  {t('spending.live.notificationUnavailable')}
                </Text>
              ) : null}
              {queue.isError ? (
                <View style={styles.notice}>
                  <Text accessibilityRole='alert' style={styles.bodyText}>
                    {t('spending.live.queueError')}
                  </Text>
                  <ActionButton label={t('account.retry')} onPress={() => void queue.refetch()} />
                </View>
              ) : null}
              <View style={styles.queueHeader}>
                <View style={styles.flex}>
                  <Text style={styles.sectionTitle}>{t('spending.live.queueTitle')}</Text>
                  <Text style={styles.muted}>
                    {queue.data
                      ? t('spending.live.queueCount', {
                          count: queue.data.pagination.totalItems,
                          formattedCount: new Intl.NumberFormat(i18n.language).format(queue.data.pagination.totalItems)
                        })
                      : t('spending.live.assignedOnly')}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel={t('spending.live.refreshQueue')}
                  accessibilityState={{ busy: queue.isFetching }}
                  disabled={queue.isFetching}
                  onPress={() => void queue.refetch()}
                  style={styles.iconButton}
                >
                  <Feather
                    accessibilityElementsHidden
                    color={colors.primaryInk}
                    importantForAccessibility='no'
                    name='refresh-cw'
                    size={17}
                  />
                </Pressable>
              </View>
              <View style={styles.search}>
                <Feather
                  accessibilityElementsHidden
                  color={colors.muted}
                  importantForAccessibility='no'
                  name='search'
                  size={17}
                />
                <TextInput
                  accessibilityLabel={t('spending.live.searchLabel')}
                  onChangeText={setSearch}
                  placeholder={t('spending.live.searchPlaceholder')}
                  placeholderTextColor={colors.muted}
                  returnKeyType='search'
                  style={styles.searchInput}
                  value={search}
                />
              </View>
              {queue.isPending ? (
                <Text accessibilityRole='progressbar' style={styles.muted}>
                  {t('spending.live.queueLoading')}
                </Text>
              ) : filteredItems.length ? (
                <View style={styles.list}>
                  {filteredItems.map((item) => (
                    <LiveSpendingApprovalCard key={item.requestId} item={item} onPress={openRequest} />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Feather
                    accessibilityElementsHidden
                    color={colors.muted}
                    importantForAccessibility='no'
                    name={search ? 'search' : 'check-circle'}
                    size={24}
                  />
                  <Text style={styles.emptyTitle}>
                    {search ? t('spending.live.emptySearch') : t('spending.live.emptyQueue')}
                  </Text>
                  <Text style={styles.muted}>
                    {search ? t('spending.live.emptySearchHint') : t('spending.live.emptyQueueHint')}
                  </Text>
                </View>
              )}
              {queue.data ? (
                <View style={styles.pagination}>
                  <ActionButton
                    disabled={page <= 1 || queue.isFetching}
                    label={t('spending.live.previousPage')}
                    onPress={() => setPage((current) => Math.max(1, current - 1))}
                  />
                  <Text style={styles.muted}>
                    {t('spending.live.page', {
                      page: queue.data.pagination.page,
                      totalPages: queue.data.pagination.totalPages
                    })}
                  </Text>
                  <ActionButton
                    disabled={page >= queue.data.pagination.totalPages || queue.isFetching}
                    label={t('spending.live.nextPage')}
                    onPress={() => setPage((current) => current + 1)}
                  />
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
        {tabs}
      </View>
    </SafeAreaView>
  )
}

function ApprovalSummary({
  approval,
  dueOn,
  locale,
  onFormatUnavailable
}: {
  approval: ApprovalDetailResponseDtoDataSpendApproval
  dueOn?: string
  locale: string
  onFormatUnavailable: string
}) {
  const { colors } = useMobileTheme()
  const { t } = useTranslation()
  const styles = createStyles(colors)
  const request = approval.request
  const endDate = formatSpendDate(request.expectedEndDate, locale)
  const amount = approval.cost?.estimatedCost
    ? (formatSpendMoney(approval.cost.estimatedCost, locale) ?? onFormatUnavailable)
    : onFormatUnavailable
  return (
    <InfoCard title={t('spending.live.requestSummary')}>
      <InfoRow label={t('spending.live.requestIdLabel')} value={approval.requestId} />
      <InfoRow
        label={t('spending.live.requester', { name: request.requester.fullName })}
        value={request.requester.employeeCode}
      />
      {request.beneficiary ? (
        <InfoRow
          label={t('spending.live.beneficiary', { name: request.beneficiary.fullName })}
          value={request.beneficiary.employeeCode}
        />
      ) : null}
      <InfoRow label={t('spending.live.costCenterLabel')} value={request.costCenter.code} />
      <InfoRow label={t('spending.live.estimatedCost')} value={amount} />
      {approval.cost ? (
        <>
          <InfoRow
            label={t('spending.live.preTax')}
            value={formatSpendMoney(approval.cost.preTax, locale) ?? onFormatUnavailable}
          />
          <InfoRow
            label={t('spending.live.tax')}
            value={formatSpendMoney(approval.cost.tax, locale) ?? onFormatUnavailable}
          />
          <InfoRow
            label={t('spending.live.totalPayable')}
            value={formatSpendMoney(approval.cost.totalPayable, locale) ?? onFormatUnavailable}
          />
        </>
      ) : null}
      {approval.annualVendorAmount ? (
        <InfoRow
          label={t('spending.live.annualVendorAmount')}
          value={formatSpendMoney(approval.annualVendorAmount, locale) ?? onFormatUnavailable}
        />
      ) : null}
      <InfoRow
        label={t('spending.live.term')}
        value={
          request.termMonths === null
            ? t('spending.live.noTerm')
            : t('spending.live.termMonths', { count: request.termMonths })
        }
      />
      {endDate ? <InfoRow label={t('spending.live.expectedEndDate')} value={endDate} /> : null}
      {dueOn ? <InfoRow label={t('spending.live.dueDateLabel')} value={dueOn} /> : null}
      {request.lineCount > 1 ? (
        <InfoRow
          label={t('spending.live.groupCount', {
            formattedCount: new Intl.NumberFormat(locale).format(request.lineCount)
          })}
          value={t('spending.live.individualDecisionOnly')}
        />
      ) : null}
      {request.budgetYear ? <InfoRow label={t('spending.live.budgetYear')} value={String(request.budgetYear)} /> : null}
      <Text style={styles.bodyText}>{request.businessReason}</Text>
      {approval.need ? (
        <View style={styles.separator}>
          <InfoRow label={t('spending.live.needDecision')} value={approval.need.decidedBy.fullName} />
          {approval.need.reason ? <InfoRow label={t('spending.live.needReason')} value={approval.need.reason} /> : null}
        </View>
      ) : null}
      {approval.routing.mode === 'ONE_STEP' && approval.routing.oneStepReason ? (
        <Text style={styles.noticeText}>
          {t('spending.live.oneStepReason', {
            reason: t(`spending.live.oneStepReasons.${approval.routing.oneStepReason}`)
          })}
        </Text>
      ) : null}
      <InfoRow
        label={t('spending.live.slaWorkingDays')}
        value={t('spending.live.workingDays', { count: approval.step.slaWorkingDays })}
      />
    </InfoCard>
  )
}

function GroupLines({
  items,
  decisions,
  hasNoAnswer,
  onChoose,
  loading,
  decisionError,
  onRetry
}: {
  items: LinesResponseDtoDataItemsItem[]
  decisions: Record<string, 'APPROVE' | 'REJECT'>
  hasNoAnswer: boolean
  onChoose: (employeeId: string, decision: 'APPROVE' | 'REJECT') => void
  loading: boolean
  decisionError: boolean
  onRetry: () => void
}) {
  const { colors } = useMobileTheme()
  const { t } = useTranslation()
  const styles = createStyles(colors)
  return (
    <InfoCard title={t('spending.live.groupTitle')}>
      {loading ? (
        <Text accessibilityRole='progressbar' style={styles.muted}>
          {t('spending.live.groupLoading')}
        </Text>
      ) : null}
      {decisionError ? (
        <View>
          <Text accessibilityRole='alert' style={styles.errorText}>
            {t('spending.live.groupError')}
          </Text>
          <ActionButton label={t('account.retry')} onPress={onRetry} />
        </View>
      ) : null}
      {!loading && !decisionError && items.length === 0 ? (
        <Text accessibilityRole='alert' style={styles.noticeText}>
          {t('spending.live.groupNoPendingLines')}
        </Text>
      ) : null}
      {items.map((item) => {
        const selected = decisions[item.employee.employeeId]
        return (
          <View key={item.employee.employeeId} style={styles.lineCard}>
            <View style={styles.flex}>
              <Text style={styles.bodyText}>{item.employee.fullName}</Text>
              <Text style={styles.muted}>{item.employee.employeeCode}</Text>
            </View>
            <ChoiceButton
              disabled={hasNoAnswer}
              label={t('spending.live.approve')}
              selected={selected === 'APPROVE'}
              onPress={() => onChoose(item.employee.employeeId, 'APPROVE')}
            />
            <ChoiceButton
              label={t('spending.live.reject')}
              selected={selected === 'REJECT'}
              onPress={() => onChoose(item.employee.employeeId, 'REJECT')}
            />
          </View>
        )
      })}
    </InfoCard>
  )
}

function DecisionForm({
  checklist,
  answers,
  onAnswer,
  decision,
  hasRejectedLine,
  onChooseDecision,
  isGroup,
  hasNoAnswer,
  checklistComplete,
  checklistLoading,
  checklistError,
  onRetryChecklist,
  reason,
  onReasonChange,
  reasonNeeded,
  canConfirm,
  loading,
  onSubmit
}: {
  checklist: PolicyStepResponseDtoDataStepChecklistItem[]
  answers: ChecklistAnswers
  onAnswer: (code: string, answer: 'YES' | 'NO') => void
  decision?: SpendDecision
  hasRejectedLine: boolean
  onChooseDecision: (decision: SpendDecision | undefined) => void
  isGroup: boolean
  hasNoAnswer: boolean
  checklistComplete: boolean
  checklistLoading: boolean
  checklistError: boolean
  onRetryChecklist: () => void
  reason: string
  onReasonChange: (reason: string) => void
  reasonNeeded: boolean
  canConfirm: boolean
  loading: boolean
  onSubmit: () => void
}) {
  const { colors } = useMobileTheme()
  const { t } = useTranslation()
  const styles = createStyles(colors)
  return (
    <InfoCard title={t('spending.live.decisionTitle')}>
      {checklistLoading ? (
        <Text accessibilityRole='progressbar' style={styles.muted}>
          {t('spending.live.checklistLoading')}
        </Text>
      ) : null}
      {checklistError ? (
        <View>
          <Text accessibilityRole='alert' style={styles.errorText}>
            {t('spending.live.checklistError')}
          </Text>
          <ActionButton label={t('account.retry')} onPress={onRetryChecklist} />
        </View>
      ) : null}
      {checklist.map((item) => (
        <View key={item.code} style={styles.question}>
          <Text style={styles.bodyText}>{item.text}</Text>
          {item.check === 'SYSTEM' ? (
            <Text style={styles.systemAnswer}>{t('spending.live.systemYes')}</Text>
          ) : (
            <View style={styles.choiceRow}>
              <ChoiceButton
                label={t('spending.live.yes')}
                selected={answers[item.code] === 'YES'}
                onPress={() => onAnswer(item.code, 'YES')}
              />
              <ChoiceButton
                label={t('spending.live.no')}
                selected={answers[item.code] === 'NO'}
                onPress={() => onAnswer(item.code, 'NO')}
              />
            </View>
          )}
        </View>
      ))}
      {!checklistComplete && !checklistLoading && !checklistError ? (
        <Text accessibilityRole='alert' style={styles.noticeText}>
          {t('spending.live.checklistIncomplete')}
        </Text>
      ) : null}
      {hasNoAnswer ? (
        <Text accessibilityRole='alert' style={styles.noticeText}>
          {t('spending.live.noBlocksApproval')}
        </Text>
      ) : null}
      <View style={styles.decisionChoices}>
        <ChoiceButton
          disabled={hasNoAnswer && !isGroup}
          label={t(isGroup ? 'spending.live.groupContinue' : 'spending.live.approve')}
          selected={decision === 'APPROVE'}
          onPress={() => onChooseDecision(decision === 'APPROVE' ? undefined : 'APPROVE')}
        />
        {!isGroup ? (
          <ChoiceButton
            label={t('spending.live.reject')}
            selected={decision === 'REJECT'}
            onPress={() => onChooseDecision(decision === 'REJECT' ? undefined : 'REJECT')}
          />
        ) : null}
        <ChoiceButton
          label={t('spending.live.returnToHead')}
          selected={decision === 'RETURN'}
          onPress={() => onChooseDecision(decision === 'RETURN' ? undefined : 'RETURN')}
        />
      </View>
      {decision && (decision !== 'APPROVE' || (isGroup && hasRejectedLine)) ? (
        <View style={styles.reasonInputGroup}>
          <Text style={styles.fieldLabel}>{t('spending.live.reasonLabel')}</Text>
          <TextInput
            accessibilityLabel={t('spending.live.reasonLabel')}
            maxLength={1000}
            multiline
            onChangeText={onReasonChange}
            placeholder={t('spending.live.reasonPlaceholder')}
            placeholderTextColor={colors.muted}
            style={styles.reasonInput}
            value={reason}
          />
          {reasonNeeded ? (
            <Text accessibilityRole='alert' style={styles.errorText}>
              {t('spending.live.reasonRequired')}
            </Text>
          ) : null}
        </View>
      ) : null}
      {isGroup && decision === 'RETURN' ? (
        <Text style={styles.noticeText}>{t('spending.live.returnAllNotice')}</Text>
      ) : null}
      <ActionButton
        disabled={!canConfirm || checklistLoading || checklistError}
        label={loading ? t('spending.live.submitting') : t('spending.live.confirmDecision')}
        onPress={onSubmit}
      />
    </InfoCard>
  )
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

function ActionButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.actionButton, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  )
}

function ChoiceButton({
  label,
  selected,
  onPress,
  disabled
}: {
  label: string
  selected: boolean
  onPress: () => void
  disabled?: boolean
}) {
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.choiceButton, selected && styles.choiceSelected, disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  )
}

function getMutationErrorKey(code?: string) {
  switch (code) {
    case 'POLICY.VERSION_CHANGED':
    case 'POLICY.NOT_IN_FORCE':
      return 'spending.live.errors.policyChanged'
    case 'POLICY.CHECKLIST_HAS_NO':
      return 'spending.live.errors.checklistNo'
    case 'POLICY.CHECKLIST_INCOMPLETE':
      return 'spending.live.errors.checklistIncomplete'
    case 'SPEND.NOT_CHECKABLE':
      return 'spending.live.errors.notCheckable'
    case 'SPEND.NOT_THE_ASSIGNEE':
    case 'SPEND.OWN_REQUEST':
      return 'spending.live.errors.notAssigned'
    case 'SPEND.RECHECKED_RETURNED_TO_HEAD':
    case 'SPEND.RECHECKED_RETURNED_TO_REQUESTER':
      return 'spending.live.errors.returned'
    case 'SPEND.NO_SPEND_STEP':
    case 'SPEND.STEP_NOT_PENDING':
    case 'SPEND.STALE_STATE':
    case 'GROUP_REQUEST.LINES_MISMATCH':
    case 'GROUP_REQUEST.LINE_NOT_PENDING':
    case 'ACCESS_REQUEST.GROUP_USES_LINES':
      return 'spending.live.errors.stale'
    case 'SPEND.BUDGET_BLOCKED':
      return 'spending.live.errors.budgetBlocked'
    case 'BUDGET.COMMITMENT_NOT_HOLDABLE':
    case 'BUDGET.COMMITMENT_EXISTS':
      return 'spending.live.errors.commitment'
    default:
      return 'spending.live.errors.uncertain'
  }
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    safe: { backgroundColor: colors.background, flex: 1 },
    screen: { flex: 1 },
    content: { gap: 16, padding: 18, paddingBottom: 26 },
    header: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 54 },
    profile: { flex: 1 },
    hero: { gap: 6, paddingVertical: 8 },
    kicker: {
      color: colors.primaryInk,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase'
    },
    title: { color: colors.foreground, fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
    sectionTitle: { color: colors.foreground, fontSize: 15, fontWeight: '700' },
    bodyText: { color: colors.foreground, fontSize: 13, lineHeight: 20 },
    muted: { color: colors.muted, fontSize: 12, lineHeight: 18 },
    flex: { flex: 1, gap: 4 },
    section: { gap: 13 },
    reviewHeader: { alignItems: 'center', flexDirection: 'row', gap: 12 },
    reviewIcon: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 14,
      height: 46,
      justifyContent: 'center',
      width: 46
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      gap: 12,
      padding: 15
    },
    notice: { backgroundColor: colors.surfaceSubtle, borderRadius: 14, gap: 10, padding: 14 },
    noticeText: {
      backgroundColor: colors.warningBackground,
      borderRadius: 10,
      color: colors.warning,
      fontSize: 12,
      lineHeight: 18,
      overflow: 'hidden',
      padding: 10
    },
    errorCard: { backgroundColor: colors.warningBackground, borderRadius: 14, gap: 10, padding: 14 },
    errorText: { color: colors.danger, fontSize: 12, lineHeight: 18 },
    successCard: { backgroundColor: colors.successBackground, borderRadius: 14, gap: 10, padding: 14 },
    successText: { color: colors.success, fontSize: 13, fontWeight: '700' },
    infoRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
    infoLabel: { color: colors.muted, flex: 1, fontSize: 12, lineHeight: 18 },
    infoValue: {
      color: colors.foreground,
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 18,
      textAlign: 'right'
    },
    separator: { borderTopColor: colors.border, borderTopWidth: 1, gap: 8, paddingTop: 10 },
    queueHeader: { alignItems: 'center', flexDirection: 'row', gap: 10 },
    iconButton: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 12,
      height: 42,
      justifyContent: 'center',
      width: 42
    },
    search: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 9,
      minHeight: 46,
      paddingHorizontal: 12
    },
    searchInput: { color: colors.foreground, flex: 1, fontSize: 16, minHeight: 44, paddingVertical: 0 },
    list: { gap: 10 },
    emptyState: { alignItems: 'center', backgroundColor: colors.surfaceSubtle, borderRadius: 16, gap: 8, padding: 22 },
    emptyTitle: { color: colors.foreground, fontSize: 14, fontWeight: '700', textAlign: 'center' },
    pagination: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
    actionButton: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.primarySoft,
      borderRadius: 11,
      justifyContent: 'center',
      minHeight: 40,
      paddingHorizontal: 13,
      paddingVertical: 8
    },
    actionButtonText: { color: colors.primaryInk, fontSize: 12, fontWeight: '700', textAlign: 'center' },
    buttonDisabled: { opacity: 0.45 },
    lineCard: {
      alignItems: 'center',
      borderTopColor: colors.border,
      borderTopWidth: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
      paddingTop: 10
    },
    question: { borderTopColor: colors.border, borderTopWidth: 1, gap: 9, paddingTop: 11 },
    systemAnswer: { color: colors.success, fontSize: 12, fontWeight: '700' },
    choiceRow: { flexDirection: 'row', gap: 8 },
    decisionChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    choiceButton: {
      alignItems: 'center',
      backgroundColor: colors.surfaceSubtle,
      borderColor: colors.border,
      borderRadius: 10,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 38,
      paddingHorizontal: 11,
      paddingVertical: 7
    },
    choiceSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    choiceText: { color: colors.foreground, fontSize: 12, fontWeight: '600' },
    choiceTextSelected: { color: colors.primaryInk, fontWeight: '700' },
    reasonInputGroup: { gap: 7 },
    fieldLabel: { color: colors.foreground, fontSize: 12, fontWeight: '700' },
    reasonInput: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.foreground,
      fontSize: 14,
      minHeight: 90,
      padding: 11,
      textAlignVertical: 'top'
    }
  })
