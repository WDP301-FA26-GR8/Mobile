import { Feather } from '@expo/vector-icons'
import { Redirect, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/shared/api/session-context'
import { useAccountProfile } from '@/shared/api/use-account-profile'
import { goBackOr } from '@/shared/lib/go-back-or'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

export function AccountProfileScreen() {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const router = useRouter()
  const session = useSession()
  const profile = useAccountProfile()
  const account = !profile.isError && session.state === 'authenticated' ? profile.data : undefined

  if (session.state === 'anonymous') return <Redirect href='/' />

  const fields = account
    ? [
        { label: t('account.name'), value: account.employee.fullName },
        { label: t('account.email'), value: account.loginEmail },
        { label: t('account.employeeCode'), value: account.employee.employeeCode },
        { label: t('account.department'), value: account.employee.department?.name },
        { label: t('account.jobTitle'), value: account.employee.jobTitle },
        ...(account.roles.includes('MANAGER')
          ? [{ label: t('account.managerScope'), value: account.managerScope?.departmentName }]
          : [])
      ]
    : []

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel={t('common.back')}
          onPress={() => goBackOr(router, '/')}
          style={styles.back}
        >
          <Feather
            accessibilityElementsHidden
            importantForAccessibility='no'
            name='arrow-left'
            size={20}
            color={colors.foreground}
          />
          <Text style={styles.backText}>{t('common.back')}</Text>
        </Pressable>
        <View style={styles.heading}>
          <Text accessibilityRole='header' style={styles.title}>
            {t('account.title')}
          </Text>
          <Text style={styles.subtitle}>{t('account.subtitle')}</Text>
        </View>
        {session.state === 'loading' || profile.isLoading ? (
          <Text accessibilityRole='progressbar' style={styles.subtitle}>
            {t('account.loading')}
          </Text>
        ) : null}
        {profile.isError ? (
          <View style={styles.card}>
            <Text accessibilityRole='alert' style={styles.error}>
              {t('account.error')}
            </Text>
            <Pressable accessibilityRole='button' onPress={() => void profile.refetch()} style={styles.retry}>
              <Text style={styles.retryText}>{t('account.retry')}</Text>
            </Pressable>
          </View>
        ) : null}
        {account ? (
          <>
            <View style={styles.hero}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{account.employee.fullName.trim().slice(0, 1).toLocaleUpperCase()}</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroName}>{account.employee.fullName}</Text>
                <Text style={styles.heroMeta}>{account.employee.jobTitle || t('account.noValue')}</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text accessibilityRole='header' style={styles.cardTitle}>
                {t('account.details')}
              </Text>
              {fields.map((field) => (
                <View key={field.label} style={styles.row}>
                  <Text style={styles.label}>{field.label}</Text>
                  <Text style={styles.value}>{field.value || t('account.noValue')}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 36, gap: 20 },
    back: { alignSelf: 'flex-start', alignItems: 'center', flexDirection: 'row', gap: 8, minHeight: 44 },
    backText: { color: colors.foreground, fontSize: 14, fontWeight: '600' },
    heading: { gap: 5 },
    title: { color: colors.foreground, fontSize: 27, fontWeight: '700', letterSpacing: -0.5 },
    subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 20,
      borderRadius: 20,
      backgroundColor: colors.primarySoft
    },
    avatar: {
      width: 58,
      height: 58,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center'
    },
    initials: { color: colors.primaryInk, fontSize: 23, fontWeight: '700' },
    heroCopy: { flex: 1, minWidth: 0, gap: 4 },
    heroName: { color: colors.foreground, fontSize: 19, fontWeight: '700' },
    heroMeta: { color: colors.foreground, fontSize: 14, lineHeight: 20 },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 20
    },
    cardTitle: { color: colors.foreground, fontSize: 16, fontWeight: '700', marginBottom: 4 },
    row: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, gap: 5, paddingVertical: 15 },
    label: { color: colors.muted, fontSize: 13 },
    value: { color: colors.foreground, fontSize: 15, fontWeight: '600', lineHeight: 22 },
    error: { color: colors.danger, fontSize: 14, lineHeight: 21 },
    retry: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: 44, marginTop: 4 },
    retryText: { color: colors.primaryInk, fontWeight: '700' }
  })
