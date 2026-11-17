import AsyncStorage from '@react-native-async-storage/async-storage'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { Text, useColorScheme, View } from 'react-native'

import { setAppLanguage } from '@/shared/i18n/i18n'
import { ThemeSwitch } from '@/shared/ui/theme-switch'

import { ThemeProvider, useMobileTheme } from './theme-provider'

function Example() {
  const { colors, preference } = useMobileTheme()
  return (
    <View testID='surface' style={{ backgroundColor: colors.background }}>
      <Text>{preference}</Text>
      <ThemeSwitch />
    </View>
  )
}

beforeEach(async () => {
  await AsyncStorage.clear()
  await setAppLanguage('vi', false)
  jest.clearAllMocks()
  jest.mocked(useColorScheme).mockReturnValue('light')
})

test('switches appearance, persists it and restores it on remount', async () => {
  const screen = await render(
    <ThemeProvider>
      <Example />
    </ThemeProvider>
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Giao diện' }))
  await fireEvent.press(screen.getByRole('radio', { name: 'Tối' }))
  await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('saas-sentry.theme', 'dark'))
  expect(screen.getByTestId('surface')).toHaveStyle({ backgroundColor: '#05162a' })
  expect(screen.getByRole('radio', { name: 'Tối' }).props.accessibilityState.checked).toBe(true)
  await screen.unmount()

  const restored = await render(
    <ThemeProvider>
      <Example />
    </ThemeProvider>
  )
  await waitFor(() => expect(restored.getByTestId('surface')).toHaveStyle({ backgroundColor: '#05162a' }))
  await fireEvent.press(restored.getByRole('button', { name: 'Giao diện' }))
  await fireEvent.press(restored.getByRole('radio', { name: 'Theo thiết bị' }))
  await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('saas-sentry.theme', 'system'))
})

test('reports preference storage failure', async () => {
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('storage unavailable'))
  const screen = await render(
    <ThemeProvider>
      <Example />
    </ThemeProvider>
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Giao diện' }))
  await fireEvent.press(screen.getByRole('radio', { name: 'Tối' }))
  await screen.findByText('Không thể lưu hoặc tải lựa chọn giao diện.')
})

test('follows device appearance when system is selected', async () => {
  jest.mocked(useColorScheme).mockReturnValue('dark')
  const screen = await render(
    <ThemeProvider>
      <Example />
    </ThemeProvider>
  )
  expect(screen.getByTestId('surface')).toHaveStyle({ backgroundColor: '#05162a' })
})
