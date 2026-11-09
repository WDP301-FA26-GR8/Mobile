import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { goBackOr } from '@/shared/lib/go-back-or'

type RecoveryStep = 'email' | 'sent' | 'reset' | 'done'

export function ForgotPasswordScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<RecoveryStep>('email')
  const stepCopy = {
    done: {
      description: t('auth.recovery.done.description'),
      title: t('auth.recovery.done.title')
    },
    email: {
      description: t('auth.recovery.email.description'),
      title: t('auth.recovery.email.title')
    },
    reset: {
      description: t('auth.recovery.passwordStep.description'),
      title: t('auth.recovery.passwordStep.title')
    },
    sent: {
      description: t('auth.recovery.sent.description'),
      title: t('auth.recovery.sent.title')
    }
  }[step]

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <Pressable accessibilityRole='button' onPress={() => goBackOr(router, '/')} style={styles.backButton}>
          <Text style={styles.backLabel}>{t('auth.back')}</Text>
        </Pressable>

        <View style={styles.panel}>
          <Text accessibilityRole='header' style={styles.title}>
            {stepCopy.title}
          </Text>
          <Text style={styles.description}>{stepCopy.description}</Text>

          {step === 'email' ? (
            <View style={styles.form}>
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
              <Pressable accessibilityRole='button' onPress={() => setStep('sent')} style={styles.primaryButton}>
                <Text style={styles.primaryLabel}>{t('auth.recovery.send')}</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'sent' ? (
            <Pressable accessibilityRole='button' onPress={() => setStep('reset')} style={styles.primaryButton}>
              <Text style={styles.primaryLabel}>{t('auth.recovery.openLink')}</Text>
            </Pressable>
          ) : null}

          {step === 'reset' ? (
            <View style={styles.form}>
              <Text style={styles.label}>{t('auth.recovery.newPassword')}</Text>
              <TextInput
                accessibilityLabel={t('auth.recovery.newPassword')}
                autoComplete='new-password'
                onChangeText={setPassword}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor='#a89c91'
                secureTextEntry
                style={styles.input}
                value={password}
              />
              <Pressable accessibilityRole='button' onPress={() => setStep('done')} style={styles.primaryButton}>
                <Text style={styles.primaryLabel}>{t('auth.recovery.resetButton')}</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'done' ? (
            <Pressable accessibilityRole='button' onPress={() => router.replace('/')} style={styles.primaryButton}>
              <Text style={styles.primaryLabel}>{t('auth.recovery.backToLogin')}</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    minHeight: 40,
    justifyContent: 'center',
    paddingRight: 12
  },
  backLabel: {
    color: '#a33700',
    fontSize: 14,
    fontWeight: '600'
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  description: {
    color: '#7c7068',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10
  },
  form: {
    gap: 12,
    marginTop: 26
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
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#f0e2d5',
    borderRadius: 22,
    borderWidth: 1,
    padding: 22
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#ff7020',
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 50,
    paddingHorizontal: 14
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center'
  },
  safeArea: {
    backgroundColor: '#fef7ef',
    flex: 1
  },
  title: {
    color: '#241c18',
    fontSize: 23,
    fontWeight: '700'
  }
})
