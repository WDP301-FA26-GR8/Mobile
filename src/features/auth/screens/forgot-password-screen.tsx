import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, TextInput } from 'react-native'

import { goBackOr } from '@/shared/lib/go-back-or'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { ErrorReference } from '@/shared/ui/error-reference'

import { AuthFormLayout, authFormStyles } from '../components/auth-form-layout'
import { passwordErrorKey, useRequestPasswordReset } from '../hooks/use-password-actions'

export function ForgotPasswordScreen() {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = authFormStyles(colors)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [empty, setEmpty] = useState(false)
  const request = useRequestPasswordReset()
  const failure = request.isError ? passwordErrorKey(request.error) : undefined

  function submit() {
    if (request.isPending) return
    if (!email.trim()) {
      setEmpty(true)
      return
    }
    setEmpty(false)
    request.mutate(email.trim())
  }

  return (
    <AuthFormLayout
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      onBack={() => goBackOr(router, '/')}
    >
      {request.isSuccess ? (
        <>
          <Text accessibilityRole='summary' style={styles.notice}>
            {t('auth.forgot.sent')}
          </Text>
          <Pressable accessibilityRole='button' onPress={() => router.replace('/')} style={styles.button}>
            <Text style={styles.buttonText}>{t('auth.forgot.backToLogin')}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <TextInput
            accessibilityLabel={t('auth.email')}
            autoCapitalize='none'
            autoComplete='email'
            editable={!request.isPending}
            keyboardType='email-address'
            onChangeText={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={email}
          />
          {empty ? (
            <Text accessibilityRole='alert' style={styles.error}>
              {t('auth.forgot.emailRequired')}
            </Text>
          ) : null}
          {failure ? (
            <>
              <Text accessibilityRole='alert' style={styles.error}>
                {t(failure === 'rateLimit' ? 'auth.errors.rateLimit' : 'auth.errors.general')}
              </Text>
              <ErrorReference error={request.error} />
            </>
          ) : null}
          <Pressable
            accessibilityRole='button'
            accessibilityState={{ disabled: request.isPending, busy: request.isPending }}
            disabled={request.isPending}
            onPress={submit}
            style={[styles.button, request.isPending && styles.disabled]}
          >
            <Text style={styles.buttonText}>{request.isPending ? t('auth.loading') : t('auth.forgot.submit')}</Text>
          </Pressable>
        </>
      )}
    </AuthFormLayout>
  )
}
