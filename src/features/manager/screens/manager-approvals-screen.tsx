import { Feather } from '@expo/vector-icons'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { catalogSoftware, useRequests } from '@/entities/demo-requests'
import { InboxScreen } from '@/features/inbox'
import { mobileColors } from '@/shared/theme/colors'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { DepartmentVisibleCard } from '../components/department-visible-card'
import { ManagerApprovalCard } from '../components/manager-approval-card'
import { ManagerApprovalDetails } from '../components/manager-approval-details'
import {
  departmentVisibleRequests,
  filterManagerApprovals,
  managerApprovals,
  type ManagerApproval,
  type ManagerApprovalFilter
} from '../model/manager-approvals'

type ManagerTab = 'queue' | 'department' | 'inbox'

interface ManagerDecision {
  kind: 'approved' | 'rejected'
  reason?: string
  requestId: string
}

export function ManagerApprovalsScreen() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<ManagerApprovalFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const [activeTab, setActiveTab] = useState<ManagerTab>('queue')
  const { requests, managerDecisions, spendingDecisions, decide } = useRequests()
  const [lastDecision, setLastDecision] = useState<ManagerDecision>()
  const [decisionError, setDecisionError] = useState(false)
  const pendingRequests = useMemo(() => {
    const employeeItems: ManagerApproval[] = requests
      .filter((request) => request.status === 'awaitingNeed')
      .map((request) => {
        const fixture = managerApprovals.find((item) => item.id === request.id)
        if (fixture) return fixture
        const software = catalogSoftware.find((item) => item.id === request.softwareId)
        return {
          budgetPlanUnknown: true,
          department: 'CC-TECH',
          durationMonths: request.durationMonths,
          id: request.id,
          isStandard: software?.isStandard,
          requesterName: 'Nguyễn Văn A',
          requesterRole: 'Product Dev',
          reason: request.reason,
          softwareName: request.softwareName
        }
      })
    return [
      ...employeeItems,
      ...managerApprovals.filter((request) => request.id === 'BM01-2091' && !managerDecisions[request.id])
    ]
  }, [requests, managerDecisions])
  const filteredRequests = useMemo(
    () => filterManagerApprovals(pendingRequests, filter, search),
    [filter, pendingRequests, search]
  )
  const selectedRequest = pendingRequests.find((request) => request.id === selectedRequestId)
  const visibleRequests = departmentVisibleRequests
    .map((request) => {
      if (request.id === 'BM01-2088' && spendingDecisions[request.id]) {
        return {
          ...request,
          kind: spendingDecisions[request.id].kind === 'rejected' ? ('rejected' as const) : ('needApproved' as const),
          reason: spendingDecisions[request.id].reason
        }
      }
      if (request.id === 'BM01-2103' && requests.find((item) => item.id === request.id)?.status === 'withdrawn') {
        return { ...request, kind: 'withdrawn' as const }
      }
      return request
    })
    .concat(
      requests
        .filter((request) => request.id !== 'BM01-2103' && request.status !== 'awaitingNeed')
        .map((request) => ({
          id: request.id,
          kind: 'employeeStatus' as const,
          softwareName: request.softwareName,
          status: request.status
        }))
    )
  const raycastDecision = managerDecisions['BM01-2091']
  if (raycastDecision) {
    visibleRequests.push({
      id: 'BM01-2091',
      kind: raycastDecision.kind === 'rejected' ? 'otherRejected' : 'otherApproved',
      reason: raycastDecision.reason,
      softwareName: 'Raycast Pro'
    })
  }
  const filters: { id: ManagerApprovalFilter; label: string }[] = [
    { id: 'all', label: t('manager.filters.all') },
    { id: 'outsideStandard', label: t('manager.filters.outsideStandard') },
    { id: 'longTerm', label: t('manager.filters.longTerm') }
  ]

  function recordDecision(request: ManagerApproval, kind: ManagerDecision['kind'], reason?: string) {
    if (!decide('manager', { kind, reason, requestId: request.id })) {
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
        <ManagerApprovalDetails
          onApprove={() => recordDecision(selectedRequest, 'approved')}
          onBack={() => setSelectedRequestId(undefined)}
          onReject={(reason) => recordDecision(selectedRequest, 'rejected', reason)}
          request={selectedRequest}
        />
      </SafeAreaView>
    )
  }

  if (activeTab === 'inbox') {
    return <InboxScreen role='manager' onSelectTab={(tab) => setActiveTab(tab === 'queue' ? 'queue' : 'department')} />
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
          <View style={styles.profile}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>{t('manager.initials')}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>{t('manager.managerName')}</Text>
              <Text style={styles.profileMeta}>{t('manager.managerMeta')}</Text>
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

          <View style={styles.pageHeading}>
            <Text style={styles.kicker}>{t('manager.kicker')}</Text>
            <Text accessibilityRole='header' style={styles.title}>
              {t('manager.title')}
            </Text>
            <Text style={styles.subtitle}>{t('manager.subtitle')}</Text>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.metricIconPrimary]}>
                <Feather color={mobileColors.primaryInk} name='check-circle' size={16} />
              </View>
              <Text style={styles.metricValue}>{pendingRequests.length}</Text>
              <Text style={styles.metricLabel}>{t('manager.assignedCount')}</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.metricIconNeutral]}>
                <Feather color={mobileColors.success} name='users' size={16} />
              </View>
              <Text style={styles.metricValue}>{visibleRequests.length}</Text>
              <Text style={styles.metricLabel}>{t('manager.departmentVisibleCount')}</Text>
            </View>
          </View>

          <Text style={styles.demoNote}>{t('manager.demoNote')}</Text>
          {decisionError ? <Text accessibilityRole='alert'>{t('common.demoDecisionError')}</Text> : null}

          {lastDecision ? (
            <View accessibilityRole='alert' style={styles.result}>
              <Text style={styles.resultTitle}>
                {t(lastDecision.kind === 'approved' ? 'manager.approvedResult' : 'manager.rejectedResult', {
                  id: lastDecision.requestId
                })}
              </Text>
              {lastDecision.reason ? <Text style={styles.resultReason}>{lastDecision.reason}</Text> : null}
              <Text style={styles.resultNote}>{t('manager.demoActionNote')}</Text>
            </View>
          ) : null}

          {activeTab === 'queue' ? (
            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionCopy}>
                  <Text style={styles.sectionTitle}>{t('manager.queueTitle')}</Text>
                  <Text style={styles.sectionHint}>{t('manager.queueHint')}</Text>
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
                  accessibilityLabel={t('manager.searchLabel')}
                  onChangeText={setSearch}
                  placeholder={t('manager.searchPlaceholder')}
                  placeholderTextColor={mobileColors.muted}
                  returnKeyType='search'
                  style={styles.searchInput}
                  value={search}
                />
              </View>

              <View accessibilityLabel={t('manager.filters.label')} style={styles.filters}>
                {filters.map((item) => {
                  const selected = filter === item.id

                  return (
                    <Pressable
                      accessibilityRole='button'
                      accessibilityState={{ selected }}
                      key={item.id}
                      onPress={() => setFilter(item.id)}
                      style={[styles.filterButton, selected && styles.selectedFilter]}
                    >
                      <Text style={[styles.filterLabel, selected && styles.selectedFilterLabel]}>{item.label}</Text>
                    </Pressable>
                  )
                })}
              </View>

              <View style={styles.requestList}>
                {filteredRequests.map((request) => (
                  <ManagerApprovalCard
                    key={request.id}
                    onPress={({ id }) => setSelectedRequestId(id)}
                    request={request}
                  />
                ))}
                {filteredRequests.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>
                      {t(pendingRequests.length ? 'manager.emptySearch' : 'manager.emptyQueue')}
                    </Text>
                    <Text style={styles.emptyBody}>
                      {t(pendingRequests.length ? 'manager.emptySearchHint' : 'manager.emptyQueueHint')}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          {activeTab === 'department' ? (
            <View style={styles.visibilitySection}>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>{t('manager.departmentVisibilityTitle')}</Text>
                <Text style={styles.sectionHint}>{t('manager.departmentVisibilityHint')}</Text>
              </View>
              {visibleRequests.map((request) => (
                <DepartmentVisibleCard key={request.id} request={request} />
              ))}
            </View>
          ) : null}
        </ScrollView>
        <MobileTabBar
          accessibilityLabel={t('navigation.tabs')}
          tabs={[
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('manager.tabs.queue') }),
              icon: 'check-square',
              id: 'manager-queue',
              label: t('manager.tabs.queue'),
              onPress: () => setActiveTab('queue'),
              selected: activeTab === 'queue'
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('manager.tabs.department') }),
              icon: 'users',
              id: 'manager-department',
              label: t('manager.tabs.department'),
              onPress: () => setActiveTab('department'),
              selected: activeTab === 'department'
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
              icon: 'bell',
              id: 'manager-inbox',
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
  demoNote: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  emptyBody: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center'
  },
  emptySearch: {
    color: mobileColors.muted,
    fontSize: 12
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
  kicker: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
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
    fontSize: 10,
    lineHeight: 16
  },
  metricValue: {
    color: mobileColors.foreground,
    fontSize: 21,
    fontWeight: '700'
  },
  metrics: {
    flexDirection: 'row',
    gap: 9
  },
  pageHeading: {
    gap: 5,
    paddingHorizontal: 2
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    minHeight: 54,
    paddingHorizontal: 2
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 20,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  profileCopy: {
    flex: 1,
    gap: 2
  },
  profileInitials: {
    color: mobileColors.primaryInk,
    fontSize: 13,
    fontWeight: '700'
  },
  profileMeta: {
    color: mobileColors.muted,
    fontSize: 11
  },
  profileName: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  requestList: {
    gap: 10
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
  section: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 19,
    borderWidth: 1,
    gap: 13,
    padding: 14,
    boxShadow: '0px 4px 10px rgba(93, 59, 32, 0.035)'
  },
  sectionCopy: {
    flex: 1,
    gap: 4
  },
  sectionHeading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between'
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
  },
  visibilitySection: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 19,
    borderWidth: 1,
    gap: 12,
    padding: 15
  }
})
