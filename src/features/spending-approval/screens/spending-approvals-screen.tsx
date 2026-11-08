import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { mobileColors } from '@/shared/theme/colors'

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

export function SpendingApprovalsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState<SpendingStepFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const [decisions, setDecisions] = useState<Record<string, SpendingDecision['kind']>>({})
  const [lastDecision, setLastDecision] = useState<SpendingDecision>()
  const pendingRequests = useMemo(() => spendingApprovals.filter((request) => !decisions[request.id]), [decisions])
  const filteredRequests = useMemo(
    () => filterSpendingApprovals(pendingRequests, step, search),
    [pendingRequests, search, step]
  )
  const selectedRequest = spendingApprovals.find((request) => request.id === selectedRequestId)
  const filters: { id: SpendingStepFilter; label: string }[] = [
    { id: 'all', label: t('spending.filters.all') },
    { id: 'spending', label: t('spending.filters.spending') },
    { id: 'need', label: t('spending.filters.need') }
  ]

  function recordDecision(request: SpendingApproval, kind: SpendingDecision['kind'], reason?: string) {
    setDecisions((current) => ({ ...current, [request.id]: kind }))
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

  const needStepCount = pendingRequests.filter((request) => request.step === 'need').length

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <Pressable
          accessibilityLabel={t('spending.backToHome')}
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
          <Text style={styles.backLabel}>{t('spending.backToHome')}</Text>
        </Pressable>

        <View style={styles.profile}>
          <View style={styles.profileMark}>
            <Feather
              accessibilityElementsHidden
              color={mobileColors.primaryInk}
              importantForAccessibility='no'
              name='check-circle'
              size={19}
            />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileTitle}>{t('spending.approverRole')}</Text>
            <Text style={styles.profileMeta}>{t('spending.approverScope')}</Text>
          </View>
          <Text style={styles.demoBadge}>{t('common.demo')}</Text>
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
            <Text style={styles.metricValue}>{pendingRequests.length}</Text>
            <Text style={styles.metricLabel}>{t('spending.assignedCount')}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{needStepCount}</Text>
            <Text style={styles.metricLabel}>{t('spending.needStepCount')}</Text>
          </View>
        </View>
        <Text style={styles.demoNote}>{t('spending.demoNote')}</Text>

        {lastDecision ? (
          <View accessibilityRole='alert' style={styles.result}>
            <Text style={styles.resultTitle}>
              {t(`spending.results.${lastDecision.kind}`, { id: lastDecision.requestId })}
            </Text>
            {lastDecision.reason ? <Text style={styles.resultReason}>{lastDecision.reason}</Text> : null}
            <Text style={styles.resultNote}>{t('spending.demoActionNote')}</Text>
          </View>
        ) : null}

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
              <SpendingApprovalCard key={request.id} onPress={({ id }) => setSelectedRequestId(id)} request={request} />
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
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12
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
  profileCopy: {
    flex: 1,
    gap: 2
  },
  profileMark: {
    alignItems: 'center',
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  profileMeta: {
    color: mobileColors.muted,
    fontSize: 11
  },
  profileTitle: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  queue: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 16,
    gap: 13,
    padding: 13
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
  }
})
