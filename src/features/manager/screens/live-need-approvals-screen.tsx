import { Feather } from '@expo/vector-icons'
import { Redirect, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import type { NeedQueueResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/need-decisions'
import { useSession } from '@/shared/api/session-context'
import { mobileColors } from '@/shared/theme/colors'

import { useLiveNeedApprovals } from '../hooks/use-live-need-approvals'

export function LiveNeedApprovalsScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const session = useSession()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<NeedQueueResponseDtoDataItemsItem>()
  const [choice, setChoice] = useState<'APPROVE' | 'REJECT'>()
  const [reason, setReason] = useState('')
  const [validation, setValidation] = useState(false)
  const sent = useRef(false)
  const { queue, detail, decision } = useLiveNeedApprovals(page, selected?.requestId)
  const request = detail.data
  const canDecide =
    !!selected &&
    !!request &&
    !detail.isError &&
    request.type === 'GRANT' &&
    request.needStep.id === selected.stepId &&
    request.needStep.state === 'PENDING' &&
    !request.needDecision
  const locked = decision.isPending || decision.isError || decision.isSuccess

  function closeDetails() {
    if (decision.isPending) return
    setSelected(undefined)
    setChoice(undefined)
    setReason('')
    setValidation(false)
    sent.current = false
    decision.reset()
  }
  function confirm() {
    if (!selected || !choice || !canDecide || locked || sent.current) return
    if (choice === 'APPROVE' && request && request.termMonths > 12) return
    if (choice === 'REJECT' && (reason.trim().length < 1 || reason.trim().length > 1000)) {
      setValidation(true)
      return
    }
    setValidation(false)
    sent.current = true
    decision.mutate({
      id: selected.requestId,
      body: choice === 'APPROVE' ? { decision: choice } : { decision: choice, reason: reason.trim() }
    })
  }
  if (session.state === 'anonymous') return <Redirect href='/' />
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <Pressable
          accessibilityRole='button'
          accessibilityState={{ disabled: decision.isPending }}
          disabled={decision.isPending}
          onPress={() => (selected ? closeDetails() : router.replace('/my-software'))}
          style={styles.action}
        >
          <Text style={styles.link}>{selected ? t('manager.live.backQueue') : t('manager.live.backSoftware')}</Text>
        </Pressable>
        <View style={styles.heading}>
          <View style={styles.headingCopy}>
            <Text style={styles.kicker}>{t('manager.live.kicker')}</Text>
            <Text accessibilityRole='header' style={styles.title}>
              {selected ? t('manager.live.details') : t('manager.live.title')}
            </Text>
            <Text style={styles.muted}>{t('manager.live.scope')}</Text>
          </View>
          <View style={styles.icon}>
            <Feather
              accessibilityElementsHidden
              importantForAccessibility='no'
              name='check-square'
              size={22}
              color={mobileColors.primaryInk}
            />
          </View>
        </View>
        {!selected ? (
          <>
            {session.state === 'loading' || queue.isLoading ? (
              <Text accessibilityRole='progressbar' style={styles.muted}>
                {t('manager.live.loading')}
              </Text>
            ) : null}
            {queue.isError ? (
              <View style={styles.card}>
                <Text accessibilityRole='alert' style={styles.error}>
                  {t('manager.live.queueError')}
                </Text>
                <Pressable accessibilityRole='button' onPress={() => void queue.refetch()} style={styles.action}>
                  <Text style={styles.link}>{t('licenses.live.retry')}</Text>
                </Pressable>
                {page > 1 ? (
                  <Pressable accessibilityRole='button' onPress={() => setPage(page - 1)} style={styles.action}>
                    <Text style={styles.link}>{t('licenses.live.previous')}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {queue.data ? (
              <Text style={styles.muted}>
                {t('manager.live.count', {
                  count: queue.data.pagination.totalItems,
                  formattedCount: new Intl.NumberFormat(i18n.language).format(queue.data.pagination.totalItems)
                })}
              </Text>
            ) : null}
            {queue.data?.items.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.muted}>{t('manager.live.empty')}</Text>
              </View>
            ) : null}
            {queue.data?.items.map((item) => {
              const name = item.plan?.applicationName ?? item.softwareName ?? t('requests.live.unnamed')
              return (
                <Pressable
                  key={item.stepId}
                  accessibilityRole='button'
                  accessibilityLabel={t('manager.live.openNamed', { name, person: item.requester.fullName })}
                  onPress={() => setSelected(item)}
                  style={styles.card}
                >
                  <View style={styles.row}>
                    <Text style={styles.name}>{name}</Text>
                    <Feather
                      accessibilityElementsHidden
                      importantForAccessibility='no'
                      name='chevron-right'
                      size={20}
                      color={mobileColors.muted}
                    />
                  </View>
                  {item.plan ? (
                    <Text style={styles.muted}>{t('licenses.live.plan', { plan: item.plan.planName })}</Text>
                  ) : null}
                  <Text style={styles.muted}>{t('manager.live.requester', { name: item.requester.fullName })}</Text>
                  <Text style={styles.muted}>{t('manager.live.department', { name: item.department.name })}</Text>
                  <Text style={styles.muted}>
                    {t('manager.live.due', {
                      date: formatDate(item.dueOn, i18n.language, t('licenses.live.dateUnavailable'))
                    })}
                  </Text>
                </Pressable>
              )
            })}
            {queue.data && queue.data.pagination.totalPages > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  accessibilityRole='button'
                  accessibilityState={{ disabled: page <= 1 }}
                  disabled={page <= 1}
                  onPress={() => setPage(page - 1)}
                  style={[styles.action, page <= 1 && styles.disabled]}
                >
                  <Text style={styles.link}>{t('licenses.live.previous')}</Text>
                </Pressable>
                <Text style={styles.muted}>
                  {t('licenses.live.page', { page: new Intl.NumberFormat(i18n.language).format(page) })}
                </Text>
                <Pressable
                  accessibilityRole='button'
                  accessibilityState={{ disabled: page >= queue.data.pagination.totalPages }}
                  disabled={page >= queue.data.pagination.totalPages}
                  onPress={() => setPage(page + 1)}
                  style={[styles.action, page >= queue.data.pagination.totalPages && styles.disabled]}
                >
                  <Text style={styles.link}>{t('licenses.live.next')}</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : (
          <>
            {detail.isLoading ? (
              <Text accessibilityRole='progressbar' style={styles.muted}>
                {t('manager.live.loading')}
              </Text>
            ) : null}
            {detail.isError ? (
              <View style={styles.card}>
                <Text accessibilityRole='alert' style={styles.error}>
                  {t('manager.live.detailError')}
                </Text>
                <Pressable accessibilityRole='button' onPress={() => void detail.refetch()} style={styles.action}>
                  <Text style={styles.link}>{t('licenses.live.retry')}</Text>
                </Pressable>
              </View>
            ) : null}
            {decision.isSuccess ? (
              <Text accessibilityRole='summary' style={styles.success}>
                {t('manager.live.saved')}
              </Text>
            ) : null}
            {decision.isError ? (
              <Text accessibilityRole='alert' style={styles.error}>
                {t('manager.live.uncertain')}
              </Text>
            ) : null}
            {request ? (
              <View style={styles.card}>
                <Text style={styles.name}>
                  {request.plan?.applicationName ?? request.proposal?.softwareName ?? t('requests.live.unnamed')}
                </Text>
                {request.plan ? (
                  <Text style={styles.muted}>{t('licenses.live.plan', { plan: request.plan.planName })}</Text>
                ) : null}
                <Text style={styles.muted}>{t('requests.live.reference', { id: request.id })}</Text>
                <Text style={styles.label}>{t('requests.live.requester')}</Text>
                <Text style={styles.value}>{request.requester.fullName}</Text>
                {request.beneficiary ? (
                  <>
                    <Text style={styles.label}>{t('requests.live.beneficiary')}</Text>
                    <Text style={styles.value}>{request.beneficiary.fullName}</Text>
                  </>
                ) : null}
                <Text style={styles.label}>{t('manager.live.departmentLabel')}</Text>
                <Text style={styles.value}>{request.department.name}</Text>
                <Text style={styles.label}>{t('requests.live.reason')}</Text>
                <Text style={styles.value}>{request.businessReason}</Text>
                <Text style={styles.label}>{t('requests.live.term')}</Text>
                <Text style={styles.value}>
                  {t('requests.live.months', {
                    months: new Intl.NumberFormat(i18n.language).format(request.termMonths)
                  })}
                </Text>
                <Text style={styles.label}>{t('manager.live.cost')}</Text>
                <Text style={styles.value}>
                  {request.pricing.status === 'NOT_APPLICABLE'
                    ? t('manager.live.costNotApplicable')
                    : request.pricing.status === 'MISSING'
                      ? t('manager.live.costMissing')
                      : (formatCost(request.pricing.amount, i18n.language) ?? t('manager.live.costUnavailable'))}
                </Text>
                {request.termMonths > 12 ? <Text style={styles.error}>{t('manager.live.longTermBlocked')}</Text> : null}
                {!canDecide && !locked && !detail.isError ? (
                  <Text accessibilityRole='alert' style={styles.error}>
                    {t('manager.live.stale')}
                  </Text>
                ) : null}
                {canDecide && !locked && !choice ? (
                  <View style={styles.actions}>
                    <Pressable accessibilityRole='button' onPress={() => setChoice('REJECT')} style={styles.outline}>
                      <Text style={styles.link}>{t('manager.live.reject')}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole='button'
                      accessibilityState={{ disabled: request.termMonths > 12 }}
                      disabled={request.termMonths > 12}
                      onPress={() => setChoice('APPROVE')}
                      style={[styles.primary, request.termMonths > 12 && styles.disabled]}
                    >
                      <Text style={styles.primaryText}>{t('manager.live.approve')}</Text>
                    </Pressable>
                  </View>
                ) : null}
                {choice && !decision.isSuccess ? (
                  <View style={styles.confirm}>
                    <Text style={styles.name}>
                      {t(choice === 'APPROVE' ? 'manager.live.confirmApprove' : 'manager.live.confirmReject')}
                    </Text>
                    <Text style={styles.muted}>{t('manager.live.confirmNote')}</Text>
                    {choice === 'REJECT' ? (
                      <>
                        <Text style={styles.label}>{t('manager.live.rejectReason')}</Text>
                        <TextInput
                          accessibilityLabel={t('manager.live.rejectReason')}
                          editable={!locked}
                          multiline
                          maxLength={1000}
                          value={reason}
                          onChangeText={(text) => {
                            setReason(text)
                            setValidation(false)
                          }}
                          style={styles.input}
                        />
                        {validation ? (
                          <Text accessibilityRole='alert' style={styles.error}>
                            {t('manager.live.reasonRequired')}
                          </Text>
                        ) : null}
                      </>
                    ) : null}
                    <View style={styles.actions}>
                      <Pressable
                        accessibilityRole='button'
                        accessibilityState={{ disabled: locked }}
                        disabled={locked}
                        onPress={() => setChoice(undefined)}
                        style={[styles.outline, locked && styles.disabled]}
                      >
                        <Text style={styles.link}>{t('requests.cancel')}</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole='button'
                        accessibilityState={{ disabled: locked || !canDecide, busy: decision.isPending }}
                        disabled={locked || !canDecide}
                        onPress={confirm}
                        style={[styles.primary, (locked || !canDecide) && styles.disabled]}
                      >
                        <Text style={styles.primaryText}>{t('manager.live.confirm')}</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function formatDate(value: string, locale: string, fallback: string) {
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

function formatCost(value: { amount: string; currency: string } | null, locale: string) {
  if (!value || !/^[A-Z]{3}$/.test(value.currency) || !/^\d{1,12}(\.\d{1,2})?$/.test(value.amount)) return undefined
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(Number(value.amount))
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: mobileColors.background },
  content: { padding: 16, paddingBottom: 30, gap: 14 },
  action: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  link: { color: mobileColors.primaryInk, fontWeight: '700' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headingCopy: { flex: 1, gap: 5 },
  kicker: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  title: { color: mobileColors.foreground, fontSize: 25, fontWeight: '700' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: mobileColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 9
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: mobileColors.foreground, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  label: { color: mobileColors.muted, fontSize: 12, marginTop: 4 },
  value: { color: mobileColors.foreground, fontSize: 14, lineHeight: 20 },
  muted: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 },
  error: { color: mobileColors.danger, fontSize: 13, lineHeight: 19 },
  success: { color: mobileColors.success, fontSize: 13, lineHeight: 19 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  outline: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: mobileColors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  primary: {
    minHeight: 48,
    backgroundColor: mobileColors.primary,
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  primaryText: { color: mobileColors.white, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  input: {
    minHeight: 90,
    borderColor: mobileColors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: mobileColors.foreground,
    textAlignVertical: 'top'
  },
  confirm: { borderTopWidth: 1, borderTopColor: mobileColors.border, paddingTop: 12, gap: 10 }
})
