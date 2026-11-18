import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { LiveHomeScreen } from '@/features/home'
import { notificationUnreadCount } from '@/shared/api/generated/api/notifications/notifications'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { push: jest.fn() }
const mockSession = {
  state: 'authenticated',
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
const mockAccount = {
  roles: ['EMPLOYEE'],
  managerScope: null as { departmentId: string; departmentCode: string; departmentName: string } | null,
  employee: { fullName: 'An', department: { name: 'IT' }, unplaced: false }
}
const mockProfile = { data: mockAccount, isError: false, refetch: jest.fn() }

jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => mockRouter }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/use-account-profile', () => ({ useAccountProfile: () => mockProfile }))
jest.mock('@/shared/api/generated/api/notifications/notifications', () => ({ notificationUnreadCount: jest.fn() }))

async function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(
    <QueryClientProvider client={client}>
      <LiveHomeScreen />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  jest.clearAllMocks()
  await setAppLanguage('vi', false)
  mockAccount.roles = ['EMPLOYEE']
  mockAccount.managerScope = null
  mockAccount.employee.unplaced = false
  mockProfile.isError = false
  jest.mocked(notificationUnreadCount).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: { success: true, message: 'COUNT', data: { unread: 2 } }
  })
})

test('shows employee shortcuts and the live unread count', async () => {
  const screen = await renderScreen()
  await screen.findByText('2 thông báo chưa đọc')
  screen.getByText('Xin chào, An')
  expect(screen.queryByRole('button', { name: 'Duyệt nhu cầu' })).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: /Tạo yêu cầu/ }))
  expect(mockRouter.push).toHaveBeenCalledWith('/live-request-create')
})

test('only shows need approval for a manager with active scope', async () => {
  mockAccount.roles = ['MANAGER']
  mockAccount.managerScope = { departmentId: 'id', departmentCode: 'IT', departmentName: 'IT' }
  const screen = await renderScreen()
  await screen.findByText('2 thông báo chưa đọc')
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
  expect(mockRouter.push).toHaveBeenCalledWith('/live-need-approvals')
  mockAccount.managerScope = null
  await screen.rerender(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}>
      <LiveHomeScreen />
    </QueryClientProvider>
  )
  await waitFor(() => screen.getByText('Phạm vi trưởng phòng của bạn hiện chưa có hiệu lực.'))
  expect(screen.queryByRole('button', { name: 'Duyệt nhu cầu' })).toBeNull()
})

test.each(['SUPER_ADMIN', 'SPENDING_APPROVER'])('does not offer requests to %s', async (role) => {
  mockAccount.roles = [role]
  const screen = await renderScreen()
  await screen.findByText('2 thông báo chưa đọc')
  expect(screen.queryByRole('button', { name: /Tạo yêu cầu/ })).toBeNull()
})

test('does not offer requests to an unplaced employee', async () => {
  mockAccount.employee.unplaced = true
  const screen = await renderScreen()
  await screen.findByText('2 thông báo chưa đọc')
  expect(screen.queryByRole('button', { name: /Tạo yêu cầu/ })).toBeNull()
})
