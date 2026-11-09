import { useQuery } from '@tanstack/react-query'
import { Redirect } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { meGet, meSoftwareRightList } from '@/shared/api/generated/api/me/me'
import { MySoftwarePageResponseDtoDataItemsItemStatus } from '@/shared/api/generated/contracts/me'
import { useSession } from '@/shared/api/session-context'
import { mobileColors } from '@/shared/theme/colors'
import { EmployeeProfileHeader } from '@/shared/ui/employee-profile-header'

export function MySoftwareScreen() {
  const { t, i18n } = useTranslation()
  const session = useSession()
  const [page, setPage] = useState(1)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(false)
  const enabled = session.state === 'authenticated'
  const profile = useQuery({
    queryKey: ['session', 'me'],
    enabled,
    queryFn: () =>
      session.read(async (token) => {
        const result = await meGet({ headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing account response data')
        return result.data.data
      })
  })
  const software = useQuery({
    queryKey: ['session', 'software', page],
    enabled,
    queryFn: ({ signal }) =>
      session.read(async (token) => {
        const result = await meSoftwareRightList(
          { view: 'current', page, pageSize: 20 },
          { signal, headers: { Authorization: `Bearer ${token}` } }
        )
        if (!result.data.data) throw new Error('Missing software response data')
        return result.data.data
      })
  })

  function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00Z`)
    return Number.isNaN(date.getTime())
      ? t('licenses.live.dateUnavailable')
      : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
  }

  async function logout() {
    if (loggingOut) return
    setLogoutError(false)
    setLoggingOut(true)
    try {
      await session.logout()
    } catch {
      setLogoutError(true)
    } finally {
      setLoggingOut(false)
    }
  }

  if (session.state === 'anonymous') return <Redirect href='/' />

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {profile.data ? (
          <EmployeeProfileHeader
            initials={profile.data.employee.fullName.trim().slice(0, 1).toLocaleUpperCase()}
            name={profile.data.employee.fullName}
            meta={profile.data.employee.department?.name ?? t('licenses.live.noDepartment')}
          />
        ) : null}
        <View style={styles.heading}>
          <Text style={styles.kicker}>{t('licenses.kicker')}</Text>
          <Text accessibilityRole='header' style={styles.title}>
            {t('licenses.screenTitle')}
          </Text>
          <Text style={styles.subtitle}>{t('licenses.live.description')}</Text>
        </View>
        {session.state === 'loading' || profile.isLoading || software.isLoading ? (
          <Text accessibilityRole='progressbar'>{t('licenses.live.loading')}</Text>
        ) : null}
        {profile.isError || software.isError ? (
          <View style={styles.card}>
            <Text accessibilityRole='alert'>{t('licenses.live.error')}</Text>
            <Pressable
              accessibilityRole='button'
              onPress={() => {
                if (profile.isError) void profile.refetch()
                if (software.isError) void software.refetch()
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{t('licenses.live.retry')}</Text>
            </Pressable>
            {page > 1 && software.isError ? (
              <Pressable
                accessibilityRole='button'
                onPress={() => setPage((current) => current - 1)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{t('licenses.live.previous')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {software.data ? (
          <>
            <Text style={styles.subtitle}>
              {t('licenses.live.total', { count: software.data.pagination.totalItems })}
            </Text>
            {software.data.items.length === 0 ? (
              <Text>{page === 1 ? t('licenses.live.empty') : t('licenses.live.emptyPage')}</Text>
            ) : null}
            {software.data.items.map((item) => (
              <View key={item.assignmentId} style={styles.card}>
                <Text accessibilityRole='header' style={styles.itemName}>
                  {item.application.name}
                </Text>
                <Text style={styles.subtitle}>{t('licenses.live.plan', { plan: item.plan.name })}</Text>
                <Text style={styles.subtitle}>{t('licenses.live.provisioning', { type: item.provisioningType })}</Text>
                <Text style={styles.status}>
                  {Object.values(MySoftwarePageResponseDtoDataItemsItemStatus).includes(item.status)
                    ? t(`licenses.live.status.${item.status}`)
                    : t('licenses.live.unknownStatus', { status: item.status })}
                </Text>
                {item.expiringSoon ? <Text style={styles.warning}>{t('licenses.live.expiringSoon')}</Text> : null}
                <Text style={styles.subtitle}>
                  {t('licenses.live.start', { date: formatDate(item.effectiveFrom) })}
                </Text>
                {item.expectedEndDate ? (
                  <Text style={styles.subtitle}>
                    {t('licenses.live.end', { date: formatDate(item.expectedEndDate) })}
                  </Text>
                ) : null}
              </View>
            ))}
            <View style={styles.pagination}>
              <Pressable
                accessibilityRole='button'
                accessibilityState={{ disabled: page <= 1 }}
                disabled={page <= 1}
                onPress={() => setPage((current) => current - 1)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{t('licenses.live.previous')}</Text>
              </Pressable>
              <Text>{t('licenses.live.page', { page })}</Text>
              <Pressable
                accessibilityRole='button'
                accessibilityState={{ disabled: page >= software.data.pagination.totalPages }}
                disabled={page >= software.data.pagination.totalPages}
                onPress={() => setPage((current) => current + 1)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{t('licenses.live.next')}</Text>
              </Pressable>
            </View>
          </>
        ) : null}
        <Text style={styles.subtitle}>{t('licenses.live.otherFeatures')}</Text>
        {logoutError ? <Text accessibilityRole='alert'>{t('licenses.live.logoutError')}</Text> : null}
        {enabled ? (
          <Pressable
            accessibilityRole='button'
            accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
            disabled={loggingOut}
            onPress={() => void logout()}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{loggingOut ? t('auth.loading') : t('licenses.live.logout')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: mobileColors.background },
  content: { padding: 20, gap: 16 },
  heading: { gap: 6, marginVertical: 8 },
  kicker: { color: mobileColors.primaryInk, fontSize: 12, fontWeight: '700' },
  title: { color: mobileColors.foreground, fontSize: 26, fontWeight: '700' },
  subtitle: { color: mobileColors.muted, fontSize: 13, lineHeight: 20 },
  card: { backgroundColor: mobileColors.white, borderRadius: 16, padding: 16, gap: 8 },
  itemName: { color: mobileColors.foreground, fontSize: 16, fontWeight: '700' },
  status: { color: mobileColors.primaryInk, fontSize: 13, fontWeight: '600' },
  warning: { color: mobileColors.warning, fontSize: 13 },
  pagination: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  button: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  buttonText: { color: mobileColors.primaryInk, fontWeight: '700' }
})
