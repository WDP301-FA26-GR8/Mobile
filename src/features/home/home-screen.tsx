import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { LanguageSwitch } from '@/shared/ui/language-switch'

const foundationKeys = ['router', 'query', 'api'] as const

export function HomeScreen() {
  const { t } = useTranslation()

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LanguageSwitch />
        <Text style={styles.eyebrow}>{t('common.brand')}</Text>
        <Text accessibilityRole='header' style={styles.title}>
          {t('home.title')}
        </Text>
        <Text style={styles.description}>{t('home.description')}</Text>

        <View accessibilityLabel={t('home.foundationHeading')} style={styles.list}>
          {foundationKeys.map((foundation, index) => (
            <View key={foundation} style={styles.item}>
              <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.itemText}>{t(`home.foundations.${foundation}`)}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
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
    color: '#0f172a',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 40,
    marginTop: 14
  },
  description: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 18
  },
  list: {
    gap: 12,
    marginTop: 36
  },
  item: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18
  },
  index: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '700'
  },
  itemText: {
    color: '#1e293b',
    flex: 1,
    fontSize: 15,
    fontWeight: '600'
  }
})
