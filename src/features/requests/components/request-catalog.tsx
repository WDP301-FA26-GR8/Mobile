import { Feather } from '@expo/vector-icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { SoftwareIcon } from '@/entities/software'
import type { RequestablePlanPageResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/requestable-software'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

import { isNoDepartment, useRequestCatalog } from '../hooks/use-request-catalog'

export function RequestCatalog({
  onSelect,
  onSearchChange
}: {
  onSelect: (plan: RequestablePlanPageResponseDtoDataItemsItem) => void
  onSearchChange: (hasSearch: boolean) => void
}) {
  const { t, i18n } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const [mode, setMode] = useState<'department' | 'applications' | 'plans'>('department')
  const [origin, setOrigin] = useState<'department' | 'applications'>('department')
  const [application, setApplication] = useState<{ id: string; name: string }>()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { department, applications, plans } = useRequestCatalog(mode, search.trim(), page, application?.id)
  const query = mode === 'department' ? department : mode === 'applications' ? applications : plans

  function chooseApplication(id: string, name: string) {
    if (mode === 'plans') return
    setOrigin(mode)
    setApplication({ id, name })
    setMode('plans')
    setPage(1)
  }
  function showApplications() {
    setMode('applications')
    setPage(1)
  }

  return (
    <View style={styles.content}>
      {mode !== 'plans' ? (
        <>
          <TextInput
            accessibilityLabel={t('requests.createLive.catalog.search')}
            value={search}
            maxLength={100}
            placeholder={t('requests.createLive.catalog.searchPlaceholder')}
            placeholderTextColor={colors.muted}
            onChangeText={(value) => {
              setSearch(value)
              onSearchChange(!!value)
              setPage(1)
              if (value) setMode('applications')
            }}
            style={styles.input}
          />
          <View style={styles.tabs}>
            <Pressable
              accessibilityRole='button'
              accessibilityState={{ selected: mode === 'department' }}
              onPress={() => {
                setMode('department')
                setSearch('')
                onSearchChange(false)
                setPage(1)
              }}
              style={styles.action}
            >
              <Text style={styles.link}>{t('requests.createLive.catalog.department')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole='button'
              accessibilityState={{ selected: mode === 'applications' }}
              onPress={showApplications}
              style={styles.action}
            >
              <Text style={styles.link}>{t('requests.createLive.catalog.all')}</Text>
            </Pressable>
          </View>
          {mode === 'department' ? (
            <Text style={styles.muted}>{t('requests.createLive.catalog.departmentHint')}</Text>
          ) : null}
        </>
      ) : (
        <>
          <Pressable
            accessibilityRole='button'
            onPress={() => {
              setMode(origin)
              setPage(1)
            }}
            style={styles.action}
          >
            <Text style={styles.link}>{t('requests.createLive.catalog.backToApps')}</Text>
          </Pressable>
          <Text accessibilityRole='header' style={styles.heading}>
            {t('requests.createLive.catalog.plansFor', { name: application?.name })}
          </Text>
        </>
      )}
      {query.isLoading ? (
        <Text accessibilityRole='progressbar' style={styles.muted}>
          {t('requests.createLive.loading')}
        </Text>
      ) : null}
      {query.isError ? (
        <View style={styles.card}>
          <Text accessibilityRole='alert' style={styles.error}>
            {isNoDepartment(query.error)
              ? t('requests.createLive.previewNoDepartment')
              : t('requests.createLive.catalogError')}
          </Text>
          {!isNoDepartment(query.error) ? (
            <Pressable accessibilityRole='button' onPress={() => void query.refetch()} style={styles.action}>
              <Text style={styles.link}>{t('licenses.live.retry')}</Text>
            </Pressable>
          ) : null}
          {page > 1 ? (
            <Pressable accessibilityRole='button' onPress={() => setPage(page - 1)} style={styles.action}>
              <Text style={styles.link}>{t('licenses.live.previous')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {!query.isError && query.data?.items.length === 0 ? (
        <Text style={styles.muted}>{t(`requests.createLive.catalog.empty.${mode}`)}</Text>
      ) : null}
      {mode === 'department' && !department.isError
        ? department.data?.items.map((item) => (
            <Pressable
              key={item.entryId}
              accessibilityRole='button'
              accessibilityLabel={
                item.planName
                  ? t('requests.createLive.catalog.openSuggestion', { name: item.applicationName, plan: item.planName })
                  : t('requests.createLive.catalog.openApp', { name: item.applicationName })
              }
              onPress={() => chooseApplication(item.applicationId, item.applicationName)}
              style={styles.card}
            >
              <View style={styles.row}>
                <SoftwareIcon name={item.applicationName} />
                <View style={styles.copy}>
                  <Text style={styles.heading}>{item.applicationName}</Text>
                  {item.planName ? (
                    <Text style={styles.muted}>{t('licenses.live.plan', { plan: item.planName })}</Text>
                  ) : null}
                  {item.note ? <Text style={styles.muted}>{item.note}</Text> : null}
                </View>
                <Feather
                  accessibilityElementsHidden
                  importantForAccessibility='no'
                  name='chevron-right'
                  size={20}
                  color={colors.muted}
                />
              </View>
            </Pressable>
          ))
        : null}
      {mode === 'applications' && !applications.isError
        ? applications.data?.items.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole='button'
              accessibilityLabel={t('requests.createLive.catalog.openApp', { name: item.name })}
              onPress={() => chooseApplication(item.id, item.name)}
              style={styles.card}
            >
              <View style={styles.row}>
                <SoftwareIcon name={item.name} />
                <View style={styles.copy}>
                  <Text style={styles.heading}>{item.name}</Text>
                  {item.vendorName ? (
                    <Text style={styles.muted}>
                      {t('requests.createLive.catalog.vendor', { name: item.vendorName })}
                    </Text>
                  ) : null}
                  <Text style={styles.muted}>{item.functionalGroup.name}</Text>
                  <Text style={styles.muted}>
                    {t('requests.createLive.catalog.planCount', { count: numberFormat(item.planCount, i18n.language) })}
                  </Text>
                  <Text style={styles.muted}>
                    {t(item.costsMoney ? 'requests.createLive.catalog.paid' : 'requests.createLive.catalog.free')}
                  </Text>
                  {!item.canSubmit ? (
                    <Text style={styles.error}>
                      {item.submitBlockedReason === 'FINANCE_SETUP_INCOMPLETE'
                        ? t('requests.createLive.previewNoCostCenter')
                        : t('requests.createLive.planBlocked')}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))
        : null}
      {mode === 'plans' && !plans.isError
        ? plans.data?.items.map((plan) => (
            <Pressable
              key={plan.id}
              accessibilityRole='button'
              accessibilityLabel={t('requests.createLive.choosePlan', { app: plan.application.name, plan: plan.name })}
              onPress={() => onSelect(plan)}
              style={styles.card}
            >
              <Text style={styles.heading}>{plan.name}</Text>
              <Text style={styles.muted}>{t('licenses.live.provisioning', { type: plan.provisioningType })}</Text>
              <Text style={styles.muted}>{t(`requests.createLive.catalog.pricing.${plan.price.status}`)}</Text>
              <Text style={styles.muted}>
                {t(plan.costsMoney ? 'requests.createLive.catalog.paid' : 'requests.createLive.catalog.free')}
              </Text>
              {!plan.canSubmit ? (
                <Text style={styles.error}>
                  {plan.submitBlockedReason === 'FINANCE_SETUP_INCOMPLETE'
                    ? t('requests.createLive.previewNoCostCenter')
                    : t('requests.createLive.planBlocked')}
                </Text>
              ) : null}
            </Pressable>
          ))
        : null}
      {!query.isError && query.data && query.data.pagination.totalPages > 1 ? (
        <View style={styles.pagination}>
          <Pressable
            accessibilityRole='button'
            disabled={page <= 1}
            accessibilityState={{ disabled: page <= 1 }}
            onPress={() => setPage(page - 1)}
            style={[styles.action, page <= 1 && styles.disabled]}
          >
            <Text style={styles.link}>{t('licenses.live.previous')}</Text>
          </Pressable>
          <Text style={styles.muted}>{t('licenses.live.page', { page: numberFormat(page, i18n.language) })}</Text>
          <Pressable
            accessibilityRole='button'
            disabled={page >= query.data.pagination.totalPages}
            accessibilityState={{ disabled: page >= query.data.pagination.totalPages }}
            onPress={() => setPage(page + 1)}
            style={[styles.action, page >= query.data.pagination.totalPages && styles.disabled]}
          >
            <Text style={styles.link}>{t('licenses.live.next')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

function numberFormat(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value)
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    content: { gap: 12 },
    tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
    input: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 14,
      minHeight: 52,
      color: colors.foreground
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 18,
      gap: 7
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    copy: { flex: 1, gap: 4 },
    heading: { color: colors.foreground, fontSize: 16, fontWeight: '700' },
    muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    error: { color: colors.danger, fontSize: 13, lineHeight: 19 },
    link: { color: colors.primaryInk, fontWeight: '700' },
    action: { minHeight: 44, justifyContent: 'center' },
    pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    disabled: { opacity: 0.4 }
  })
