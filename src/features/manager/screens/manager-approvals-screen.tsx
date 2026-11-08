import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { mobileColors } from '@/shared/theme/colors'

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

interface ManagerDecision {
  kind: 'approved' | 'rejected'
  reason?: string
  requestId: string
}

export function ManagerApprovalsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [filter, setFilter] = useState<ManagerApprovalFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const [decisions, setDecisions] = useState<Record<string, ManagerDecision['kind']>>({})
  const [lastDecision, setLastDecision] = useState<ManagerDecision>()
  const pendingRequests = useMemo(() => managerApprovals.filter((request) => !decisions[request.id]), [decisions])
  const filteredRequests = useMemo(
    () => filterManagerApprovals(pendingRequests, filter, search),
    [filter, pendingRequests, search]
  )
  const selectedRequest = managerApprovals.find((request) => request.id === selectedRequestId)
  const filters: { id: ManagerApprovalFilter; label: string }[] = [
    { id: 'all', label: t('manager.filters.all') },
    { id: 'outsideStandard', label: t('manager.filters.outsideStandard') },
    { id: 'longTerm', label: t('manager.filters.longTerm') }
  ]

  function recordDecision(request: ManagerApproval, kind: ManagerDecision['kind'], reason?: string) {
    setDecisions((current) => ({ ...current, [request.id]: kind }))
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <Pressable
          accessibilityLabel={t('manager.backToHome')}
          accessibilityRole='button'
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather
            accessibilityElementsHidden
            color={mobileColors.primaryInk}
            importantForAccessibility='no'
            name='arrow-left'
            size={18}
          />
          <Text style={styles.backLabel}>{t('manager.backToHome')}</Text>
        </Pressable>

        <View style={styles.profile}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>{t('manager.initials')}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{t('manager.managerName')}</Text>
            <Text style={styles.profileMeta}>{t('manager.managerMeta')}</Text>
          </View>
          <Text style={styles.demoBadge}>{t('common.demo')}</Text>
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
            <Text style={styles.metricValue}>{pendingRequests.length}</Text>
            <Text style={styles.metricLabel}>{t('manager.assignedCount')}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{departmentVisibleRequests.length}</Text>
            <Text style={styles.metricLabel}>{t('manager.departmentVisibleCount')}</Text>
          </View>
        </View>

        <Text style={styles.demoNote}>{t('manager.demoNote')}</Text>

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
              <ManagerApprovalCard key={request.id} onPress={({ id }) => setSelectedRequestId(id)} request={request} />
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

        <View style={styles.visibilitySection}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>{t('manager.departmentVisibilityTitle')}</Text>
            <Text style={styles.sectionHint}>{t('manager.departmentVisibilityHint')}</Text>
          </View>
          {departmentVisibleRequests.map((request) => (
            <DepartmentVisibleCard key={request.id} request={request} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 7,
    minHeight: 40
  },
  backLabel: {
    color: mobileColors.primaryInk,
    fontSize: 12,
    fontWeight: '600'
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 28
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
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 10
  },
  filterLabel: {
    color: mobileColors.muted,
    fontSize: 11,
    fontWeight: '500'
  },
  filters: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 10,
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
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 13
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
  pageHeading: {
    gap: 4
  },
  profile: {
    alignItems: 'center',
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40
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
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 16,
    gap: 13,
    padding: 13
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
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border
  },
  selectedFilterLabel: {
    color: mobileColors.foreground,
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
    gap: 10
  }
})
