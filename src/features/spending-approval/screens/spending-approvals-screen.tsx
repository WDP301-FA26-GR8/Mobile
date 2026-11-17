import { Feather } from '@expo/vector-icons'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useRequests } from '@/entities/demo-requests'
import { InboxScreen } from '@/features/inbox'
import { mobileColors } from '@/shared/theme/colors'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { SpendingApprovalCard } from '../components/spending-approval-card'
import { SpendingApprovalDetails } from '../components/spending-approval-details'
import {
  filterSpendingApprovals,
  spendingApprovals,
  type SpendingApproval,
  type SpendingStepFilter
} from '../model/spending-approvals'

interface SpendingDecision {
  kind: 'approved' | 'override' | 'rejected'
  reason?: string
  requestId: string
}

type SpendingTab = 'queue' | 'history' | 'inbox'

export function SpendingApprovalsScreen() {
  const { t } = useTranslation()
  const [step, setStep] = useState<SpendingStepFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const [activeTab, setActiveTab] = useState<SpendingTab>('queue')
  const { requests, spendingDecisions: decisions, decide } = useRequests()
  const [lastDecision, setLastDecision] = useState<SpendingDecision>()
  const [decisionError, setDecisionError] = useState(false)
  const pendingRequests = useMemo(
    () =>
      spendingApprovals.filter(
        (request) =>
          !decisions[request.id] &&
          (request.id !== 'BM01-2104' || requests.find((item) => item.id === request.id)?.status === 'spendApproval')
      ),
    [decisions, requests]
  )
  const filteredRequests = useMemo(
    () => filterSpendingApprovals(pendingRequests, step, search),
    [pendingRequests, search, step]
  )
  const selectedRequest = pendingRequests.find((request) => request.id === selectedRequestId)
  const completedRequests = spendingApprovals.filter((request) => decisions[request.id])
  const filters: { id: SpendingStepFilter; label: string }[] = [
    { id: 'all', label: t('spending.filters.all') },
    { id: 'spending', label: t('spending.filters.spending') },
    { id: 'need', label: t('spending.filters.need') }
  ]

  function recordDecision(request: SpendingApproval, kind: SpendingDecision['kind'], reason?: string) {
    if (!decide('spending', { kind, reason, requestId: request.id })) {
      setDecisionError(true)
      setSelectedRequestId(undefined)
      return
    }
    setDecisionError(false)
    setLastDecision({ kind, reason, requestId: request.id })
    setSelectedRequestId(undefined)
  }

  if (selectedRequest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SpendingApprovalDetails
          onApprove={(reason) =>
            recordDecision(selectedRequest, selectedRequest.overrideRequired ? 'override' : 'approved', reason)
          }
          onBack={() => setSelectedRequestId(undefined)}
          onReject={(reason) => recordDecision(selectedRequest, 'rejected', reason)}
          request={selectedRequest}
        />
      </SafeAreaView>
    )
  }

  if (activeTab === 'inbox') {
    return <InboxScreen role='spending' onSelectTab={(tab) => setActiveTab(tab === 'queue' ? 'queue' : 'history')} />
  }

  const needStepCount = pendingRequests.filter((request) => request.step === 'need').length

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
          <View style={styles.profile}>
            <View style={styles.profileMark}>
              <Text style={styles.profileInitials}>{t('spending.approverInitials')}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileTitle}>{t('spending.approverName')}</Text>
              <Text style={styles.profileMeta}>{t('spending.approverHeaderMeta')}</Text>
            </View>
            <Pressable
              accessibilityLabel={t('navigation.openTab', { tab: t('navigation.inbox') })}
              accessibilityRole='button'
              onPress={() => setActiveTab('inbox')}
              style={styles.notificationButton}
            >
              <Feather
                accessibilityElementsHidden
                color={mobileColors.foreground}
                importantForAccessibility='no'
                name='bell'
                size={18}
              />
            </Pressable>
          </View>

          <View style={styles.heading}>
            <Text style={styles.kicker}>{t('spending.kicker')}</Text>
            <Text accessibilityRole='header' style={styles.title}>
              {t('spending.title')}
            </Text>
            <Text style={styles.subtitle}>{t('spending.subtitle')}</Text>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.metricIconPrimary]}>
                <Feather color={mobileColors.primaryInk} name='credit-card' size={16} />
              </View>
              <Text style={styles.metricValue}>{pendingRequests.length}</Text>
              <Text style={styles.metricLabel}>{t('spending.assignedCount')}</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.metricIconNeutral]}>
                <Feather color={mobileColors.success} name='check-circle' size={16} />
              </View>
              <Text style={styles.metricValue}>{needStepCount}</Text>
              <Text style={styles.metricLabel}>{t('spending.needStepCount')}</Text>
            </View>
          </View>
          <Text style={styles.demoNote}>{t('spending.demoNote')}</Text>
          {decisionError ? <Text accessibilityRole='alert'>{t('common.demoDecisionError')}</Text> : null}

          {lastDecision ? (
            <View accessibilityRole='alert' style={styles.result}>
              <Text style={styles.resultTitle}>
                {t(`spending.results.${lastDecision.kind}`, { id: lastDecision.requestId })}
              </Text>
              {lastDecision.reason ? <Text style={styles.resultReason}>{lastDecision.reason}</Text> : null}
              <Text style={styles.resultNote}>{t('spending.demoActionNote')}</Text>
            </View>
          ) : null}

          {activeTab === 'queue' ? (
            <View style={styles.queue}>
              <View style={styles.queueHeading}>
                <View style={styles.queueCopy}>
                  <Text style={styles.sectionTitle}>{t('spending.queueTitle')}</Text>
                  <Text style={styles.sectionHint}>{t('spending.queueHint')}</Text>
                </View>
                <Text style={styles.countBadge}>{pendingRequests.length}</Text>
              </View>

              <View style={styles.search}>
                <Feather
                  accessibilityElementsHidden
                  color={mobileColors.muted}
                  importantForAccessibility='no'
                  name='search'
                  size={17}
                />
                <TextInput
                  accessibilityLabel={t('spending.searchLabel')}
                  onChangeText={setSearch}
                  placeholder={t('spending.searchPlaceholder')}
                  placeholderTextColor={mobileColors.muted}
                  returnKeyType='search'
                  style={styles.searchInput}
                  value={search}
                />
              </View>

              <View accessibilityLabel={t('spending.filters.label')} style={styles.filters}>
                {filters.map((item) => {
                  const selected = step === item.id

                  return (
                    <Pressable
                      accessibilityRole='button'
                      accessibilityState={{ selected }}
                      key={item.id}
                      onPress={() => setStep(item.id)}
                      style={[styles.filterButton, selected && styles.selectedFilter]}
                    >
                      <Text style={[styles.filterLabel, selected && styles.selectedFilterLabel]}>{item.label}</Text>
                    </Pressable>
                  )
                })}
              </View>

              <View style={styles.list}>
                {filteredRequests.map((request) => (
                  <SpendingApprovalCard
                    key={request.id}
                    onPress={({ id }) => setSelectedRequestId(id)}
                    request={request}
                  />
                ))}
                {filteredRequests.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>
                      {t(pendingRequests.length ? 'spending.emptySearch' : 'spending.emptyQueue')}
                    </Text>
                    <Text style={styles.emptyHint}>
                      {t(pendingRequests.length ? 'spending.emptySearchHint' : 'spending.emptyQueueHint')}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.historySection}>
              <View style={styles.queueHeading}>
                <View style={styles.queueCopy}>
                  <Text style={styles.sectionTitle}>{t('spending.historyTitle')}</Text>
                  <Text style={styles.sectionHint}>{t('spending.historyHint')}</Text>
                </View>
                <Text style={styles.countBadge}>{completedRequests.length}</Text>
              </View>
              {completedRequests.length > 0 ? (
                <View style={styles.historyList}>
                  {completedRequests.map((request) => (
                    <View key={request.id} style={styles.historyCard}>
                      <View style={styles.historyCopy}>
                        <Text style={styles.historySoftware}>{request.softwareName}</Text>
                        <Text style={styles.historyId}>{request.id}</Text>
                      </View>
                      <Text style={styles.historyStatus}>
                        {t(`spending.decisionStatus.${decisions[request.id].kind}`)}
                      </Text>
                      {decisions[request.id].reason ? (
                        <Text style={styles.historyStatus}>{decisions[request.id].reason}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>{t('spending.historyEmpty')}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
        <MobileTabBar
          accessibilityLabel={t('navigation.tabs')}
          tabs={[
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('spending.tabs.queue') }),
              icon: 'check-square',
              id: 'spending-queue',
              label: t('spending.tabs.queue'),
              onPress: () => setActiveTab('queue'),
              selected: activeTab === 'queue'
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('spending.tabs.history') }),
              icon: 'clock',
              id: 'spending-history',
              label: t('spending.tabs.history'),
              onPress: () => setActiveTab('history'),
              selected: activeTab === 'history'
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
              icon: 'bell',
              id: 'spending-inbox',
              label: t('navigation.inbox'),
              onPress: () => setActiveTab('inbox'),
              selected: false
            }
          ]}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 15,
    padding: 16,
    paddingBottom: 20
  },
  countBadge: {
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 10,
    color: mobileColors.primaryInk,
    fontSize: 12,
    fontWeight: '700',
    minWidth: 29,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    textAlign: 'center'
  },
  demoBadge: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 7,
    color: mobileColors.muted,
    fontSize: 10,
    fontWeight: '600',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  demoNote: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  emptyHint: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center'
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 12,
    padding: 18
  },
  emptyTitle: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center'
  },
  filterButton: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12
  },
  filterLabel: {
    color: mobileColors.muted,
    fontSize: 11,
    fontWeight: '500'
  },
  filters: {
    backgroundColor: '#f6eee6',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 3,
    padding: 4
  },
  heading: {
    gap: 4
  },
  kicker: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  list: {
    gap: 10
  },
  metricCard: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    padding: 13,
    boxShadow: '0px 3px 8px rgba(93, 59, 32, 0.04)'
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 30,
    justifyContent: 'center',
    marginBottom: 2,
    width: 34
  },
  metricIconNeutral: {
    backgroundColor: '#e5f7ed'
  },
  metricIconPrimary: {
    backgroundColor: mobileColors.primarySoft
  },
  metricLabel: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  metricValue: {
    color: mobileColors.foreground,
    fontSize: 22,
    fontWeight: '700'
  },
  metrics: {
    flexDirection: 'row',
    gap: 9
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    minHeight: 54,
    paddingHorizontal: 2
  },
  profileCopy: {
    flex: 1,
    gap: 2
  },
  profileMark: {
    alignItems: 'center',
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 20,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  profileMeta: {
    color: mobileColors.muted,
    fontSize: 11
  },
  profileInitials: {
    color: mobileColors.primaryInk,
    fontSize: 13,
    fontWeight: '700'
  },
  profileTitle: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 19,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38
  },
  queue: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 19,
    borderWidth: 1,
    gap: 13,
    padding: 14,
    boxShadow: '0px 4px 10px rgba(93, 59, 32, 0.035)'
  },
  queueCopy: {
    flex: 1,
    gap: 4
  },
  queueHeading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between'
  },
  result: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderColor: mobileColors.border,
    borderRadius: 13,
    borderWidth: 1,
    gap: 5,
    padding: 13
  },
  resultNote: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  resultReason: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  resultTitle: {
    color: mobileColors.foreground,
    fontSize: 13,
    fontWeight: '700'
  },
  safeArea: {
    backgroundColor: mobileColors.background,
    flex: 1
  },
  screen: {
    flex: 1
  },
  historySection: {
    gap: 13
  },
  historyList: {
    gap: 9
  },
  historyCard: {
    alignItems: 'center',
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 14
  },
  historyCopy: {
    flex: 1,
    gap: 4
  },
  historyId: {
    color: mobileColors.muted,
    fontSize: 11
  },
  historySoftware: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  historyStatus: {
    backgroundColor: '#e5f7ed',
    borderRadius: 9,
    color: mobileColors.success,
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  search: {
    alignItems: 'center',
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    minHeight: 46,
    paddingHorizontal: 12
  },
  searchInput: {
    color: mobileColors.foreground,
    flex: 1,
    fontSize: 16,
    minHeight: 44,
    paddingVertical: 0
  },
  sectionHint: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  sectionTitle: {
    color: mobileColors.foreground,
    fontSize: 15,
    fontWeight: '700'
  },
  selectedFilter: {
    backgroundColor: mobileColors.primary,
    borderColor: mobileColors.primary
  },
  selectedFilterLabel: {
    color: mobileColors.white,
    fontWeight: '700'
  },
  subtitle: {
    color: mobileColors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  title: {
    color: mobileColors.foreground,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.5
  }
})
