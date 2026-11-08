import { fireEvent, render } from '@testing-library/react-native'

import { LoginScreen } from '@/features/auth'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace })
}))

describe('<LoginScreen />', () => {
  beforeAll(async () => {
    await setAppLanguage('vi', false)
  })

  beforeEach(() => {
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  test('shows internal email and password login without third-party sign-in', async () => {
    const screen = await render(<LoginScreen />)

    screen.getByText('Đăng nhập tài khoản nội bộ')
    screen.getByLabelText('Email công ty')
    screen.getByLabelText('Mật khẩu')
    screen.getByText('Quên mật khẩu?')
    expect(screen.queryByText(/Google|SSO/i)).toBeNull()
  })

  test('opens the employee demo and password recovery', async () => {
    const screen = await render(<LoginScreen />)

    fireEvent.press(screen.getByRole('button', { name: 'Đăng nhập' }))
    fireEvent.press(screen.getByRole('link', { name: 'Quên mật khẩu?' }))

    expect(mockReplace).toHaveBeenCalledWith('/my-software')
    expect(mockPush).toHaveBeenCalledWith('/forgot-password')
  })
})
