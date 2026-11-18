import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { BackHandler, Platform } from 'react-native'

import { NotificationReadErrorProvider } from '@/features/inbox'
import { LiveNeedApprovalsScreen } from '@/features/manager'
import {
  accessRequestGet,
  accessRequestNeedDecide,
  accessRequestSimilarSeatList
} from '@/shared/api/generated/api/access-requests/access-requests'
import { meGet } from '@/shared/api/generated/api/me/me'
import { needDecisionList } from '@/shared/api/generated/api/need-decisions/need-decisions'
import { notificationList, notificationUnreadCount } from '@/shared/api/generated/api/notifications/notifications'
import { policyStepGet } from '@/shared/api/generated/api/policies/policies'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { replace: jest.fn(), push: jest.fn(), canGoBack: jest.fn(() => false) }
const mockRedirect = jest.fn()
const mockPreventRemove = jest.fn()
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
  useRouter: () => mockRouter,
  useFocusEffect: (callback: () => void | (() => void)) =>
    jest.requireActual<typeof import('react')>('react').useEffect(callback, [callback])
}))
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  usePreventRemove: (prevent: boolean) => mockPreventRemove(prevent)
}))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/need-decisions/need-decisions', () => ({ needDecisionList: jest.fn() }))
jest.mock('@/shared/api/generated/api/me/me', () => ({ meGet: jest.fn() }))
jest.mock('@/shared/api/generated/api/policies/policies', () => ({ policyStepGet: jest.fn() }))
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
function renderScreen(notification?: { requestId: string; source: 'assigned' | 'reminder' }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  return render(
    <QueryClientProvider client={client}>
      <NotificationReadErrorProvider>
        <LiveNeedApprovalsScreen notification={notification} />
      </NotificationReadErrorProvider>
    </QueryClientProvider>
  )
}
beforeEach(async () => {
  jest.clearAllMocks()
  await setAppLanguage('vi', false)
  jest.mocked(policyStepGet).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'POLICY.STEP',
      data: {
        policyCode: 'POL-MF1',
        policyVersionId: id,
        versionNumber: 1,
        step: { code: '1.2', title: 'Duyệt nhu cầu', checklist: [{ code: 'Q1', text: 'Kiểm tra', check: 'SYSTEM' }] }
      }
    }
  })
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
        managerScope: { departmentId: id, departmentCode: 'IT', departmentName: 'Phòng IT' },
        upcomingUnits: [],
        pendingPolicyAcknowledgements: [],
        avatar: null,
        workPhone: null
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
            expectedEndDate: null,
            pricing: { status: 'NOT_APPLICABLE', amount: null }
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
          routing: { mode: 'VIA_HEAD', oneStepReason: null },
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
          limitExemption: null,
          renewal: null,
          spend: null,
          budgetYear: null,
          pricing: {
            status: 'NOT_APPLICABLE',
            missingReason: null,
            amount: null,
            unitPrice: null,
            billingCycle: null,
            kind: null,
            months: null,
            monthlyPrice: null,
            nextYearAmount: null
          },
          cost: null,
          policy: { version: 1, hasSpendStep: true, slaWorkingDays: 2 },
          submittedAt: '2026-11-09T00:00:00Z',
          needStep: {
            id,
            state: 'PENDING',
            assignee: null,
            routingRow: 1,
            waitingReason: null,
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
  await fireEvent.press(screen.getByRole('button', { name: 'Mở thông tin tài khoản của Manager An' }))
  expect(mockRouter.push).toHaveBeenCalledWith('/profile')
  expect(needDecisionList).toHaveBeenCalledWith(
    { page: 1, pageSize: 20 },
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

test('opens assigned notification work found on a later queue page', async () => {
  const response = await jest.mocked(needDecisionList)()
  if (!response.data.data) throw new Error('Expected queue')
  const data = response.data.data
  jest.mocked(needDecisionList).mockImplementation(async (params) => {
    if (params?.pageSize !== 100) return response
    const page = params.page ?? 1
    return {
      ...response,
      data: {
        ...response.data,
        data: {
          ...data,
          items: page === 1 ? [] : data.items,
          pagination: { ...data.pagination, page, totalPages: 2 }
        }
      }
    }
  })
  const screen = await renderScreen({ requestId: id, source: 'assigned' })
  await screen.findByText('Thiết kế')
  expect(needDecisionList).toHaveBeenCalledWith(
    { page: 2, pageSize: 100 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  expect(accessRequestGet).toHaveBeenCalledWith(id, expect.anything())
  await screen.findByText('Không có quyền hiện có cùng nhóm chức năng.')
  await fireEvent.press(screen.getByRole('button', { name: 'Về danh sách được giao' }))
  await screen.findByText('Figma')
  expect(screen.queryByText('Thiết kế')).toBeNull()
})

test('does not open a stale or unsupported assigned notification as an individual decision', async () => {
  const response = await jest.mocked(needDecisionList)()
  if (!response.data.data) throw new Error('Expected queue')
  const data = response.data.data
  jest.mocked(needDecisionList).mockImplementation(async (params) =>
    params?.pageSize === 100
      ? {
          ...response,
          data: { ...response.data, data: { ...data, items: [{ ...data.items[0], type: 'SERVICE_ACCOUNT' }] } }
        }
      : response
  )
  const screen = await renderScreen({ requestId: id, source: 'assigned' })
  await screen.findByText(
    'Yêu cầu không còn được giao cho bạn hoặc chưa thể duyệt trên ứng dụng. Hãy kiểm tra hàng đợi hoặc xem trên web.'
  )
  expect(accessRequestGet).not.toHaveBeenCalled()
  expect(accessRequestNeedDecide).not.toHaveBeenCalled()
})

test('opens request detail for a need reminder not in the manager queue', async () => {
  const response = await jest.mocked(needDecisionList)()
  if (!response.data.data) throw new Error('Expected queue')
  const data = response.data.data
  jest
    .mocked(needDecisionList)
    .mockImplementation(async (params) =>
      params?.pageSize === 100 ? { ...response, data: { ...response.data, data: { ...data, items: [] } } } : response
    )
  await renderScreen({ requestId: id, source: 'reminder' })
  await waitFor(() =>
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/live-requests/[requestId]',
      params: { requestId: id }
    })
  )
  expect(accessRequestNeedDecide).not.toHaveBeenCalled()
})

test('does not fall back to request detail when checking the assigned queue fails', async () => {
  const response = await jest.mocked(needDecisionList)()
  jest.mocked(needDecisionList).mockImplementation(async (params) => {
    if (params?.pageSize === 100) throw new Error('offline')
    return response
  })
  const screen = await renderScreen({ requestId: id, source: 'reminder' })
  await screen.findByText('Không thể kiểm tra yêu cầu trong hàng đợi được giao. Vui lòng thử lại.')
  expect(mockRouter.replace).not.toHaveBeenCalled()
  expect(accessRequestGet).not.toHaveBeenCalled()
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
  await screen.findByText('Có (hệ thống kiểm tra)')
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  screen.getByText('Nhập lý do từ chối từ 1 đến 1000 ký tự.')
  expect(accessRequestNeedDecide).not.toHaveBeenCalled()
  await fireEvent.changeText(screen.getByLabelText('Lý do từ chối'), '  Chưa cần  ')
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Đã ghi nhận quyết định nhu cầu. Quay lại danh sách để xem các việc được giao mới nhất.')
  expect(accessRequestNeedDecide).toHaveBeenCalledWith(
    id,
    {
      decision: 'REJECT',
      reason: 'Chưa cần',
      checklist: { policyVersionId: id, answers: [{ itemCode: 'Q1', answer: 'YES' }] }
    },
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
  await screen.findByText('Có (hệ thống kiểm tra)')
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Chưa thể xác nhận quyết định. Hãy quay lại danh sách và kiểm tra trước khi thử lại.')
  expect(accessRequestNeedDecide).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Xác nhận quyết định' }).props.accessibilityState.disabled).toBe(true)
})

test('blocks navigation and Android system exit while a decision is in flight', async () => {
  const previousPlatform = Platform.OS
  Platform.OS = 'android'
  let back: () => boolean | null | undefined = () => false
  const subscription = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    back = handler
    return { remove: jest.fn() }
  })
  let rejectDecision: (error: Error) => void = () => {
    throw new Error('Decision was not started')
  }
  jest.mocked(accessRequestNeedDecide).mockImplementation(
    () =>
      new Promise((_resolve, reject) => {
        rejectDecision = reject
      })
  )
  try {
    const screen = await renderScreen()
    await screen.findByText('Figma')
    await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
    await screen.findByText('Thiết kế')
    expect(back()).toBe(false)
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
    await screen.findByText('Có (hệ thống kiểm tra)')
    await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
    await waitFor(() => {
      expect(mockPreventRemove).toHaveBeenLastCalledWith(true)
      expect(back()).toBe(true)
      expect(screen.getByRole('button', { name: 'Về danh sách được giao' }).props.accessibilityState.disabled).toBe(
        true
      )
      expect(screen.getByRole('tab', { name: 'Mở mục Thông báo' }).props.accessibilityState.disabled).toBe(true)
    })
    await act(() => rejectDecision(new Error('offline')))
    await screen.findByText('Chưa thể xác nhận quyết định. Hãy quay lại danh sách và kiểm tra trước khi thử lại.')
    await waitFor(() => expect(back()).toBe(false))
    expect(accessRequestNeedDecide).toHaveBeenCalledTimes(1)
    screen.unmount()
  } finally {
    subscription.mockRestore()
    jest.mocked(accessRequestNeedDecide).mockReset()
    Platform.OS = previousPlatform
  }
})

test('reports a server refusal when another decision already closed the step', async () => {
  jest.mocked(accessRequestNeedDecide).mockRejectedValueOnce({
    status: 409,
    info: { success: false, error: { code: 'ACCESS_REQUEST.STEP_NOT_PENDING' } }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
  await screen.findByText('Có (hệ thống kiểm tra)')
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Bước này không còn sẵn sàng để quyết định. Hãy quay lại và tải mới danh sách.')
  expect(accessRequestNeedDecide).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Xác nhận quyết định' }).props.accessibilityState.disabled).toBe(true)
})

test('reloads a changed checklist and requires a fresh answer before another decision', async () => {
  const original = await jest.mocked(policyStepGet)('POL-MF1', '1.2')
  if (!original.data.data) throw new Error('Expected checklist')
  const policy = original.data.data
  jest
    .mocked(policyStepGet)
    .mockResolvedValueOnce(original)
    .mockResolvedValue({
      ...original,
      data: {
        ...original.data,
        data: {
          ...policy,
          policyVersionId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          step: { ...policy.step, checklist: [{ code: 'Q2', text: 'Câu hỏi mới', check: 'PERSON' }] }
        }
      }
    })
  jest.mocked(accessRequestNeedDecide).mockRejectedValueOnce({
    status: 409,
    info: { success: false, error: { code: 'POLICY.VERSION_CHANGED' } }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
  await screen.findByText('Có (hệ thống kiểm tra)')
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Chính sách đã thay đổi. Hãy tải lại checklist và trả lời lại trước khi quyết định.')
  await fireEvent.press(screen.getByRole('button', { name: 'Tải lại checklist' }))
  await screen.findByText('Câu hỏi mới')
  expect(screen.getByRole('button', { name: 'Xác nhận quyết định' }).props.accessibilityState.disabled).toBe(true)
  expect(accessRequestNeedDecide).toHaveBeenCalledTimes(1)
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
  await screen.findByText('Có (hệ thống kiểm tra)')
  expect(accessRequestNeedDecide).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Đã ghi nhận quyết định nhu cầu. Quay lại danh sách để xem các việc được giao mới nhất.')
  expect(accessRequestNeedDecide).toHaveBeenCalledWith(
    id,
    { decision: 'APPROVE', checklist: { policyVersionId: id, answers: [{ itemCode: 'Q1', answer: 'YES' }] } },
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
  await screen.findByText('Có (hệ thống kiểm tra)')
  expect(accessRequestNeedDecide).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await screen.findByText('Chưa thể xác nhận quyết định. Hãy quay lại danh sách và kiểm tra trước khi thử lại.')
  expect(accessRequestNeedDecide).toHaveBeenCalledWith(
    id,
    { decision: 'APPROVE', checklist: { policyVersionId: id, answers: [{ itemCode: 'Q1', answer: 'YES' }] } },
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
  const response = await jest.mocked(needDecisionList)({ page: 1, pageSize: 20 })
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
  await waitFor(() => expect(needDecisionList).toHaveBeenCalledWith({ page: 2, pageSize: 20 }, expect.anything()))
})

test('requires a checklist answer and blocks approval for a No', async () => {
  const response = await jest.mocked(policyStepGet)('POL-MF1', '1.2')
  if (!response.data.data) throw new Error('Expected checklist')
  jest.mocked(policyStepGet).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        step: { ...response.data.data.step, checklist: [{ code: 'Q2', text: 'Có cần không?', check: 'PERSON' }] }
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem Figma do An yêu cầu' }))
  await screen.findByText('Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
  await screen.findByText('Có cần không?')
  expect(screen.getByRole('button', { name: 'Xác nhận quyết định' }).props.accessibilityState.disabled).toBe(true)
  await fireEvent.press(screen.getByRole('radio', { name: 'Không' }))
  screen.getByText('Không thể duyệt khi có câu trả lời Không.')
  expect(screen.getByRole('button', { name: 'Xác nhận quyết định' }).props.accessibilityState.disabled).toBe(true)
  expect(accessRequestNeedDecide).not.toHaveBeenCalled()
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
