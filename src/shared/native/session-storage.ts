import { Platform } from 'react-native'

import * as SecureStore from 'expo-secure-store'

const SESSION_KEY = 'saas-sentry-refresh-token'
let webToken: string | null = null

export const sessionStorage = {
  async read(): Promise<string | null> {
    if (Platform.OS === 'web') return webToken
    return SecureStore.getItemAsync(SESSION_KEY)
  },
  async write(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      webToken = token
      return
    }
    await SecureStore.setItemAsync(SESSION_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    })
  },
  async remove(): Promise<void> {
    if (Platform.OS === 'web') {
      webToken = null
      return
    }
    await SecureStore.deleteItemAsync(SESSION_KEY)
  }
}
