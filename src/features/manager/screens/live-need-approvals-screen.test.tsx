import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { LiveNeedApprovalsScreen } from '@/features/manager'
import {
  accessRequestGet,
  accessRequestNeedDecide,
  accessRequestSimilarSeatList
} from '@/shared/api/generated/api/access-requests/access-requests'
import { meGet } from '@/shared/api/generated/api/me/me'
import { needDecisionList } from '@/shared/api/generated/api/need-decisions/need-decisions'
import { notificationList, notificationUnreadCount } from '@/shared/api/generated/api/notifications/notifications'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { replace: jest.fn(), push: jest.fn() }
const mockRedirect = jest.fn()
const mockSession = {
  state: 'authenticated',
  logout: jest.fn(),
  read: <T,>(fn: (token: string) => Promise<T>) => fn('test-token'),
  write: <T,>(fn: (token: string) => Promise<T>) => fn('test-token')
}
jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => {
    mockRedirect(props.href)
    return null
  },
  useRouter: () => mockRouter
}))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/need-decisions/need-decisions', () => ({ needDecisionList: jest.fn() }))
jest.mock('@/shared/api/generated/api/me/me', () => ({ meGet: jest.fn() }))
jest.mock('@/shared/api/generated/api/notifications/notifications', () => ({
  notificationList: jest.fn(),
  notificationUnreadCount: jest.fn(),
  notificationMarkRead: jest.fn(),
  notificationMarkAllRead: jest.fn()
}))
jest.mock('@/shared/api/generated/api/access-requests/access-requests', () => ({
  accessRequestGet: jest.fn(),
  accessRequestNeedDecide: jest.fn(),
  accessRequestSimilarSeatList: jest.fn()
}))

const id = '01234567-89ab-cdef-0123-456789abcdef'
function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  return render(
    <QueryClientProvider client={client}>
      <LiveNeedApprovalsScreen />
    </QueryClientProvider>
  )
}
beforeEach(async () => {
  jest.clearAllMocks()
  await setAppLanguage('vi', false)
  jest.mocked(notificationList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'NOTIFICATIONS.LISTED',
      data: {
        items: [],
        pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 }
      }
    }
  })
  jest.mocked(notificationUnreadCount).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: { success: true, message: 'NOTIFICATIONS.COUNTED', data: { unread: 0 } }
  })
  jest.mocked(meGet).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'ME.RETRIEVED',
      data: {
        appUserId: id,
        loginEmail: 'manager@example.test',
        roles: ['MANAGER'],
        employee: { id, employeeCode: 'E1', fullName: 'Manager An', department: null, unplaced: false, jobTitle: null },
        managerScope: { departmentId: id, departmentCode: 'IT', departmentName: 'Phòng IT' }
      }
    }
  })
  jest.mocked(accessRequestSimilarSeatList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'ACCESS_REQUEST.SIMILAR_SEATS_LISTED',
      data: {
        items: [],
        pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 }
      }
    }
  })
  jest.mocked(needDecisionList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'NEED.LISTED',
      data: {
        items: [
          {
            requestId: id,
            stepId: id,
            stepKind: 'NEED',
            deciderRole: 'MANAGER',
            type: 'GRANT',
            openedAt: '2026-11-09T00:00:00Z',
            assignedAt: null,
            slaWorkingDays: 2,
            dueOn: '2026-11-12',
            plan: { planId: id, planName: 'Pro', applicationName: 'Figma' },
            softwareName: null,
            requester: { employeeId: id, employeeCode: 'E1', fullName: 'An' },
            beneficiary: null,
            lineCount: 1,
            department: { id, code: 'IT', name: 'IT' },
            businessReasonExcerpt: 'Thiết kế',
            termMonths: 12,
            pricing: { status: 'NOT_APPLICABLE', amount: null },
            samePersonAsSpend: false
          }
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 }
      }
    }
  })
  jest.mocked(accessRequestGet).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'REQUEST.RETRIEVED',
      data: {
        request: {
          id,
          type: 'GRANT',
          branch: 'PAID_IN_CATALOG',
          state: 'PENDING',
          plan: { planId: id, planName: 'Pro', applicationId: id, applicationName: 'Figma' },
          proposal: null,
          department: { id, code: 'IT', name: 'IT' },
          costCenter: null,
          requester: { employeeId: id, employeeCode: 'E1', fullName: 'An' },
          beneficiary: null,
          lineCount: 1,
          businessReason: 'Thiết kế',
          termMonths: 12,
          expectedEndDate: null,
          serviceAccount: null,
          renewal: null,
          spend: null,
          budgetYear: null,
          pricing: {
            status: 'NOT_APPLICABLE',
            missingReason: null,
            amount: null,
            unitPrice: null,
            billingCycle: null,
            periodCount: null,
            bindingPeriodCount: null,
            firstDueOn: null,
            lastDueOn: null
          },
          policy: { version: 1, hasSpendStep: true, slaWorkingDays: 2 },
          submittedAt: '2026-11-09T00:00:00Z',
          needStep: {
            id,
            state: 'PENDING',
            assignee: null,
            routingRow: 1,
            waitingReason: null,
            samePersonAsSpend: false,
            slaWorkingDays: 2,
            createdAt: '2026-11-09T00:00:00Z',
            assignedAt: null,
            decidedAt: null
          },
          needDecision: null,
          withdrawal: null,
          cancellation: null
        }
      }
    }
  })
})

test('loads only assigned individual grants and opens real details', async () => {
  const screen = await renderScreen()
  await screen.findByText('Figma')
  screen.getByText('Manager An')
  screen.getByText('Phòng IT')
  expect(needDecisionList).toHaveBeenCalledWith(
    { type: 'GRANT', page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Thiết kế')
  screen.getByText('Không áp dụng')
  await screen.findByText('Không có quyền hiện có cùng nhóm chức năng.')
  expect(accessRequestSimilarSeatList).toHaveBeenCalledWith(
    id,
    { page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  expect(accessRequestGet).toHaveBeenCalledWith(
    id,
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
})

test('uses manager tabs and links to personal software', async () => {
  const screen = await renderScreen()
  await screen.findByText('Manager An')
  expect(screen.queryByRole('tab', { name: 'Mở mục Phần mềm' })).toBeNull()
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Đội ngũ phòng' }))
  screen.getByText('Quản lý đội ngũ thực hiện trên web. Mobile hỗ trợ duyệt nhu cầu được giao.')
  await fireEvent.press(screen.getByRole('button', { name: 'Phần mềm và yêu cầu của tôi' }))
  expect(mockRouter.push).toHaveBeenCalledWith('/my-software')
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Hàng đợi' }))
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Thông báo' }))
  await waitFor(() => expect(notificationList).toHaveBeenCalled())
  expect(screen.queryByRole('tab', { name: 'Mở mục Phần mềm' })).toBeNull()
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Hàng đợi' }))
  await screen.findByText('Figma')
})

test('employee cannot enter the manager workspace or load its queue', async () => {
  const response = await jest.mocked(meGet)()
  if (!response.data.data) throw new Error('Expected account')
  jest.mocked(meGet).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        roles: ['EMPLOYEE'],
        managerScope: null
      }
    }
  })

  await renderScreen()
  await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith('/my-software'))
  expect(needDecisionList).not.toHaveBeenCalled()
})

test('explains a missing manager assignment rather than displaying a fabricated queue', async () => {
  const response = await jest.mocked(meGet)()
  if (!response.data.data) throw new Error('Expected account')
  jest.mocked(meGet).mockResolvedValue({
    ...response,
    data: { ...response.data, data: { ...response.data.data, managerScope: null } }
  })
  const screen = await renderScreen()
  await screen.findByText(
    'Tài khoản chưa có phạm vi trưởng phòng đang hiệu lực. Hãy tải lại hoặc liên hệ quản trị viên.'
  )
  expect(needDecisionList).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Phần mềm và yêu cầu của tôi' }))
  expect(mockRouter.push).toHaveBeenCalledWith('/my-software')
})

test('allows manager to sign out and reports sign-out failures', async () => {
  mockSession.logout.mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Manager An')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }))
  await screen.findByText('Chưa thể xác nhận đăng xuất với máy chủ. Vui lòng kiểm tra kết nối và thử lại.')
  expect(mockSession.logout).toHaveBeenCalledTimes(1)
})

test('shows similar access returned by the backend and supports pagination', async () => {
  const response = await jest.mocked(accessRequestSimilarSeatList)(id)
  if (!response.data.data) throw new Error('Expected similar seats')
  jest.mocked(accessRequestSimilarSeatList).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        items: [
          {
            assignmentId: id,
            plan: { planId: id, planName: 'Business', applicationId: id, applicationName: 'Miro' },
            accountIdentifier: 'private@example.test',
            heldSince: '2026-01-01'
          }
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 21, totalPages: 2 }
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Miro')
  screen.getByText('Gói: Business')
  expect(screen.queryByText('private@example.test')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Trang sau' }))
  await waitFor(() =>
    expect(accessRequestSimilarSeatList).toHaveBeenCalledWith(id, { page: 2, pageSize: 20 }, expect.anything())
  )
  await screen.findByText('Trang 2')
})

test('reports failure to load similar access and can retry', async () => {
  jest.mocked(accessRequestSimilarSeatList).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Không thể tải quyền hiện có. Vui lòng thử lại.')
  await fireEvent.press(screen.getByRole('button', { name: /Không thể tải quyền hiện có/ }))
  await screen.findByText('Không có quyền hiện có cùng nhóm chức năng.')
})

test('waits for a verified manager profile before loading assigned approvals', async () => {
  jest.mocked(meGet).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Không thể tải thông tin tài khoản. Vui lòng thử lại.')
  expect(needDecisionList).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await screen.findByText('Manager An')
  await screen.findByText('Figma')
})

test('does not allow a decision if detail identifies a different request', async () => {
  const response = await jest.mocked(accessRequestGet)(id)
  if (!response.data.data || !('request' in response.data.data)) throw new Error('Expected request')
  jest.mocked(accessRequestGet).mockResolvedValueOnce({
    ...response,
    data: { ...response.data, data: { request: { ...response.data.data.request, id: 'another-id' } } }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Không thể tải yêu cầu này. Yêu cầu có thể không còn được giao cho bạn.')
  expect(screen.queryByRole('button', { name: 'Duyệt nhu cầu' })).toBeNull()
  expect(accessRequestSimilarSeatList).not.toHaveBeenCalled()
})

test('rejects with a required reason and refreshes the assigned queue', async () => {
  const response = await jest.mocked(accessRequestGet)(id)
  if (!response.data.data || !('request' in response.data.data)) throw new Error('Expected request')
  const request = response.data.data.request
  jest.mocked(accessRequestNeedDecide).mockResolvedValueOnce({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'NEED.DECIDED',
      data: {
        request: {
          ...request,
          needDecision: {
            decision: 'REJECTED',
            decidedBy: request.requester,
            deciderRole: 'MANAGER',
            reason: 'Chưa cần',
            decidedAt: '2026-11-10T00:00:00Z'
          }
        }
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Thiết kế')
  await screen.findByText('Không có quyền hiện có cùng nhóm chức năng.')
  await fireEvent.press(screen.getByRole('button', { name: 'Từ chối' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  screen.getByText('Nhập lý do từ chối từ 1 đến 1000 ký tự.')
  expect(accessRequestNeedDecide).not.toHaveBeenCalled()
  await fireEvent.changeText(screen.getByLabelText('Lý do từ chối'), '  Chưa cần  ')
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Đã ghi nhận quyết định nhu cầu. Quay lại danh sách để xem các việc được giao mới nhất.')
  expect(accessRequestNeedDecide).toHaveBeenCalledWith(
    id,
    { decision: 'REJECT', reason: 'Chưa cần' },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  await waitFor(() => expect(needDecisionList).toHaveBeenCalledTimes(2))
})

test('does not retry or report success for an uncertain approval', async () => {
  jest.mocked(accessRequestNeedDecide).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Thiết kế')
  await screen.findByText('Không có quyền hiện có cùng nhóm chức năng.')
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Chưa thể xác nhận quyết định. Hãy quay lại danh sách và kiểm tra trước khi thử lại.')
  expect(accessRequestNeedDecide).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Xác nhận quyết định' }).props.accessibilityState.disabled).toBe(true)
})

test('confirms approval only after confirmation', async () => {
  const response = await jest.mocked(accessRequestGet)(id)
  if (!response.data.data || !('request' in response.data.data)) throw new Error('Expected request')
  const request = response.data.data.request
  jest.mocked(accessRequestNeedDecide).mockResolvedValueOnce({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'NEED.DECIDED',
      data: {
        request: {
          ...request,
          needDecision: {
            decision: 'APPROVED',
            decidedBy: request.requester,
            deciderRole: 'MANAGER',
            reason: null,
            decidedAt: '2026-11-10T00:00:00Z'
          }
        }
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Thiết kế')
  await screen.findByText('Không có quyền hiện có cùng nhóm chức năng.')
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
  expect(accessRequestNeedDecide).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Đã ghi nhận quyết định nhu cầu. Quay lại danh sách để xem các việc được giao mới nhất.')
  expect(accessRequestNeedDecide).toHaveBeenCalledWith(
    id,
    { decision: 'APPROVE' },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  expect(accessRequestNeedDecide).toHaveBeenCalledTimes(1)
})

test('rejects inconsistent server responses', async () => {
  const response = await jest.mocked(accessRequestGet)(id)
  if (!response.data.data || !('request' in response.data.data)) throw new Error('Expected request')
  jest.mocked(accessRequestNeedDecide).mockResolvedValueOnce({
    status: 200,
    headers: new Headers(),
    data: { success: true, message: 'NEED.DECIDED', data: { request: response.data.data.request } }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Thiết kế')
  await screen.findByText('Không có quyền hiện có cùng nhóm chức năng.')
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
  expect(accessRequestNeedDecide).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Chưa thể xác nhận quyết định. Hãy quay lại danh sách và kiểm tra trước khi thử lại.')
  expect(accessRequestNeedDecide).toHaveBeenCalledWith(
    id,
    { decision: 'APPROVE' },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  expect(accessRequestNeedDecide).toHaveBeenCalledTimes(1)
  expect(screen.queryByText(/Đã ghi nhận quyết định/)).toBeNull()
})

test('shows price from the server with an English locale', async () => {
  await setAppLanguage('en', false)
  const response = await jest.mocked(accessRequestGet)(id)
  if (!response.data.data || !('request' in response.data.data)) throw new Error('Expected request')
  const request = response.data.data.request
  jest.mocked(accessRequestGet).mockResolvedValueOnce({
    ...response,
    data: {
      ...response.data,
      data: {
        request: {
          ...request,
          pricing: { ...request.pricing, status: 'PRICED', amount: { amount: '123.45', currency: 'USD' } }
        }
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: /Figma.*An/ }))
  await screen.findByText('$123.45')
  await screen.findByText('No existing access in the same functional group.')
  screen.getByText('Estimated request amount')
})

test('moves to the next page of assigned work', async () => {
  const response = await jest.mocked(needDecisionList)({ type: 'GRANT', page: 1, pageSize: 20 })
  if (!response.data.data) throw new Error('Expected queue')
  jest.mocked(needDecisionList).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: { ...response.data.data, pagination: { ...response.data.data.pagination, totalPages: 2 } }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Trang sau' }))
  await waitFor(() =>
    expect(needDecisionList).toHaveBeenCalledWith({ type: 'GRANT', page: 2, pageSize: 20 }, expect.anything())
  )
})

test('prevents approval for a term over 12 months', async () => {
  const response = await jest.mocked(accessRequestGet)(id)
  if (!response.data.data || !('request' in response.data.data)) throw new Error('Expected request')
  jest.mocked(accessRequestGet).mockResolvedValueOnce({
    ...response,
    data: { ...response.data, data: { request: { ...response.data.data.request, termMonths: 18 } } }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText(
    'Duyệt thời hạn trên 12 tháng cần xác nhận chưa có trong API hiện tại. Hãy dùng web hoặc liên hệ hỗ trợ.'
  )
  await screen.findByText('Không có quyền hiện có cùng nhóm chức năng.')
  expect(screen.getByRole('button', { name: 'Duyệt nhu cầu' }).props.accessibilityState.disabled).toBe(true)
})

test('rejects stale step and allows retry on failed queue', async () => {
  const response = await jest.mocked(accessRequestGet)(id)
  if (!response.data.data || !('request' in response.data.data)) throw new Error('Expected request')
  jest.mocked(accessRequestGet).mockResolvedValueOnce({
    ...response,
    data: {
      ...response.data,
      data: {
        request: {
          ...response.data.data.request,
          needStep: { ...response.data.data.request.needStep, state: 'CLOSED' }
        }
      }
    }
  })
  jest.mocked(needDecisionList).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Không thể tải danh sách được giao. Vui lòng thử lại.')
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Bước này không còn sẵn sàng để quyết định. Hãy quay lại và tải mới danh sách.')
  await screen.findByText('Không có quyền hiện có cùng nhóm chức năng.')
  expect(screen.queryByRole('button', { name: 'Duyệt nhu cầu' })).toBeNull()
})
