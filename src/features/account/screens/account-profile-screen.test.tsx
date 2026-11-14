import AsyncStorage from '@react-native-async-storage/async-storage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { AccountProfileScreen } from '@/features/account'
import { meGet } from '@/shared/api/generated/api/me/me'
import { setAppLanguage } from '@/shared/i18n/i18n'
import { ThemeProvider } from '@/shared/theme/theme-provider'

const mockRouter = { back: jest.fn(), canGoBack: jest.fn(() => true), replace: jest.fn() }
const mockRedirect = jest.fn()
const mockSession = {
  state: 'authenticated',
  logout: jest.fn(),
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}

jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => {
    mockRedirect(props.href)
    return null
  },
  useRouter: () => mockRouter
}))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/me/me', () => ({ meGet: jest.fn() }))

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AccountProfileScreen />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  jest.clearAllMocks()
  await setAppLanguage('vi', false)
  await AsyncStorage.removeItem('saas-sentry.theme')
  mockSession.state = 'authenticated'
  mockRouter.canGoBack.mockReturnValue(true)
  jest.mocked(meGet).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'ME.RETRIEVED',
      data: {
        appUserId: 'user-id',
        loginEmail: 'person@example.test',
        employee: {
          id: 'employee-id',
          employeeCode: 'E1',
          fullName: 'Nguyễn An',
          department: { code: 'IT', name: 'Phòng IT' },
          unplaced: false,
          jobTitle: null
        },
        roles: ['EMPLOYEE'],
        managerScope: null
      }
    }
  })
})

test('shows only the signed-in account details and returns to the previous screen', async () => {
  const screen = await renderScreen()
  await screen.findByText('person@example.test')
  screen.getByText('E1')
  screen.getByText('Phòng IT')
  expect(screen.getAllByText('Chưa cập nhật')).toHaveLength(2)
  expect(screen.queryByText('Phòng ban phụ trách')).toBeNull()
  expect(screen.queryByRole('button', { name: /chỉnh sửa|đổi mật khẩu/i })).toBeNull()
  expect(meGet).toHaveBeenCalledWith(expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }))
  await fireEvent.press(screen.getByRole('button', { name: 'Quay lại' }))
  expect(mockRouter.back).toHaveBeenCalledTimes(1)
})

test('shows the manager scope only when provided and uses the landing fallback without history', async () => {
  const response = await jest.mocked(meGet)()
  if (!response.data.data) throw new Error('Expected account')
  jest.mocked(meGet).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        roles: ['MANAGER'],
        managerScope: { departmentId: 'department-id', departmentCode: 'OPS', departmentName: 'Vận hành' }
      }
    }
  })
  mockRouter.canGoBack.mockReturnValue(false)
  const screen = await renderScreen()
  await screen.findByText('Vận hành')
  screen.getByText('Phòng ban phụ trách')
  await fireEvent.press(screen.getByRole('button', { name: 'Quay lại' }))
  expect(mockRouter.replace).toHaveBeenCalledWith('/')
})

test('shows missing department and manager scope without inventing account data', async () => {
  const response = await jest.mocked(meGet)()
  if (!response.data.data) throw new Error('Expected account')
  jest.mocked(meGet).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        roles: ['MANAGER'],
        employee: { ...response.data.data.employee, department: null },
        managerScope: null
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Phòng ban phụ trách')
  expect(screen.getAllByText('Chưa cập nhật')).toHaveLength(4)
})

test('reuses the existing account query cache', async () => {
  const response = await jest.mocked(meGet)()
  if (!response.data.data) throw new Error('Expected account')
  jest.mocked(meGet).mockClear()
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false, gcTime: 0 } } })
  client.setQueryData(['session', 'me'], response.data.data)
  const screen = await render(
    <QueryClientProvider client={client}>
      <AccountProfileScreen />
    </QueryClientProvider>
  )
  screen.getByText('person@example.test')
  expect(meGet).not.toHaveBeenCalled()
})

test('shows loading and an explicit error before retrying the account request', async () => {
  let rejectRequest: (error: Error) => void = () => {
    throw new Error('Missing request')
  }
  jest.mocked(meGet).mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectRequest = reject
      })
  )
  const screen = await renderScreen()
  screen.getByRole('progressbar')
  rejectRequest(new Error('offline'))
  await screen.findByRole('alert')
  expect(screen.queryByText('person@example.test')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await screen.findByText('person@example.test')
})

test('supports English and dark appearance', async () => {
  await setAppLanguage('en', false)
  await AsyncStorage.setItem('saas-sentry.theme', 'dark')
  const screen = await renderScreen()
  await screen.findByText('person@example.test')
  expect(screen.getAllByText('Not provided')).toHaveLength(2)
  await waitFor(() =>
    expect(screen.getByRole('header', { name: 'Account information' })).toHaveStyle({ color: '#f8fcff' })
  )
})

test('redirects an anonymous session without fetching account data', async () => {
  mockSession.state = 'anonymous'
  await renderScreen()
  expect(mockRedirect).toHaveBeenCalledWith('/')
  expect(meGet).not.toHaveBeenCalled()
})

test('requires confirmation before signing out and supports cancellation', async () => {
  const screen = await renderScreen()
  await screen.findByText('person@example.test')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }))
  screen.getByRole('header', { name: 'Đăng xuất?' })
  expect(mockSession.logout).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Hủy' }))
  expect(mockSession.logout).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }))
  mockSession.logout.mockResolvedValueOnce(undefined)
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận đăng xuất' }))
  expect(mockSession.logout).toHaveBeenCalledTimes(1)
})

test('allows retrying a failed logout even when account details are unavailable', async () => {
  jest.mocked(meGet).mockRejectedValueOnce(new Error('offline'))
  mockSession.logout.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined)
  const screen = await renderScreen()
  await screen.findByText('Không thể tải thông tin tài khoản. Kiểm tra kết nối và thử lại.')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận đăng xuất' }))
  await screen.findByText('Chưa thể xác nhận đăng xuất với máy chủ. Vui lòng kiểm tra kết nối và thử lại.')
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận đăng xuất' }))
  expect(mockSession.logout).toHaveBeenCalledTimes(2)
})

test('prevents repeated logout while the request is in flight', async () => {
  let resolveLogout: () => void = () => {
    throw new Error('Missing logout')
  }
  mockSession.logout.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        resolveLogout = resolve
      })
  )
  const screen = await renderScreen()
  await screen.findByText('person@example.test')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận đăng xuất' }))
  const pending = screen.getByRole('button', { name: 'Vui lòng đợi…' })
  expect(pending).toBeDisabled()
  await fireEvent.press(pending)
  expect(mockSession.logout).toHaveBeenCalledTimes(1)
  resolveLogout()
  await waitFor(() => expect(screen.getByRole('button', { name: 'Xác nhận đăng xuất' })).toBeEnabled())
})
