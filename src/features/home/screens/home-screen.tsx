import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { LanguageSwitch } from '@/shared/ui/language-switch'
import { mobileColors } from '@/shared/theme/colors'

import { CapabilityCard } from '../components/capability-card'
import { mobileCapabilities } from '../model/mobile-capabilities'

export function HomeScreen() {
  const { t } = useTranslation()

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <LanguageSwitch />
        <Text style={styles.eyebrow}>{t('common.brand')}</Text>
        <Text accessibilityRole='header' style={styles.title}>
          {t('home.title')}
        </Text>
        <Text style={styles.description}>{t('home.description')}</Text>

        <View accessibilityLabel={t('home.capabilitiesHeading')} style={styles.list}>
          {mobileCapabilities.map(({ id, titleKey, descriptionKey }) => (
            <CapabilityCard description={t(descriptionKey)} key={id} title={t(titleKey)} />
          ))}
        </View>
        <Text style={styles.contractNote}>{t('home.contractNote')}</Text>
        <Link asChild href='/my-software'>
          <Pressable accessibilityRole='button' style={styles.demoButton}>
            <Text style={styles.demoButtonLabel}>{t('home.openEmployeeDemo')}</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: mobileColors.background
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  eyebrow: {
    color: mobileColors.primaryInk,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2
  },
  title: {
    color: mobileColors.foreground,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 39,
    marginTop: 14
  },
  description: {
    color: mobileColors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12
  },
  list: {
    gap: 12,
    marginTop: 28
  },
  contractNote: {
    color: mobileColors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 24
  },
  demoButton: {
    alignItems: 'center',
    backgroundColor: mobileColors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 48,
    paddingHorizontal: 20
  },
  demoButtonLabel: {
    color: mobileColors.white,
    fontSize: 15,
    fontWeight: '700'
  }
})
