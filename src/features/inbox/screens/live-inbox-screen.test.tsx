import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { Text } from 'react-native'

import { LiveInboxScreen, NotificationReadErrorProvider } from '@/features/inbox'
import {
  notificationList,
  notificationMarkAllRead,
  notificationMarkRead,
  notificationUnreadCount
} from '@/shared/api/generated/api/notifications/notifications'
import { i18n, setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) }
const mockSession = {
  state: 'authenticated',
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token'),
  write: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
const mockProfile = {
  data: {
    roles: ['EMPLOYEE'],
    employee: { unplaced: false },
    managerScope: null as { departmentId: string; departmentCode: string; departmentName: string } | null
  },
  isError: false
}
jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => mockRouter }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/use-account-profile', () => ({
  useAccountProfile: () => mockProfile
}))
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
      <NotificationReadErrorProvider>
        <LiveInboxScreen />
      </NotificationReadErrorProvider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  await setAppLanguage('vi', false)
  jest.clearAllMocks()
  mockSession.state = 'authenticated'
  mockProfile.data.roles = ['EMPLOYEE']
  mockProfile.data.managerScope = null
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
            title: '',
            message: '',
            target: null,
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
  screen.getByText('1 thông báo chưa đọc')
  expect(notificationList).toHaveBeenCalledWith(
    { page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token', 'Accept-Language': 'vi' } })
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo: Đã cấp quyền sử dụng' }))
  await waitFor(() =>
    expect(notificationMarkRead).toHaveBeenCalledWith(
      'notice-1',
      expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
    )
  )
  await waitFor(() => expect(notificationList).toHaveBeenCalledTimes(2))
  expect(notificationUnreadCount).toHaveBeenCalledTimes(2)
  await waitFor(() =>
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/live-requests/[requestId]',
      params: { requestId: '01234567-89ab-cdef-0123-456789abcdef' }
    })
  )
})

test('distinguishes read notifications without marking on open', async () => {
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notifications')
  response.data.data.items.push({
    ...response.data.data.items[0],
    id: 'notice-2',
    code: 'REQUEST_WITHDRAWN',
    readAt: '2026-11-09T01:00:00Z'
  })
  const screen = await renderScreen()
  await screen.findByText('Đã cấp quyền sử dụng')
  screen.getByText('Chưa đọc')
  screen.getByText('Đã đọc')
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo: Yêu cầu đã được rút' }))
  expect(notificationMarkRead).not.toHaveBeenCalled()
  expect(notificationMarkAllRead).not.toHaveBeenCalled()
  expect(mockRouter.push).toHaveBeenCalled()
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
  await screen.findByText('Thông báo mới')
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo: Thông báo mới' }))
  await screen.findByText('Việc này chỉ thực hiện được trên web. Hãy mở ứng dụng web để tiếp tục.')
  expect(mockRouter.push).not.toHaveBeenCalled()
})

test('supports an older server without rendered notification fields', async () => {
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notification data')
  const item = response.data.data.items[0]
  Reflect.deleteProperty(item, 'title')
  Reflect.deleteProperty(item, 'message')
  Reflect.deleteProperty(item, 'target')
  const screen = await renderScreen()
  await screen.findByRole('button', { name: 'Mở thông báo: Đã cấp quyền sử dụng' })
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo: Đã cấp quyền sử dụng' }))
  await waitFor(() => expect(mockRouter.push).toHaveBeenCalled())
})

test('opens the request and shows a persistent warning when marking the notification fails', async () => {
  jest.mocked(notificationMarkRead).mockRejectedValueOnce(new Error('offline'))
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  const screen = await render(
    <QueryClientProvider client={client}>
      <NotificationReadErrorProvider>
        <LiveInboxScreen />
      </NotificationReadErrorProvider>
    </QueryClientProvider>
  )
  await screen.findByText('Đã cấp quyền sử dụng')
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo: Đã cấp quyền sử dụng' }))
  await screen.findByText('Chưa thể xác nhận kết quả. Hãy kiểm tra hộp thư trước khi thử lại.')
  expect(notificationMarkRead).toHaveBeenCalledTimes(1)
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/live-requests/[requestId]',
    params: { requestId: '01234567-89ab-cdef-0123-456789abcdef' }
  })
  await screen.rerender(
    <QueryClientProvider client={client}>
      <NotificationReadErrorProvider>
        <Text>{i18n.t('home.live.actions')}</Text>
      </NotificationReadErrorProvider>
    </QueryClientProvider>
  )
  screen.getByText('Chưa thể xác nhận kết quả. Hãy kiểm tra hộp thư trước khi thử lại.')
  await fireEvent.press(screen.getByRole('button', { name: 'Đóng' }))
  expect(screen.queryByText('Chưa thể xác nhận kết quả. Hãy kiểm tra hộp thư trước khi thử lại.')).toBeNull()
})

test('opens the backend subject rather than an unrelated legacy request id', async () => {
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notification data')
  response.data.data.items[0].subject = { type: 'ACCESS_REQUEST', id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }
  const screen = await renderScreen()
  await screen.findByText('Đã cấp quyền sử dụng')
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo: Đã cấp quyền sử dụng' }))
  await waitFor(() =>
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/live-requests/[requestId]',
      params: { requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }
    })
  )
})

test('passes the assigned request to the manager queue after marking the notification read', async () => {
  mockProfile.data.roles = ['MANAGER']
  mockProfile.data.managerScope = { departmentId: 'department', departmentCode: 'IT', departmentName: 'IT' }
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notification data')
  response.data.data.items[0].code = 'STEP_ASSIGNED'
  response.data.data.items[0].subject = { type: 'ACCESS_REQUEST', id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }
  response.data.data.items[0].params = { stepKind: 'NEED' }
  const screen = await renderScreen()
  await fireEvent.press(await screen.findByRole('button', { name: 'Mở thông báo: Có bước xử lý được giao cho bạn' }))
  await waitFor(() =>
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/live-need-approvals',
      params: { requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', source: 'assigned' }
    })
  )
  expect(notificationMarkRead).toHaveBeenCalledTimes(1)
})

test('does not open a malformed request id', async () => {
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notification data')
  response.data.data.items[0].subject = { type: 'ACCESS_REQUEST', id: 'invalid' }
  const screen = await renderScreen()
  await screen.findByText('Đã cấp quyền sử dụng')
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo: Đã cấp quyền sử dụng' }))
  await screen.findByText('Việc này chỉ thực hiện được trên web. Hãy mở ứng dụng web để tiếp tục.')
  expect(mockRouter.push).not.toHaveBeenCalled()
})

test('opens the holder’s software access from an expiry notification', async () => {
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notification data')
  response.data.data.items[0].code = 'LICENSE_EXPIRY_REMINDER'
  response.data.data.items[0].subject = { type: 'LICENSE_ASSIGNMENT', id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }
  response.data.data.items[0].params = { audience: 'EMPLOYEE' }
  const screen = await renderScreen()
  await screen.findByText('Quyền phần mềm sắp hết hạn')
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo: Quyền phần mềm sắp hết hạn' }))
  await waitFor(() =>
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/my-software/[softwareId]',
      params: { softwareId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }
    })
  )
})

test('does not open another employee’s expiry notification as personal software', async () => {
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notification data')
  response.data.data.items[0].code = 'LICENSE_EXPIRY_REMINDER'
  response.data.data.items[0].subject = { type: 'LicenseAssignment', id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }
  response.data.data.items[0].params = { audience: 'HEAD' }
  const screen = await renderScreen()
  await screen.findByText('Quyền phần mềm sắp hết hạn')
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo: Quyền phần mềm sắp hết hạn' }))
  await screen.findByText('Việc này chỉ thực hiện được trên web. Hãy mở ứng dụng web để tiếp tục.')
  expect(mockRouter.push).not.toHaveBeenCalled()
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
  expect(notificationList).toHaveBeenCalledWith(
    { page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token', 'Accept-Language': 'en' } })
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Mark all as read' }))
  await waitFor(() => expect(notificationMarkAllRead).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(notificationUnreadCount).toHaveBeenCalledTimes(2))
})

test('shows localized server notification text and reloads it when the language changes', async () => {
  const response = await jest.mocked(notificationList)()
  if (!response.data.data) throw new Error('Expected notification data')
  const data = response.data.data
  jest.mocked(notificationList).mockImplementation(async (_params, options) => {
    const english = new Headers(options?.headers).get('Accept-Language') === 'en'
    return {
      ...response,
      data: {
        ...response.data,
        data: {
          ...data,
          items: [
            {
              ...data.items[0],
              title: english ? 'Server title' : 'Tiêu đề từ máy chủ',
              message: english ? 'Server message' : 'Nội dung từ máy chủ'
            }
          ]
        }
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByRole('button', { name: 'Mở thông báo: Tiêu đề từ máy chủ' })
  screen.getByText('Nội dung từ máy chủ')
  await act(() => setAppLanguage('en', false))
  await screen.findByRole('button', { name: 'Open notification: Server title' })
  screen.getByText('Server message')
})
