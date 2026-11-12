import { Feather } from '@expo/vector-icons'
import { Redirect, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import type { RequestablePlanPageResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/requestable-software'
import { useSession } from '@/shared/api/session-context'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { useLiveRequestCreate } from '../hooks/use-live-request-create'

type Destination = '/my-software' | '/live-requests' | '/live-inbox'

export function LiveRequestCreateScreen() {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const session = useSession()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<RequestablePlanPageResponseDtoDataItemsItem>()
  const [term, setTerm] = useState('12')
  const [reason, setReason] = useState('')
  const [validation, setValidation] = useState(false)
  const [destination, setDestination] = useState<Destination>()
  const sent = useRef(false)
  const { plans, preview, submit } = useLiveRequestCreate(search.trim(), page)
  const months = Number(term)
  const valid =
    /^\d+$/.test(term) &&
    Number.isInteger(months) &&
    months >= 1 &&
    months <= 12 &&
    reason.trim().length > 0 &&
    reason.trim().length <= 1000
  const currentPreview =
    preview.data &&
    selected &&
    preview.data.input.planId === selected.id &&
    preview.data.input.termMonths === months &&
    preview.data.reason === reason.trim()
      ? preview.data.preview
      : undefined

  if (session.state === 'anonymous') return <Redirect href='/' />
  const locked = submit.isPending || submit.isError || submit.isSuccess
  function review() {
    if (!selected || !valid) {
      setValidation(true)
      return
    }
    setValidation(false)
    preview.mutate({ body: { planId: selected.id, termMonths: months }, reason: reason.trim() })
  }
  function send() {
    if (!selected || !valid || !currentPreview?.canSubmit || locked || sent.current) return
    sent.current = true
    submit.mutate(
      { planId: selected.id, termMonths: months, businessReason: reason.trim() },
      {
        onSuccess: (id) => router.replace({ pathname: '/live-requests/[requestId]', params: { requestId: id } })
      }
    )
  }
  function navigateTo(target: Destination) {
    if (submit.isPending) return
    if (selected || search || reason || term !== '12') {
      setDestination(target)
      return
    }
    router.replace(target)
  }
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={styles.content}>
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
            <Text accessibilityRole='header' style={styles.title}>
              {t('requests.createLive.title')}
            </Text>
            <Text style={styles.muted}>{t('requests.createLive.intro')}</Text>
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
        <Text style={styles.label}>{t('requests.createLive.search')}</Text>
        <TextInput
          accessibilityLabel={t('requests.createLive.search')}
          value={search}
          maxLength={100}
          editable={!locked}
          onChangeText={(text) => {
            setSearch(text)
            setPage(1)
          }}
          style={styles.input}
        />
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
            accessibilityLabel={t('requests.createLive.choosePlan', { app: plan.application.name, plan: plan.name })}
            accessibilityState={{ selected: selected?.id === plan.id, disabled: locked }}
            disabled={locked}
            onPress={() => {
              setSelected(plan)
              preview.reset()
            }}
            style={[styles.card, selected?.id === plan.id && styles.selected]}
          >
            <View style={styles.planRow}>
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
        {selected ? (
          <View style={styles.card}>
            <Text style={styles.name}>
              {t('requests.createLive.selected', { app: selected.application.name, plan: selected.name })}
            </Text>
            <Text style={styles.label}>{t('requests.createLive.term')}</Text>
            <TextInput
              accessibilityLabel={t('requests.createLive.term')}
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
                {t('requests.createLive.previewError')}
              </Text>
            ) : null}
            {currentPreview ? (
              <View style={styles.review}>
                <Text style={styles.name}>{t('requests.createLive.review')}</Text>
                <Text style={styles.muted}>
                  {currentPreview.canSubmit
                    ? t('requests.createLive.canSubmit')
                    : t('requests.createLive.cannotSubmit')}
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
                  {t('requests.createLive.maxTerm', {
                    months: new Intl.NumberFormat(i18n.language).format(currentPreview.termLimit.maxMonths)
                  })}
                </Text>
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
                  accessibilityState={{ disabled: !currentPreview.canSubmit || locked }}
                  disabled={!currentPreview.canSubmit || locked}
                  onPress={send}
                  style={[styles.primary, (!currentPreview.canSubmit || locked) && styles.disabled]}
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
      <Modal transparent animationType='fade' visible={!!destination} onRequestClose={() => setDestination(undefined)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.dialog}>
            <Text accessibilityRole='header' style={styles.name}>
              {t('requests.createLive.leaveTitle')}
            </Text>
            <Text style={styles.muted}>{t('requests.createLive.leaveMessage')}</Text>
            <Pressable accessibilityRole='button' onPress={() => setDestination(undefined)} style={styles.primary}>
              <Text style={styles.primaryText}>{t('requests.createLive.leaveCancel')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole='button'
              onPress={() => {
                if (destination) {
                  setDestination(undefined)
                  router.replace(destination)
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
    content: { padding: 16, gap: 12, paddingBottom: 30 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    headerCopy: { flex: 1, minWidth: 0, gap: 4 },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: mobileColors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center'
    },
    planRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { color: mobileColors.foreground, fontSize: 25, fontWeight: '700' },
    muted: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 },
    label: { color: mobileColors.foreground, fontSize: 13, fontWeight: '700' },
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
      borderRadius: 16,
      padding: 16,
      gap: 10
    },
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
