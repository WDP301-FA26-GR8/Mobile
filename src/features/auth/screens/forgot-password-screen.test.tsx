import { fireEvent, render } from '@testing-library/react-native'

import { ForgotPasswordScreen } from '@/features/auth'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockBack = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace })
}))

describe('<ForgotPasswordScreen />', () => {
  beforeAll(async () => {
    await setAppLanguage('vi', false)
  })

  beforeEach(() => {
    mockBack.mockClear()
    mockReplace.mockClear()
  })

  test('uses a non-enumerating response and completes the simulated reset flow', async () => {
    const screen = await render(<ForgotPasswordScreen />)

    await fireEvent.changeText(screen.getByLabelText('Email công ty'), 'staff@company.tech')
    await fireEvent.press(screen.getByRole('button', { name: 'Gửi hướng dẫn' }))
    screen.getByText(/Phản hồi này giống nhau với mọi địa chỉ/)

    await fireEvent.press(screen.getByRole('button', { name: 'Mở liên kết đặt lại giả lập' }))
    screen.getByLabelText('Mật khẩu mới')
    await fireEvent.press(screen.getByRole('button', { name: 'Đặt mật khẩu mới' }))
    screen.getByText('Đã cập nhật mật khẩu')
    await fireEvent.press(screen.getByRole('button', { name: 'Về đăng nhập' }))

    expect(mockReplace).toHaveBeenCalledWith('/')
  })
})
