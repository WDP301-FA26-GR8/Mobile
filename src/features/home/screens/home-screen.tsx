import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { LanguageSwitch } from '@/shared/ui/language-switch'

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
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fb'
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  eyebrow: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2
  },
  title: {
    color: '#102a43',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 39,
    marginTop: 14
  },
  description: {
    color: '#52677a',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12
  },
  list: {
    gap: 12,
    marginTop: 28
  },
  contractNote: {
    color: '#52677a',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 24
  }
})
