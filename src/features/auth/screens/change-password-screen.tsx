import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text } from 'react-native'

import { useSession } from '@/shared/api/session-context'
import { goBackOr } from '@/shared/lib/go-back-or'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { ErrorReference } from '@/shared/ui/error-reference'

import { AuthFormLayout, authFormStyles } from '../components/auth-form-layout'
import { PasswordField } from '../components/password-field'
import { passwordErrorKey, useChangePassword, validNewPassword } from '../hooks/use-password-actions'

export function ChangePasswordScreen() {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = authFormStyles(colors)
  const router = useRouter()
  const session = useSession()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [validation, setValidation] = useState(false)
  const change = useChangePassword()
  const failure = change.isError ? passwordErrorKey(change.error) : undefined

  if (session.state === 'anonymous' && !change.isSuccess) return <Redirect href='/' />
  if (change.isSuccess) {
    return (
      <AuthFormLayout title={t('auth.change.title')}>
        <Text accessibilityRole='summary' style={styles.notice}>
          {t('auth.change.done')}
        </Text>
        <Pressable accessibilityRole='button' onPress={() => router.replace('/')} style={styles.button}>
          <Text style={styles.buttonText}>{t('auth.setPassword.goToLogin')}</Text>
        </Pressable>
      </AuthFormLayout>
    )
  }

  function submit() {
    if (change.isPending) return
    if (!current || !validNewPassword(password) || password !== confirmation || password === current) {
      setValidation(true)
      return
    }
    setValidation(false)
    change.mutate({ currentPassword: current, newPassword: password })
  }

  return (
    <AuthFormLayout
      title={t('auth.change.title')}
      subtitle={t('auth.change.subtitle')}
      onBack={() => goBackOr(router, '/profile')}
    >
      <PasswordField
        autoComplete='current-password'
        editable={!change.isPending}
        error={
          validation && !current
            ? t('auth.change.currentRequired')
            : failure === 'currentInvalid'
              ? t('auth.errors.password.currentInvalid')
              : undefined
        }
        label={t('auth.change.current')}
        onChangeText={setCurrent}
        value={current}
      />
      <PasswordField
        autoComplete='new-password'
        editable={!change.isPending}
        error={
          validation && !validNewPassword(password)
            ? t('auth.setPassword.tooShort')
            : validation && password === current
              ? t('auth.change.sameAsCurrent')
              : failure === 'policy'
                ? t('auth.errors.password.policy')
                : undefined
        }
        label={t('auth.setPassword.newPassword')}
        onChangeText={setPassword}
        value={password}
      />
      <PasswordField
        autoComplete='new-password'
        editable={!change.isPending}
        error={validation && password !== confirmation ? t('auth.setPassword.mismatch') : undefined}
        label={t('auth.setPassword.confirm')}
        onChangeText={setConfirmation}
        value={confirmation}
      />
      {failure === 'rateLimit' || failure === 'general' || failure === 'linkInvalid' ? (
        <>
          <Text accessibilityRole='alert' style={styles.error}>
            {t(`auth.errors.password.${failure === 'rateLimit' ? 'rateLimit' : 'general'}`)}
          </Text>
          <ErrorReference error={change.error} />
        </>
      ) : null}
      <Text style={styles.notice}>{t('auth.change.signOutNotice')}</Text>
      <Pressable
        accessibilityRole='button'
        accessibilityState={{ disabled: change.isPending, busy: change.isPending }}
        disabled={change.isPending}
        onPress={submit}
        style={[styles.button, change.isPending && styles.disabled]}
      >
        <Text style={styles.buttonText}>{change.isPending ? t('auth.loading') : t('auth.change.submit')}</Text>
      </Pressable>
    </AuthFormLayout>
  )
}
