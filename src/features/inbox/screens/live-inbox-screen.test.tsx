import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { LiveInboxScreen } from '@/features/inbox'
import {
  notificationList,
  notificationMarkAllRead,
  notificationMarkRead,
  notificationUnreadCount
} from '@/shared/api/generated/api/notifications/notifications'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) }
const mockSession = {
  state: 'authenticated',
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token'),
  write: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => mockRouter }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/notifications/notifications', () => ({
  notificationList: jest.fn(),
  notificationUnreadCount: jest.fn(),
  notificationMarkRead: jest.fn(),
  notificationMarkAllRead: jest.fn()
}))

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  return render(
    <QueryClientProvider client={client}>
      <LiveInboxScreen />
    </QueryClientProvider>
  )
}

test('returns to the previous screen when opened from assigned approvals', async () => {
  const screen = await renderScreen()
  await fireEvent.press(screen.getByRole('button', { name: 'Quay lại' }))
  expect(mockRouter.back).toHaveBeenCalled()
})

beforeEach(async () => {
  await setAppLanguage('vi', false)
  jest.clearAllMocks()
  mockSession.state = 'authenticated'
  jest.mocked(notificationList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'NOTIFICATIONS.LISTED',
      data: {
        items: [
          {
            id: 'notice-1',
            code: 'REQUEST_GRANTED',
            subject: null,
            params: { requestId: '01234567-89ab-cdef-0123-456789abcdef' },
            createdAt: '2026-11-09T00:00:00Z',
            readAt: null
          }
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 }
      }
    }
  })
  jest.mocked(notificationUnreadCount).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: { success: true, message: 'NOTIFICATIONS.COUNTED', data: { unread: 1 } }
  })
  jest.mocked(notificationMarkRead).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: { success: true, message: 'NOTIFICATIONS.READ', data: null }
  })
  jest.mocked(notificationMarkAllRead).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: { success: true, message: 'NOTIFICATIONS.READ', data: { updated: 1 } }
  })
})

test('shows real notifications and updates one using authenticated API', async () => {
  const screen = await renderScreen()
  await screen.findByText('Đã cấp quyền sử dụng')
  screen.getByText('Mã yêu cầu: 01234567-89ab-cdef-0123-456789abcdef')
  screen.getByText('1 thông báo chưa đọc')
  expect(notificationList).toHaveBeenCalledWith(
    { page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Đánh dấu đã đọc: Đã cấp quyền sử dụng' }))
  await waitFor(() =>
    expect(notificationMarkRead).toHaveBeenCalledWith(
      'notice-1',
      expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
    )
  )
  await waitFor(() => expect(notificationList).toHaveBeenCalledTimes(2))
  expect(notificationUnreadCount).toHaveBeenCalledTimes(2)
  await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu' }))
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/live-requests/[requestId]',
    params: { requestId: '01234567-89ab-cdef-0123-456789abcdef' }
  })
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Yêu cầu' }))
  expect(mockRouter.replace).toHaveBeenCalledWith('/live-requests')
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phần mềm' }))
  expect(mockRouter.replace).toHaveBeenCalledWith('/my-software')
})

test('marks all read and reports an uncertain failed update without automatic retry', async () => {
  jest.mocked(notificationMarkAllRead).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('1 thông báo chưa đọc')
  await fireEvent.press(screen.getByRole('button', { name: 'Đánh dấu tất cả đã đọc' }))
  await screen.findByText('Chưa thể xác nhận kết quả. Hãy kiểm tra hộp thư trước khi thử lại.')
  expect(notificationMarkAllRead).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(notificationList).toHaveBeenCalledTimes(2))
})

test('shows load failure and retries', async () => {
  jest.mocked(notificationList).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Không thể tải thông báo. Vui lòng thử lại.')
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await screen.findByText('Đã cấp quyền sử dụng')
})

test('shows unknown codes rather than inventing a notification meaning', async () => {
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notification data')
  response.data.data.items[0].code = 'NEW_CODE'
  const screen = await renderScreen()
  await screen.findByText('Cập nhật khác (NEW_CODE)')
})

test('loads subsequent pages and shows an empty page', async () => {
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notification data')
  const data = response.data.data
  jest.mocked(notificationList).mockImplementation(async (params) => ({
    ...response,
    data: {
      ...response.data,
      data: {
        ...data,
        items: params?.page === 2 ? [] : data.items,
        pagination: { ...data.pagination, page: params?.page ?? 1, totalItems: 21, totalPages: 2 }
      }
    }
  }))
  const screen = await renderScreen()
  await screen.findByText('Đã cấp quyền sử dụng')
  await fireEvent.press(screen.getByRole('button', { name: 'Trang sau' }))
  await screen.findByText('Không có thông báo trên trang này.')
  expect(notificationList).toHaveBeenLastCalledWith({ page: 2, pageSize: 20 }, expect.anything())
})

test('supports English and marks all notifications as read', async () => {
  await setAppLanguage('en', false)
  const screen = await renderScreen()
  await screen.findByText('Access granted')
  await fireEvent.press(screen.getByRole('button', { name: 'Mark all as read' }))
  await waitFor(() => expect(notificationMarkAllRead).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(notificationUnreadCount).toHaveBeenCalledTimes(2))
})
