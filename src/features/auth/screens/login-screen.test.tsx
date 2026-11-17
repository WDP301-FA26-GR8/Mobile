import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { LoginScreen } from '@/features/auth'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockReplace = jest.fn()
const mockLogin = jest.fn()
const mockSession = { state: 'anonymous', login: mockLogin, restoreFailed: false }
const mockProfile = {
  data: {
    roles: ['EMPLOYEE'],
    managerScope: null as { departmentId: string; departmentCode: string; departmentName: string } | null
  },
  isError: false,
  refetch: jest.fn()
}

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/use-account-profile', () => ({ useAccountProfile: () => mockProfile }))

beforeEach(async () => {
  await setAppLanguage('vi', false)
  mockLogin.mockReset()
  mockReplace.mockClear()
  mockSession.state = 'anonymous'
  mockProfile.data = { roles: ['EMPLOYEE'], managerScope: null }
  mockProfile.isError = false
  mockProfile.refetch.mockReset()
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

test('redirects an active manager to the manager workspace', async () => {
  mockSession.state = 'authenticated'
  mockProfile.data = {
    roles: ['MANAGER'],
    managerScope: { departmentId: 'id', departmentCode: 'IT', departmentName: 'IT' }
  }
  await render(<LoginScreen />)
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/live-need-approvals'))
})

test('opens the manager workspace even if no department is currently assigned', async () => {
  mockSession.state = 'authenticated'
  mockProfile.data = { roles: ['MANAGER'], managerScope: null }
  await render(<LoginScreen />)
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/live-need-approvals'))
})

test('does not guess a role when account loading fails', async () => {
  mockSession.state = 'authenticated'
  mockProfile.isError = true
  const screen = await render(<LoginScreen />)
  screen.getByText('Không thể tải thông tin tài khoản. Hãy thử lại hoặc đăng xuất.')
  expect(mockReplace).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  expect(mockProfile.refetch).toHaveBeenCalled()
})
