import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useColorScheme } from 'react-native'

import { darkMobileColors, mobileColors } from './colors'

export type ThemePreference = 'system' | 'light' | 'dark'
const THEME_STORAGE_KEY = 'saas-sentry.theme'

interface ThemeContextValue {
  preference: ThemePreference
  dark: boolean
  colors: typeof mobileColors
  setPreference: (preference: ThemePreference) => Promise<void>
  storageError: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: 'light',
  dark: false,
  colors: mobileColors,
  setPreference: async () => {
    throw new Error('ThemeProvider is missing')
  },
  storageError: false
})

export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>('system')
  const [storageError, setStorageError] = useState(false)
  const changed = useRef(false)

  useEffect(() => {
    let active = true
    void AsyncStorage.getItem(THEME_STORAGE_KEY).then(
      (stored) => {
        if (active && !changed.current && (stored === 'system' || stored === 'light' || stored === 'dark')) {
          setPreferenceState(stored)
        } else if (active && !changed.current && stored !== null) {
          setStorageError(true)
        }
      },
      () => {
        if (active) setStorageError(true)
      }
    )
    return () => {
      active = false
    }
  }, [])

  const setPreference = useCallback(async (next: ThemePreference) => {
    changed.current = true
    setPreferenceState(next)
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next)
      setStorageError(false)
    } catch (error) {
      setStorageError(true)
      throw error
    }
  }, [])
  const dark = preference === 'dark' || (preference === 'system' && scheme === 'dark')
  const value = useMemo(
    () => ({ preference, dark, colors: dark ? darkMobileColors : mobileColors, setPreference, storageError }),
    [dark, preference, setPreference, storageError]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useMobileTheme() {
  return useContext(ThemeContext)
}
