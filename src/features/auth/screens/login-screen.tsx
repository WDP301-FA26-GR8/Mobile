import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSession } from '@/shared/api/session-context'
import { InvalidApiOriginError } from '@/shared/api/secure-origin'
import { useAccountProfile } from '@/shared/api/use-account-profile'

export function LoginScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<'credentials' | 'rateLimit' | 'general' | 'configuration'>()
  const session = useSession()
  const profile = useAccountProfile()

  useEffect(() => {
    if (session.state === 'authenticated' && profile.data && !profile.isError) {
      router.replace(profile.data.roles.includes('MANAGER') ? '/live-need-approvals' : '/my-software')
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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <View style={styles.brandMark}>
          <Text style={styles.brandInitial}>{t('common.brandInitial')}</Text>
        </View>
        <Text style={styles.brand}>{t('common.brandName')}</Text>
        <Text accessibilityRole='header' style={styles.title}>
          {t('auth.loginTitle')}
        </Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              accessibilityLabel={t('auth.email')}
              autoCapitalize='none'
              autoComplete='email'
              keyboardType='email-address'
              onChangeText={setEmail}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor='#a89c91'
              style={styles.input}
              value={email}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <TextInput
              accessibilityLabel={t('auth.password')}
              autoComplete='password'
              onChangeText={setPassword}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor='#a89c91'
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          <Text style={styles.forgotLabel}>{t('auth.recoveryUnavailable')}</Text>
          {error || session.restoreFailed ? (
            <Text accessibilityRole='alert' style={styles.forgotLabel}>
              {error ? t(`auth.errors.${error}`) : t('auth.errors.restore')}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole='button'
            accessibilityState={{ disabled: busy || session.state === 'loading', busy }}
            disabled={busy || session.state === 'loading'}
            onPress={() => void submit()}
            style={styles.loginButton}
          >
            <Text style={styles.loginLabel}>
              {busy || session.state === 'loading' ? t('auth.loading') : t('auth.login')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  brand: {
    color: '#a33700',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginTop: 16,
    textAlign: 'center'
  },
  brandInitial: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '800'
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ff7020',
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    width: 64
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 36
  },
  field: {
    gap: 8
  },
  forgotLabel: {
    color: '#a33700',
    fontSize: 13,
    fontWeight: '600'
  },
  form: {
    gap: 18,
    marginTop: 32
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#eaded2',
    borderRadius: 14,
    borderWidth: 1,
    color: '#241c18',
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 15
  },
  label: {
    color: '#514239',
    fontSize: 13,
    fontWeight: '600'
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#ff7020',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 4
  },
  loginLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  safeArea: {
    backgroundColor: '#fef7ef',
    flex: 1
  },
  title: {
    color: '#241c18',
    fontSize: 25,
    fontWeight: '700',
    marginTop: 30,
    textAlign: 'center'
  }
})
