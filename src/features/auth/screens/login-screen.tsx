import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/shared/api/session-context'
import { InvalidApiOriginError } from '@/shared/api/secure-origin'
import { useAccountProfile } from '@/shared/api/use-account-profile'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { PreferenceSwitches } from '@/shared/ui/preference-switches'

export function LoginScreen() {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<'credentials' | 'rateLimit' | 'general' | 'configuration'>()
  const session = useSession()
  const profile = useAccountProfile()

  useEffect(() => {
    if (session.state === 'authenticated' && profile.data && !profile.isError) {
      router.replace('/home')
    }
  }, [router, session.state, profile.data, profile.isError])

  async function submit() {
    if (busy) return
    setError(undefined)
    if (!email.trim() || !password) {
      setError('credentials')
      return
    }
    setBusy(true)
    try {
      await session.login(email.trim(), password)
      setPassword('')
    } catch (failure) {
      const status = typeof failure === 'object' && failure !== null && 'status' in failure ? failure.status : undefined
      setError(
        failure instanceof InvalidApiOriginError
          ? 'configuration'
          : status === 401 || status === 422
            ? 'credentials'
            : status === 429
              ? 'rateLimit'
              : 'general'
      )
    } finally {
      setBusy(false)
    }
  }

  if (session.state === 'authenticated') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text accessibilityRole={profile.isError ? 'alert' : 'progressbar'} style={styles.forgotLabel}>
            {profile.isError ? t('auth.profileError') : t('auth.profileLoading')}
          </Text>
          {profile.isError ? (
            <Pressable accessibilityRole='button' onPress={() => void profile.refetch()} style={styles.loginButton}>
              <Text style={styles.loginLabel}>{t('licenses.live.retry')}</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole='button'
            disabled={busy}
            accessibilityState={{ disabled: busy, busy }}
            onPress={() => {
              setBusy(true)
              setError(undefined)
              void session
                .logout()
                .catch(() => setError('general'))
                .finally(() => setBusy(false))
            }}
            style={styles.loginButton}
          >
            <Text style={styles.loginLabel}>{t('licenses.live.logout')}</Text>
          </Pressable>
          {error ? (
            <Text accessibilityRole='alert' style={styles.forgotLabel}>
              {t('licenses.live.logoutError')}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents='none' style={styles.orbitLarge} />
      <View pointerEvents='none' style={styles.orbitSmall} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
          <View style={styles.toolbar}>
            <PreferenceSwitches />
          </View>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandInitial}>{t('common.brandInitial')}</Text>
            </View>
            <Text style={styles.brand}>{t('common.brandName')}</Text>
          </View>
          <Text accessibilityRole='header' style={styles.title}>
            {t('auth.loginTitle')}
          </Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.email')}</Text>
              <View style={styles.inputRow}>
                <Feather
                  accessibilityElementsHidden
                  color={mobileColors.muted}
                  importantForAccessibility='no'
                  name='mail'
                  size={18}
                />
                <TextInput
                  accessibilityLabel={t('auth.email')}
                  autoCapitalize='none'
                  autoComplete='email'
                  keyboardType='email-address'
                  onChangeText={setEmail}
                  placeholder={t('auth.emailPlaceholder')}
                  placeholderTextColor={mobileColors.muted}
                  style={styles.input}
                  value={email}
                />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.password')}</Text>
              <View style={styles.inputRow}>
                <Feather
                  accessibilityElementsHidden
                  color={mobileColors.muted}
                  importantForAccessibility='no'
                  name='lock'
                  size={18}
                />
                <TextInput
                  accessibilityLabel={t('auth.password')}
                  autoComplete='password'
                  onChangeText={setPassword}
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor={mobileColors.muted}
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={t(passwordVisible ? 'auth.hidePassword' : 'auth.showPassword')}
                  accessibilityRole='button'
                  accessibilityState={{ checked: passwordVisible }}
                  onPress={() => setPasswordVisible((visible) => !visible)}
                  style={styles.eyeButton}
                >
                  <Feather
                    accessibilityElementsHidden
                    color={mobileColors.muted}
                    importantForAccessibility='no'
                    name={passwordVisible ? 'eye-off' : 'eye'}
                    size={20}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable accessibilityRole='button' onPress={() => router.push('/forgot-password')} style={styles.forgot}>
              <Text style={styles.forgotLabel}>{t('auth.forgotPassword')}</Text>
            </Pressable>
            {error || session.restoreFailed ? (
              <Text accessibilityRole='alert' style={styles.errorText}>
                {error ? t(`auth.errors.${error}`) : t('auth.errors.restore')}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole='button'
              accessibilityLabel={t('auth.login')}
              accessibilityState={{ disabled: busy || session.state === 'loading', busy }}
              disabled={busy || session.state === 'loading'}
              onPress={() => void submit()}
              style={[styles.loginButton, (busy || session.state === 'loading') && styles.loginDisabled]}
            >
              <Text style={styles.loginLabel}>
                {busy || session.state === 'loading' ? t('auth.loading') : t('auth.login')}
              </Text>
              {!busy && session.state !== 'loading' ? (
                <Feather
                  accessibilityElementsHidden
                  color={mobileColors.onPrimary}
                  importantForAccessibility='no'
                  name='arrow-right'
                  size={18}
                />
              ) : null}
            </Pressable>
            <Text style={styles.help}>{t('auth.noAccount')}</Text>
          </View>
          <View style={styles.secure}>
            <Feather
              accessibilityElementsHidden
              color={mobileColors.muted}
              importantForAccessibility='no'
              name='shield'
              size={14}
            />
            <Text style={styles.secureText}>{t('auth.secureSession')}</Text>
          </View>
          <Text style={styles.tagline}>{t('auth.tagline')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const createStyles = (mobileColors: MobileColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { backgroundColor: mobileColors.background, flex: 1 },
    orbitLarge: {
      position: 'absolute',
      top: -120,
      right: -140,
      width: 340,
      height: 340,
      borderRadius: 170,
      backgroundColor: mobileColors.primarySoft,
      opacity: 0.7
    },
    orbitSmall: {
      position: 'absolute',
      bottom: -80,
      left: -90,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: mobileColors.primarySoft,
      opacity: 0.5
    },
    content: {
      alignSelf: 'center',
      flexGrow: 1,
      justifyContent: 'center',
      maxWidth: 480,
      paddingHorizontal: 24,
      paddingVertical: 28,
      width: '100%'
    },
    toolbar: { alignItems: 'flex-end', marginBottom: 12 },
    brandRow: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'center' },
    brandMark: {
      alignItems: 'center',
      backgroundColor: mobileColors.primary,
      borderRadius: 14,
      height: 44,
      justifyContent: 'center',
      width: 44
    },
    brandInitial: { color: mobileColors.onPrimary, fontSize: 22, fontWeight: '800' },
    brand: { color: mobileColors.foreground, fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
    title: {
      color: mobileColors.foreground,
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: -0.6,
      marginTop: 28,
      textAlign: 'center'
    },
    subtitle: { color: mobileColors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
    form: {
      backgroundColor: mobileColors.white,
      borderColor: mobileColors.border,
      borderRadius: 24,
      borderWidth: 1,
      elevation: 3,
      gap: 16,
      marginTop: 24,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 18
    },
    field: { gap: 8 },
    label: { color: mobileColors.foreground, fontSize: 13, fontWeight: '600' },
    inputRow: {
      alignItems: 'center',
      backgroundColor: mobileColors.surfaceSubtle,
      borderColor: mobileColors.border,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      minHeight: 52,
      paddingLeft: 14
    },
    input: { color: mobileColors.foreground, flex: 1, fontSize: 15, minHeight: 50, paddingRight: 8 },
    eyeButton: { alignItems: 'center', height: 50, justifyContent: 'center', width: 48 },
    forgot: { alignSelf: 'flex-end', justifyContent: 'center', minHeight: 36 },
    forgotLabel: { color: mobileColors.primaryInk, fontSize: 13, fontWeight: '700' },
    errorText: { color: mobileColors.danger, fontSize: 13, lineHeight: 19 },
    loginButton: {
      alignItems: 'center',
      backgroundColor: mobileColors.primary,
      borderRadius: 14,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      minHeight: 54
    },
    loginDisabled: { opacity: 0.6 },
    loginLabel: { color: mobileColors.onPrimary, fontSize: 16, fontWeight: '800' },
    help: { color: mobileColors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
    secure: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 20 },
    secureText: { color: mobileColors.muted, fontSize: 12 },
    tagline: {
      color: mobileColors.foreground,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 18,
      textAlign: 'center'
    }
  })
