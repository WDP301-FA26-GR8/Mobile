import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { LoginScreen } from '@/features/auth'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockReplace = jest.fn()
const mockLogin = jest.fn()
const mockSession = { state: 'anonymous', login: mockLogin, restoreFailed: false }

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))

beforeEach(async () => {
  await setAppLanguage('vi', false)
  mockLogin.mockReset()
  mockReplace.mockClear()
  mockSession.state = 'anonymous'
})

test('requires credentials instead of opening demo data', async () => {
  const screen = await render(<LoginScreen />)
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng nhập' }))
  screen.getByText('Vui lòng kiểm tra email và mật khẩu.')
  expect(mockLogin).not.toHaveBeenCalled()
  expect(mockReplace).not.toHaveBeenCalled()
  screen.getByText('Đặt lại mật khẩu chưa có trên ứng dụng. Vui lòng sử dụng trang web.')
})

test('submits the credentials and reports authentication failure', async () => {
  mockLogin.mockRejectedValueOnce({ status: 401 })
  const screen = await render(<LoginScreen />)
  await fireEvent.changeText(screen.getByLabelText('Email công ty'), 'person@example.test')
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu'), 'wrong')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng nhập' }))
  await waitFor(() => screen.getByText('Vui lòng kiểm tra email và mật khẩu.'))
  expect(mockLogin).toHaveBeenCalledWith('person@example.test', 'wrong')
  expect(mockReplace).not.toHaveBeenCalled()
})

test('redirects an authenticated account to its software', async () => {
  mockSession.state = 'authenticated'
  await render(<LoginScreen />)
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/my-software'))
})
