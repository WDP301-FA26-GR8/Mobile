import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function LoginScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

          <Pressable accessibilityRole='link' onPress={() => router.push('/forgot-password')} style={styles.forgotLink}>
            <Text style={styles.forgotLabel}>{t('auth.forgotPassword')}</Text>
          </Pressable>

          <Pressable
            accessibilityRole='button'
            onPress={() => router.replace('/my-software')}
            style={styles.loginButton}
          >
            <Text style={styles.loginLabel}>{t('auth.login')}</Text>
          </Pressable>
        </View>

        <Text style={styles.demoNote}>{t('auth.demoNote')}</Text>
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
  demoNote: {
    color: '#8a786a',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 26,
    textAlign: 'center'
  },
  field: {
    gap: 8
  },
  forgotLabel: {
    color: '#a33700',
    fontSize: 13,
    fontWeight: '600'
  },
  forgotLink: {
    alignSelf: 'flex-end',
    paddingVertical: 4
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
