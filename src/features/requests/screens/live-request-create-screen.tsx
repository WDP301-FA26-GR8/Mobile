import { type NavigationAction, useNavigation, usePreventRemove } from '@react-navigation/native'
import { type Href, Redirect, useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { SoftwareIcon } from '@/entities/software'
import type { RequestablePlanPageResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/requestable-software'
import { mayCreateRequest } from '@/shared/api/request-eligibility'
import { useSession } from '@/shared/api/session-context'
import { useAccountProfile } from '@/shared/api/use-account-profile'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { PreferenceSwitches } from '@/shared/ui/preference-switches'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { RequestCatalog } from '../components/request-catalog'
import { RequestPreview } from '../components/request-preview'
import { useLiveRequestCreate } from '../hooks/use-live-request-create'

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

function submitRejection(error: unknown) {
  if (typeof error !== 'object' || error === null || !('status' in error) || !('info' in error)) return undefined
  const info = error.info
  if (typeof info !== 'object' || info === null || !('error' in info)) return undefined
  const detail = info.error
  if (typeof detail !== 'object' || detail === null || !('code' in detail)) return undefined
  if (error.status === 409) {
    switch (detail.code) {
      case 'ACCESS_REQUEST.ALREADY_HOLDS_ACCESS':
        return 'existingAccess'
      case 'ACCESS_REQUEST.OPEN_REQUEST_EXISTS':
        return 'openRequest'
      case 'FINANCE.SETUP_INCOMPLETE':
        return 'costCenter'
      case 'ACCESS_REQUEST.APPLICATION_RETIRED':
      case 'ACCESS_REQUEST.NO_DEPARTMENT':
        return detail.code === 'ACCESS_REQUEST.NO_DEPARTMENT' ? 'department' : 'plan'
    }
  }
  if (error.status === 404 && detail.code === 'ACCESS_REQUEST.PLAN_NOT_FOUND') return 'plan'
  if (error.status === 403 && detail.code === 'ACCESS_REQUEST.SUPER_ADMIN_CANNOT_REQUEST') return 'ineligible'
  if (error.status === 422) {
    switch (detail.code) {
      case 'ACCESS_REQUEST.OPEN_LIMIT_REACHED':
        return 'limit'
      case 'REQUEST_PARTY.INELIGIBLE':
        return 'ineligible'
      case 'ACCESS_REQUEST.TERM_REQUIRED':
      case 'ACCESS_REQUEST.TERM_MONTHS_OUT_OF_RANGE':
      case 'ACCESS_REQUEST.TERM_NOT_ASKED':
      case 'ACCESS_REQUEST.TERM_LONG_TERM_NOT_ALLOWED':
      case 'ACCESS_REQUEST.TERM_CONTRACT_ENDED':
        return 'term'
      case 'VALIDATION_ERROR':
        return 'invalid'
    }
  }
  return undefined
}

function submitConflictId(error: unknown, rejection: string | undefined) {
  if (rejection !== 'openRequest' && rejection !== 'existingAccess') return undefined
  if (typeof error !== 'object' || error === null || !('info' in error)) return undefined
  const info = error.info
  if (typeof info !== 'object' || info === null || !('error' in info)) return undefined
  const detail = info.error
  if (typeof detail !== 'object' || detail === null || !('details' in detail)) return undefined
  const fields = detail.details
  if (typeof fields !== 'object' || fields === null) return undefined
  let id: unknown
  if (rejection === 'openRequest' && 'requestId' in fields) id = fields.requestId
  if (rejection === 'existingAccess' && 'assignment' in fields) {
    const assignment = fields.assignment
    if (typeof assignment === 'object' && assignment !== null && 'assignmentId' in assignment)
      id = assignment.assignmentId
  }
  return typeof id === 'string' && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
    ? id
    : undefined
}

export function LiveRequestCreateScreen({ initialApplication }: { initialApplication?: { id: string; name: string } }) {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()
  const session = useSession()
  const profile = useAccountProfile()
  const [hasSearch, setHasSearch] = useState(false)
  const [selected, setSelected] = useState<RequestablePlanPageResponseDtoDataItemsItem>()
  const [term, setTerm] = useState('')
  const [reason, setReason] = useState('')
  const [validation, setValidation] = useState(false)
  const [destination, setDestination] = useState<Href>()
  const [pendingAction, setPendingAction] = useState<NavigationAction>()
  const [exitApp, setExitApp] = useState(false)
  const [choosing, setChoosing] = useState(true)
  const sent = useRef(false)
  const allowRemoval = useRef(false)
  const scroll = useRef<ScrollView>(null)
  const permitted = !profile.isError && mayCreateRequest(profile.data)
  const { preview, submit } = useLiveRequestCreate()
  const dirty = !!selected || hasSearch || !!reason || !!term
  const inFlight = submit.isPending || (sent.current && !submit.isError && !submit.isSuccess)
  usePreventRemove(session.state === 'authenticated' && (dirty || inFlight), ({ data }) => {
    if (allowRemoval.current) navigation.dispatch(data.action)
    else if (!inFlight && !(sent.current && !submit.isError && !submit.isSuccess)) setPendingAction(data.action)
  })
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (session.state !== 'authenticated') return false
        if (inFlight || (sent.current && !submit.isError && !submit.isSuccess)) return true
        if (router.canGoBack() || !dirty) return false
        setExitApp(true)
        return true
      })
      return () => subscription.remove()
    }, [dirty, inFlight, router, session.state, submit.isError, submit.isSuccess])
  )
  const type = selected?.provisioningType
  const asksTerm = type === 'K1' || type === 'K2' || type === 'K5'
  const termMonths = term ? Number(term) : undefined
  const validTerm =
    type === 'K4' ||
    (asksTerm &&
      ((!term && type !== 'K1') ||
        (termMonths !== undefined &&
          /^\d+$/.test(term) &&
          Number.isSafeInteger(termMonths) &&
          termMonths >= 1 &&
          termMonths <= (type === 'K1' ? 9 : 12))))
  const valid = validTerm && reason.trim().length > 0 && reason.trim().length <= 1000
  const currentPreview =
    preview.data &&
    selected &&
    preview.data.input.planId === selected.id &&
    (preview.data.input.termMonths ?? undefined) === termMonths &&
    preview.data.reason === reason.trim()
      ? preview.data.preview
      : undefined
  const canSend =
    !!currentPreview?.canSubmit &&
    !currentPreview.termRefusal &&
    !currentPreview.existingAccess &&
    !currentPreview.blockedBy &&
    !currentPreview.limits.refusal

  if (session.state === 'anonymous') return <Redirect href='/' />
  if (!permitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text accessibilityRole={profile.isError || profile.data ? 'alert' : 'progressbar'} style={styles.error}>
            {profile.isError
              ? t('account.error')
              : profile.data
                ? t('requests.createLive.ineligible')
                : t('account.loading')}
          </Text>
          {profile.isError ? (
            <Pressable accessibilityRole='button' onPress={() => void profile.refetch()} style={styles.action}>
              <Text style={styles.actionText}>{t('account.retry')}</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole='button' onPress={() => router.replace('/home')} style={styles.action}>
            <Text style={styles.actionText}>{t('navigation.home')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }
  const locked = inFlight || submit.isError || submit.isSuccess
  const rejection = submit.isError ? submitRejection(submit.error) : undefined
  const conflictId = submit.isError ? submitConflictId(submit.error, rejection) : undefined
  function review() {
    if (!selected || !valid) {
      setValidation(true)
      return
    }
    setValidation(false)
    preview.mutate({
      body: { planId: selected.id, ...(termMonths === undefined ? {} : { termMonths }) },
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
        ...(termMonths === undefined ? {} : { termMonths })
      },
      {
        onSuccess: (id) => {
          allowRemoval.current = true
          router.replace({ pathname: '/live-requests/[requestId]', params: { requestId: id } })
        }
      }
    )
  }
  function navigateTo(target: Href) {
    if (inFlight || (sent.current && !submit.isError && !submit.isSuccess)) return
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
          accessibilityState={{ disabled: inFlight }}
          disabled={inFlight}
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
          <PreferenceSwitches />
        </View>
        {locked ? (
          <View>
            <Text accessibilityRole='alert' style={styles.error}>
              {submit.isError
                ? rejection
                  ? t(`requests.createLive.submitRejected.${rejection}`)
                  : t('requests.createLive.submitUncertain')
                : t('requests.createLive.sending')}
            </Text>
            {conflictId && rejection === 'openRequest' ? (
              <Pressable
                accessibilityRole='button'
                onPress={() =>
                  navigateTo({ pathname: '/live-requests/[requestId]', params: { requestId: conflictId } })
                }
                style={styles.action}
              >
                <Text style={styles.actionText}>{t('requests.createLive.reviewDetails.openRequest')}</Text>
              </Pressable>
            ) : null}
            {conflictId && rejection === 'existingAccess' ? (
              <Pressable
                accessibilityRole='button'
                onPress={() =>
                  navigateTo({ pathname: '/my-software/[softwareId]', params: { softwareId: conflictId } })
                }
                style={styles.action}
              >
                <Text style={styles.actionText}>{t('requests.createLive.reviewDetails.openAccess')}</Text>
              </Pressable>
            ) : null}
            {rejection ? (
              <Pressable
                accessibilityRole='button'
                onPress={() => {
                  sent.current = false
                  submit.reset()
                  preview.reset()
                }}
                style={styles.action}
              >
                <Text style={styles.actionText}>{t('requests.createLive.recheckRejected')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {!selected || choosing ? (
          <>
            {selected ? (
              <Pressable accessibilityRole='button' onPress={() => setChoosing(false)} style={styles.action}>
                <Text style={styles.actionText}>{t('requests.createLive.keepPlan')}</Text>
              </Pressable>
            ) : null}
            <RequestCatalog
              initialApplication={initialApplication}
              onSearchChange={setHasSearch}
              onSelect={(plan) => {
                if (locked) return
                setHasSearch(false)
                setSelected(plan)
                setTerm('')
                setChoosing(false)
                scroll.current?.scrollTo({ y: 0, animated: true })
                preview.reset()
              }}
            />
          </>
        ) : null}
        {selected && !choosing ? (
          <View style={styles.card}>
            {!currentPreview ? (
              <>
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
                {asksTerm ? (
                  <>
                    <Text style={styles.label}>
                      {t(type === 'K1' ? 'requests.createLive.termRequired' : 'requests.createLive.termOptional')}
                    </Text>
                    <TextInput
                      accessibilityLabel={t(
                        type === 'K1' ? 'requests.createLive.termRequired' : 'requests.createLive.termOptional'
                      )}
                      keyboardType='number-pad'
                      value={term}
                      maxLength={2}
                      editable={!locked}
                      onChangeText={(value) => {
                        setTerm(value)
                        preview.reset()
                      }}
                      style={styles.input}
                    />
                  </>
                ) : type !== 'K4' ? (
                  <Text accessibilityRole='alert' style={styles.error}>
                    {t('requests.createLive.unsupportedType')}
                  </Text>
                ) : null}
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
              </>
            ) : null}
            {currentPreview ? (
              <View style={styles.review}>
                <RequestPreview
                  preview={currentPreview}
                  reason={reason.trim()}
                  isOneTime={type === 'K4'}
                  onOpenAccess={(id) =>
                    navigateTo({ pathname: '/my-software/[softwareId]', params: { softwareId: id } })
                  }
                  onOpenRequest={(id) =>
                    navigateTo({ pathname: '/live-requests/[requestId]', params: { requestId: id } })
                  }
                />
                <Text style={styles.muted}>
                  {canSend ? t('requests.createLive.canSubmit') : t('requests.createLive.cannotSubmit')}
                </Text>
                {currentPreview.blockedBy ? (
                  <Text style={styles.error}>
                    {currentPreview.blockedBy.reason === 'SPENDING_APPROVER'
                      ? t('requests.createLive.reviewDetails.blockedSpending')
                      : currentPreview.blockedBy.reason === 'UNPLACED'
                        ? t('requests.createLive.reviewDetails.blockedUnplaced')
                        : t('requests.createLive.blockedCode', { reason: currentPreview.blockedBy.reason })}
                  </Text>
                ) : null}
                {currentPreview.existingAccess ? (
                  <Text style={styles.error}>{t('requests.createLive.existingAccess')}</Text>
                ) : null}
                {currentPreview.termRefusal ? (
                  <Text style={styles.error}>
                    {t(`requests.createLive.termRefusals.${currentPreview.termRefusal}`)}
                  </Text>
                ) : null}
                {currentPreview.limits.refusal ? (
                  <Text style={styles.error}>{t(`requests.createLive.refusals.${currentPreview.limits.refusal}`)}</Text>
                ) : null}
                {currentPreview.spendSubmission === 'BLOCKED_UNTIL_PRICED' ? (
                  <Text style={styles.error}>{t('requests.createLive.pricingBlocked')}</Text>
                ) : null}
                <Pressable
                  accessibilityRole='button'
                  disabled={locked}
                  accessibilityState={{ disabled: locked }}
                  onPress={() => preview.reset()}
                  style={styles.action}
                >
                  <Text style={styles.actionText}>{t('requests.createLive.reviewDetails.edit')}</Text>
                </Pressable>
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
            disabled: inFlight,
            accessibilityLabel: t('navigation.openTab', { tab: t('navigation.software') }),
            onPress: () => navigateTo('/my-software')
          },
          {
            id: 'create',
            label: t('navigation.createRequest'),
            icon: 'plus-circle',
            selected: true,
            disabled: inFlight,
            accessibilityLabel: t('navigation.openTab', { tab: t('navigation.createRequest') })
          },
          {
            id: 'requests',
            label: t('navigation.requests'),
            icon: 'clock',
            selected: false,
            disabled: inFlight,
            accessibilityLabel: t('navigation.openTab', { tab: t('navigation.requests') }),
            onPress: () => navigateTo('/live-requests')
          },
          {
            id: 'inbox',
            label: t('navigation.inbox'),
            icon: 'bell',
            selected: false,
            disabled: inFlight,
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
