import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { setAppLanguage, type SupportedLanguage } from '@/shared/i18n/i18n'

const languages: SupportedLanguage[] = ['vi', 'en']

export function LanguageSwitch() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage?.split('-')[0] ?? 'vi'

  return (
    <View accessibilityLabel={t('common.language.selector')} accessibilityRole='summary' style={styles.container}>
      {languages.map((language) => {
        const isCurrent = currentLanguage === language
        const languageName = t(language === 'vi' ? 'common.language.vietnamese' : 'common.language.english')

        return (
          <Pressable
            accessibilityLabel={t('common.language.switchTo', { language: languageName })}
            accessibilityRole='button'
            accessibilityState={{ selected: isCurrent }}
            key={language}
            onPress={() => void setAppLanguage(language)}
            style={[styles.button, isCurrent && styles.buttonSelected]}
          >
            <Text style={[styles.label, isCurrent && styles.labelSelected]}>
              {t(language === 'vi' ? 'common.language.vietnameseShort' : 'common.language.englishShort')}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 28
  },
  button: {
    borderColor: '#cbd5e1',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  buttonSelected: {
    backgroundColor: '#f0fdfa',
    borderColor: '#0f766e'
  },
  label: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700'
  },
  labelSelected: {
    color: '#115e59'
  }
})
