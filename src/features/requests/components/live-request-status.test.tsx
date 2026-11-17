import { render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { setAppLanguage } from '@/shared/i18n/i18n'
import { darkMobileColors, mobileColors } from '@/shared/theme/colors'

import { LiveRequestStatus } from './live-request-status'

let mockDark = false
jest.mock('@/shared/theme/theme-provider', () => {
  const colors = jest.requireActual('@/shared/theme/colors')
  return { useMobileTheme: () => ({ colors: mockDark ? colors.darkMobileColors : colors.mobileColors }) }
})

test.each([false, true])('uses semantic status colors and text in dark mode %s', async (dark) => {
  mockDark = dark
  await setAppLanguage('vi', false)
  const colors = dark ? darkMobileColors : mobileColors
  const screen = await render(<LiveRequestStatus state='COMPLETED' />)
  expect(StyleSheet.flatten(screen.getByText('Hoàn tất').props.style)).toMatchObject({
    color: colors.success,
    backgroundColor: colors.successBackground
  })
  await screen.rerender(<LiveRequestStatus state='REJECTED' />)
  expect(StyleSheet.flatten(screen.getByText('Đã từ chối').props.style).color).toBe(colors.danger)
  await screen.rerender(<LiveRequestStatus state='PENDING' />)
  expect(StyleSheet.flatten(screen.getByText('Chờ xử lý').props.style).color).toBe(colors.warning)
  await screen.rerender(<LiveRequestStatus state='UNRECOGNIZED' />)
  expect(StyleSheet.flatten(screen.getByText('Trạng thái khác (UNRECOGNIZED)').props.style).color).toBe(
    colors.foreground
  )
})
