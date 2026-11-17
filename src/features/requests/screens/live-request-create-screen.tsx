import { Feather } from '@expo/vector-icons'
import { type NavigationAction, useNavigation, usePreventRemove } from '@react-navigation/native'
import { Redirect, useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { SoftwareIcon } from '@/entities/software'
import type { RequestablePlanPageResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/requestable-software'
import { useSession } from '@/shared/api/session-context'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { useLiveRequestCreate } from '../hooks/use-live-request-create'

type Destination = '/my-software' | '/live-requests' | '/live-inbox'

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function previewErrorKey(error: unknown) {
  if (typeof error !== 'object' || error === null || !('info' in error)) return 'previewError'
  const info = error.info
  if (typeof info !== 'object' || info === null || !('error' in info)) return 'previewError'
  const detail = info.error
  if (typeof detail !== 'object' || detail === null || !('code' in detail)) return 'previewError'
  switch (detail.code) {
    case 'FINANCE.SETUP_INCOMPLETE':
      return 'previewNoCostCenter'
    case 'ACCESS_REQUEST.NO_DEPARTMENT':
    case 'REQUEST_PARTY.INELIGIBLE':
      return 'previewNoDepartment'
    case 'ACCESS_REQUEST.PLAN_NOT_FOUND':
    case 'ACCESS_REQUEST.APPLICATION_RETIRED':
      return 'previewPlanUnavailable'
    case 'AUTHENTICATION_REQUIRED':
    case 'INVALID_ACCESS_TOKEN':
      return 'previewAuthentication'
    case 'VALIDATION_ERROR':
      return 'previewInvalid'
    default:
      return 'previewError'
  }
}

export function LiveRequestCreateScreen() {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()
  const session = useSession()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<RequestablePlanPageResponseDtoDataItemsItem>()
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [manyPaidReason, setManyPaidReason] = useState('')
  const [validation, setValidation] = useState(false)
  const [destination, setDestination] = useState<Destination>()
  const [pendingAction, setPendingAction] = useState<NavigationAction>()
  const [exitApp, setExitApp] = useState(false)
  const [choosing, setChoosing] = useState(true)
  const sent = useRef(false)
  const allowRemoval = useRef(false)
  const scroll = useRef<ScrollView>(null)
  const { plans, preview, submit } = useLiveRequestCreate(search.trim(), page)
  const dirty = !!selected || !!search || !!reason || !!endDate || !!manyPaidReason
  usePreventRemove(session.state === 'authenticated' && (dirty || submit.isPending), ({ data }) => {
    if (allowRemoval.current) navigation.dispatch(data.action)
    else if (!submit.isPending) setPendingAction(data.action)
  })
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (router.canGoBack() || (!dirty && !submit.isPending)) return false
        if (!submit.isPending) setExitApp(true)
        return true
      })
      return () => subscription.remove()
    }, [dirty, router, submit.isPending])
  )
  const valid = (!endDate || validDate(endDate)) && reason.trim().length > 0 && reason.trim().length <= 1000
  const currentPreview =
    preview.data &&
    selected &&
    preview.data.input.planId === selected.id &&
    (preview.data.input.expectedEndDate ?? '') === endDate &&
    preview.data.reason === reason.trim()
      ? preview.data.preview
      : undefined
  const canSend =
    !!currentPreview?.canSubmit &&
    (!currentPreview.termRequired || !!endDate) &&
    (!endDate || endDate <= currentPreview.maxEndDate) &&
    (!currentPreview.limits.reasonRequired || !!manyPaidReason.trim())

  if (session.state === 'anonymous') return <Redirect href='/' />
  const locked = submit.isPending || submit.isError || submit.isSuccess
  function review() {
    if (!selected || !valid) {
      setValidation(true)
      return
    }
    setValidation(false)
    preview.mutate({
      body: { planId: selected.id, ...(endDate ? { expectedEndDate: endDate } : {}) },
      reason: reason.trim()
    })
  }
  function send() {
    if (!selected || !valid || !canSend || locked || sent.current) return
    sent.current = true
    submit.mutate(
      {
        planId: selected.id,
        businessReason: reason.trim(),
        ...(endDate ? { expectedEndDate: endDate } : {}),
        ...(currentPreview?.limits.reasonRequired ? { manyPaidSoftwareReason: manyPaidReason.trim() } : {})
      },
      {
        onSuccess: (id) => {
          allowRemoval.current = true
          router.replace({ pathname: '/live-requests/[requestId]', params: { requestId: id } })
        }
      }
    )
  }
  function navigateTo(target: Destination) {
    if (submit.isPending) return
    if (dirty) {
      setDestination(target)
      return
    }
    router.replace(target)
  }
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scroll} keyboardShouldPersistTaps='handled' contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole='button'
          accessibilityState={{ disabled: submit.isPending }}
          disabled={submit.isPending}
          onPress={() => navigateTo('/live-requests')}
          style={styles.action}
        >
          <Text style={styles.actionText}>{t('requests.live.back')}</Text>
        </Pressable>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>{t('licenses.live.kicker')}</Text>
            <Text accessibilityRole='header' style={styles.title}>
              {t('requests.createLive.title')}
            </Text>
            <Text style={styles.headerSubtitle}>{t('requests.createLive.intro')}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Feather
              accessibilityElementsHidden
              importantForAccessibility='no'
              name='plus-circle'
              size={22}
              color={mobileColors.primaryInk}
            />
          </View>
        </View>
        {locked ? (
          <Text accessibilityRole='alert' style={styles.error}>
            {submit.isError ? t('requests.createLive.submitUncertain') : t('requests.createLive.sending')}
          </Text>
        ) : null}
        {!selected || choosing ? (
          <>
            <Text style={styles.sectionTitle}>{t('requests.createLive.search')}</Text>
            <View style={styles.searchBox}>
              <Feather
                accessibilityElementsHidden
                importantForAccessibility='no'
                name='search'
                size={19}
                color={mobileColors.primaryInk}
              />
              <TextInput
                accessibilityLabel={t('requests.createLive.search')}
                value={search}
                maxLength={100}
                editable={!locked}
                placeholder={t('requests.createLive.searchPlaceholder')}
                placeholderTextColor={mobileColors.muted}
                onChangeText={(text) => {
                  setSearch(text)
                  setPage(1)
                }}
                style={styles.searchInput}
              />
            </View>
            {selected ? (
              <Pressable accessibilityRole='button' onPress={() => setChoosing(false)} style={styles.action}>
                <Text style={styles.actionText}>{t('requests.createLive.keepPlan')}</Text>
              </Pressable>
            ) : null}
            {session.state === 'loading' || plans.isLoading ? (
              <Text accessibilityRole='progressbar' style={styles.muted}>
                {t('requests.createLive.loading')}
              </Text>
            ) : null}
            {plans.isError ? (
              <View style={styles.card}>
                <Text accessibilityRole='alert' style={styles.error}>
                  {t('requests.createLive.catalogError')}
                </Text>
                <Pressable accessibilityRole='button' onPress={() => void plans.refetch()} style={styles.action}>
                  <Text style={styles.actionText}>{t('licenses.live.retry')}</Text>
                </Pressable>
                {page > 1 ? (
                  <Pressable accessibilityRole='button' onPress={() => setPage(page - 1)} style={styles.action}>
                    <Text style={styles.actionText}>{t('licenses.live.previous')}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {plans.data?.items.length === 0 ? <Text style={styles.muted}>{t('requests.createLive.empty')}</Text> : null}
            {plans.data?.items.map((plan) => (
              <Pressable
                key={plan.id}
                accessibilityRole='button'
                accessibilityLabel={t('requests.createLive.choosePlan', {
                  app: plan.application.name,
                  plan: plan.name
                })}
                accessibilityState={{ selected: selected?.id === plan.id, disabled: locked }}
                disabled={locked}
                onPress={() => {
                  setSelected(plan)
                  setChoosing(false)
                  scroll.current?.scrollTo({ y: 0, animated: true })
                  preview.reset()
                }}
                style={[styles.card, selected?.id === plan.id && styles.selected]}
              >
                <View style={styles.planRow}>
                  <SoftwareIcon name={plan.application.name} />
                  <View style={styles.headerCopy}>
                    <Text style={styles.name}>{plan.application.name}</Text>
                    <Text style={styles.muted}>{t('licenses.live.plan', { plan: plan.name })}</Text>
                  </View>
                  <Feather
                    accessibilityElementsHidden
                    importantForAccessibility='no'
                    name={selected?.id === plan.id ? 'check-circle' : 'circle'}
                    size={22}
                    color={selected?.id === plan.id ? mobileColors.primary : mobileColors.muted}
                  />
                </View>
                {!plan.canSubmit ? <Text style={styles.error}>{t('requests.createLive.planBlocked')}</Text> : null}
              </Pressable>
            ))}
            {plans.data && plans.data.pagination.totalPages > 1 ? (
              <View style={styles.row}>
                <Pressable
                  accessibilityRole='button'
                  accessibilityState={{ disabled: page <= 1 }}
                  disabled={page <= 1}
                  onPress={() => setPage(page - 1)}
                  style={[styles.action, page <= 1 && styles.disabled]}
                >
                  <Text style={styles.actionText}>{t('licenses.live.previous')}</Text>
                </Pressable>
                <Text style={styles.muted}>
                  {t('licenses.live.page', { page: new Intl.NumberFormat(i18n.language).format(page) })}
                </Text>
                <Pressable
                  accessibilityRole='button'
                  accessibilityState={{ disabled: page >= plans.data.pagination.totalPages }}
                  disabled={page >= plans.data.pagination.totalPages}
                  onPress={() => setPage(page + 1)}
                  style={[styles.action, page >= plans.data.pagination.totalPages && styles.disabled]}
                >
                  <Text style={styles.actionText}>{t('licenses.live.next')}</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
        {selected && !choosing ? (
          <View style={styles.card}>
            <Text accessibilityRole='header' style={styles.sectionTitle}>
              {t('requests.createLive.selectedHeading')}
            </Text>
            <View style={styles.planRow}>
              <SoftwareIcon name={selected.application.name} />
              <View style={styles.headerCopy}>
                <Text style={styles.name}>{selected.application.name}</Text>
                <Text style={styles.muted}>{t('licenses.live.plan', { plan: selected.name })}</Text>
              </View>
            </View>
            {!selected.canSubmit ? <Text style={styles.error}>{t('requests.createLive.planBlocked')}</Text> : null}
            <Pressable
              accessibilityRole='button'
              disabled={locked}
              accessibilityState={{ disabled: locked }}
              onPress={() => setChoosing(true)}
              style={styles.action}
            >
              <Text style={styles.actionText}>{t('requests.createLive.changePlan')}</Text>
            </Pressable>
            <View style={styles.divider} />
            <Text style={styles.label}>{t('requests.createLive.endDate')}</Text>
            <TextInput
              accessibilityLabel={t('requests.createLive.endDate')}
              placeholder={t('requests.createLive.endDatePlaceholder')}
              placeholderTextColor={mobileColors.muted}
              keyboardType='numbers-and-punctuation'
              value={endDate}
              maxLength={10}
              editable={!locked}
              onChangeText={(value) => {
                setEndDate(value)
                preview.reset()
              }}
              style={styles.input}
            />
            <Text style={styles.label}>{t('requests.createLive.reason')}</Text>
            <TextInput
              accessibilityLabel={t('requests.createLive.reason')}
              multiline
              value={reason}
              maxLength={1000}
              editable={!locked}
              onChangeText={(value) => {
                setReason(value)
                preview.reset()
              }}
              style={[styles.input, styles.reason]}
            />
            {validation ? (
              <Text accessibilityRole='alert' style={styles.error}>
                {t('requests.createLive.validation')}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole='button'
              accessibilityState={{ disabled: locked || preview.isPending }}
              disabled={locked || preview.isPending}
              onPress={review}
              style={styles.primary}
            >
              <Text style={styles.primaryText}>{t('requests.createLive.preview')}</Text>
            </Pressable>
            {preview.isPending ? (
              <Text accessibilityRole='progressbar' style={styles.muted}>
                {t('requests.createLive.previewLoading')}
              </Text>
            ) : null}
            {preview.isError ? (
              <Text accessibilityRole='alert' style={styles.error}>
                {t(`requests.createLive.${previewErrorKey(preview.error)}`)}
              </Text>
            ) : null}
            {currentPreview ? (
              <View style={styles.review}>
                <Text style={styles.name}>{t('requests.createLive.review')}</Text>
                <Text style={styles.muted}>
                  {canSend ? t('requests.createLive.canSubmit') : t('requests.createLive.cannotSubmit')}
                </Text>
                {currentPreview.blockedBy ? (
                  <Text style={styles.error}>
                    {t('requests.createLive.blockedCode', { reason: currentPreview.blockedBy.reason })}
                  </Text>
                ) : null}
                {currentPreview.existingAccess ? (
                  <Text style={styles.error}>{t('requests.createLive.existingAccess')}</Text>
                ) : null}
                <Text style={styles.muted}>
                  {t('requests.createLive.maxEndDate', {
                    date: validDate(currentPreview.maxEndDate)
                      ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeZone: 'UTC' }).format(
                          new Date(`${currentPreview.maxEndDate}T00:00:00.000Z`)
                        )
                      : t('licenses.live.dateUnavailable')
                  })}
                </Text>
                {currentPreview.termRequired && !endDate ? (
                  <Text style={styles.error}>{t('requests.createLive.endDateRequired')}</Text>
                ) : null}
                {endDate && endDate > currentPreview.maxEndDate ? (
                  <Text style={styles.error}>{t('requests.createLive.endDateTooLate')}</Text>
                ) : null}
                {currentPreview.limits.refusal ? (
                  <Text style={styles.error}>{t(`requests.createLive.refusals.${currentPreview.limits.refusal}`)}</Text>
                ) : null}
                {currentPreview.limits.reasonRequired ? (
                  <>
                    <Text style={styles.label}>{t('requests.createLive.manyPaidReason')}</Text>
                    <TextInput
                      accessibilityLabel={t('requests.createLive.manyPaidReason')}
                      multiline
                      value={manyPaidReason}
                      maxLength={1000}
                      editable={!locked}
                      onChangeText={setManyPaidReason}
                      style={[styles.input, styles.reason]}
                    />
                  </>
                ) : null}
                {currentPreview.spendSubmission === 'BLOCKED_UNTIL_PRICED' ? (
                  <Text style={styles.error}>{t('requests.createLive.pricingBlocked')}</Text>
                ) : null}
                <Text style={styles.muted}>
                  {t('requests.createLive.expectedDays', {
                    days: new Intl.NumberFormat(i18n.language).format(currentPreview.totalExpectedWorkingDays)
                  })}
                </Text>
                <Pressable
                  accessibilityRole='button'
                  accessibilityState={{ disabled: !canSend || locked }}
                  disabled={!canSend || locked}
                  onPress={send}
                  style={[styles.primary, (!canSend || locked) && styles.disabled]}
                >
                  <Text style={styles.primaryText}>{t('requests.createLive.submit')}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
      <MobileTabBar
        accessibilityLabel={t('navigation.tabs')}
        tabs={[
          {
            id: 'software',
            label: t('navigation.software'),
            icon: 'grid',
            selected: false,
            disabled: submit.isPending,
            accessibilityLabel: t('navigation.openTab', { tab: t('navigation.software') }),
            onPress: () => navigateTo('/my-software')
          },
          {
            id: 'create',
            label: t('navigation.createRequest'),
            icon: 'plus-circle',
            selected: true,
            disabled: submit.isPending,
            accessibilityLabel: t('navigation.openTab', { tab: t('navigation.createRequest') })
          },
          {
            id: 'requests',
            label: t('navigation.requests'),
            icon: 'clock',
            selected: false,
            disabled: submit.isPending,
            accessibilityLabel: t('navigation.openTab', { tab: t('navigation.requests') }),
            onPress: () => navigateTo('/live-requests')
          },
          {
            id: 'inbox',
            label: t('navigation.inbox'),
            icon: 'bell',
            selected: false,
            disabled: submit.isPending,
            accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
            onPress: () => navigateTo('/live-inbox')
          }
        ]}
      />
      <Modal
        transparent
        animationType='fade'
        visible={!!destination || !!pendingAction || exitApp}
        onRequestClose={() => {
          setDestination(undefined)
          setPendingAction(undefined)
          setExitApp(false)
        }}
      >
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.dialog}>
            <Text accessibilityRole='header' style={styles.name}>
              {t('requests.createLive.leaveTitle')}
            </Text>
            <Text style={styles.muted}>{t('requests.createLive.leaveMessage')}</Text>
            <Pressable
              accessibilityRole='button'
              onPress={() => {
                setDestination(undefined)
                setPendingAction(undefined)
                setExitApp(false)
              }}
              style={styles.primary}
            >
              <Text style={styles.primaryText}>{t('requests.createLive.leaveCancel')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole='button'
              onPress={() => {
                if (destination) {
                  allowRemoval.current = true
                  setDestination(undefined)
                  router.replace(destination)
                } else if (pendingAction) {
                  navigation.dispatch(pendingAction)
                  setPendingAction(undefined)
                } else if (exitApp) {
                  setExitApp(false)
                  BackHandler.exitApp()
                }
              }}
              style={styles.dialogAction}
            >
              <Text style={styles.actionText}>{t('requests.createLive.leaveConfirm')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const createStyles = (mobileColors: MobileColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: mobileColors.background },
    content: { padding: 20, gap: 12, paddingBottom: 30 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
      padding: 20,
      borderRadius: 22,
      backgroundColor: mobileColors.primarySoft
    },
    headerCopy: { flex: 1, minWidth: 0, gap: 4 },
    kicker: {
      color: mobileColors.primaryInk,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase'
    },
    sectionTitle: { color: mobileColors.foreground, fontSize: 16, fontWeight: '700' },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: mobileColors.surface,
      alignItems: 'center',
      justifyContent: 'center'
    },
    planRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { color: mobileColors.foreground, fontSize: 25, fontWeight: '700' },
    headerSubtitle: { color: mobileColors.foreground, fontSize: 13, lineHeight: 19 },
    muted: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 },
    label: { color: mobileColors.foreground, fontSize: 13, fontWeight: '700' },
    searchBox: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: mobileColors.border,
      borderRadius: 16,
      backgroundColor: mobileColors.surface,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10
    },
    searchInput: { flex: 1, minWidth: 0, minHeight: 48, color: mobileColors.foreground },
    input: {
      backgroundColor: mobileColors.white,
      borderColor: mobileColors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      minHeight: 44,
      color: mobileColors.foreground
    },
    reason: { minHeight: 90, textAlignVertical: 'top' },
    card: {
      backgroundColor: mobileColors.white,
      borderColor: mobileColors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 18,
      gap: 10
    },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: mobileColors.border },
    selected: { borderColor: mobileColors.primary, borderWidth: 2 },
    name: { color: mobileColors.foreground, fontSize: 16, fontWeight: '700' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    action: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    actionText: { color: mobileColors.primaryInk, fontWeight: '700' },
    primary: {
      backgroundColor: mobileColors.primary,
      borderRadius: 12,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12
    },
    primaryText: { color: mobileColors.onPrimary, fontWeight: '700' },
    disabled: { opacity: 0.4 },
    review: { gap: 9, borderTopColor: mobileColors.border, borderTopWidth: 1, paddingTop: 12 },
    error: { color: mobileColors.danger, fontSize: 13, lineHeight: 19 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(36, 28, 24, 0.55)', justifyContent: 'center', padding: 24 },
    dialog: { backgroundColor: mobileColors.white, borderRadius: 20, padding: 22, gap: 14 },
    dialogAction: { minHeight: 48, alignItems: 'center', justifyContent: 'center' }
  })
