import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { resources, type SupportedLanguage } from './resources'

const LANGUAGE_STORAGE_KEY = 'saas-sentry.language'
export const supportedLanguages = Object.keys(resources) as SupportedLanguage[]
const i18n = createInstance()

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && supportedLanguages.includes(value as SupportedLanguage)
}

void i18n.use(initReactI18next).init({
  fallbackLng: 'vi',
  initAsync: false,
  interpolation: { escapeValue: false },
  lng: 'vi',
  resources,
  supportedLngs: supportedLanguages
})

export async function setAppLanguage(language: SupportedLanguage, persist = true) {
  await i18n.changeLanguage(language)
  if (persist) await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

export async function initializeMobileLanguage() {
  const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
  const deviceLanguage = getLocales()
    .map((locale) => locale.languageCode)
    .find(isSupportedLanguage)

  await setAppLanguage(isSupportedLanguage(storedLanguage) ? storedLanguage : (deviceLanguage ?? 'vi'), false)
}

export { i18n }
export type { SupportedLanguage } from './resources'
