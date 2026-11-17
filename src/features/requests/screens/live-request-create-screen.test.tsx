import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { NavigationAction } from '@react-navigation/native'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { BackHandler, Platform } from 'react-native'

import { LiveRequestCreateScreen } from '@/features/requests'
import { accessRequestPreview, accessRequestSubmit } from '@/shared/api/generated/api/access-requests/access-requests'
import { requestablePlanList } from '@/shared/api/generated/api/requestable-software/requestable-software'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { replace: jest.fn(), canGoBack: jest.fn(() => true) }
const mockNavigation = { dispatch: jest.fn() }
const mockPreventRemove = jest.fn<void, [boolean, (event: { data: { action: NavigationAction } }) => void]>()
const mockSession = {
  state: 'authenticated',
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token'),
  write: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
jest.mock('expo-router', () => ({
  Redirect: () => null,
  useRouter: () => mockRouter,
  useFocusEffect: (callback: () => void | (() => void)) =>
    jest.requireActual<typeof import('react')>('react').useEffect(callback, [callback])
}))
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  usePreventRemove: (prevent: boolean, callback: (event: { data: { action: NavigationAction } }) => void) =>
    mockPreventRemove(prevent, callback)
}))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/requestable-software/requestable-software', () => ({
  requestablePlanList: jest.fn()
}))
jest.mock('@/shared/api/generated/api/access-requests/access-requests', () => ({
  accessRequestPreview: jest.fn(),
  accessRequestSubmit: jest.fn()
}))

const id = '01234567-89ab-cdef-0123-456789abcdef'
function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  return render(
    <QueryClientProvider client={client}>
      <LiveRequestCreateScreen />
    </QueryClientProvider>
  )
}
beforeEach(async () => {
  jest.clearAllMocks()
  mockRouter.canGoBack.mockReturnValue(true)
  mockSession.state = 'authenticated'
  await setAppLanguage('vi', false)
  jest.mocked(requestablePlanList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'PLAN.LISTED',
      data: {
        items: [
          {
            id,
            name: 'Pro',
            application: { id, name: 'Figma', kind: 'SAAS', logoUrl: null },
            provisioningType: 'K4',
            price: { status: 'PRICED', missingReason: null },
            costsMoney: true,
            canSubmit: true,
            submitBlockedReason: null
          }
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 }
      }
    }
  })
  jest.mocked(accessRequestPreview).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'REQUEST.PREVIEW',
      data: {
        preview: {
          plan: { planId: id, planName: 'Pro', applicationId: id, applicationName: 'Figma' },
          branch: 'PAID_IN_CATALOG',
          termMonths: null,
          termRefusal: null,
          department: { id, code: 'IT', name: 'IT' },
          costCenter: null,
          annualVendorAmount: null,
          existingAccess: null,
          blockedBy: null,
          limits: {
            openNewCount: 0,
            openNewMax: 3,
            resetsOn: '2026-11-16',
            refusal: null,
            openRequestId: null
          },
          limitExemption: null,
          canSubmit: true,
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
          costEstimate: null,
          spendSubmission: 'NOT_NEEDED',
          chain: [],
          totalExpectedWorkingDays: 2
        }
      }
    }
  })
})

test('requires a valid reason, previews the actual plan, and locks after an uncertain submission', async () => {
  jest.mocked(accessRequestSubmit).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  screen.getByText('Nhập thời gian hợp lệ cho gói và lý do từ 1 đến 1000 ký tự.')
  expect(accessRequestPreview).not.toHaveBeenCalled()
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), '  Thiết kế  ')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  expect(accessRequestPreview).toHaveBeenCalledWith(
    { planId: id },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
  await screen.findByText('Chưa thể xác nhận kết quả. Hãy kiểm tra danh sách yêu cầu trước khi gửi lại để tránh trùng.')
  expect(accessRequestSubmit).toHaveBeenCalledWith(
    { planId: id, businessReason: 'Thiết kế' },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  expect(screen.getByRole('button', { name: 'Gửi yêu cầu' }).props.accessibilityState.disabled).toBe(true)
  expect(accessRequestSubmit).toHaveBeenCalledTimes(1)
})

test('removes preview on form changes and blocks submission if server rejects preview', async () => {
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế mới')
  expect(screen.queryByRole('button', { name: 'Gửi yêu cầu' })).toBeNull()
  const response = await jest.mocked(accessRequestPreview)({ planId: id })
  if (!response.data.data) throw new Error('Expected preview')
  jest.mocked(accessRequestPreview).mockResolvedValueOnce({
    ...response,
    data: { ...response.data, data: { preview: { ...response.data.data.preview, canSubmit: false } } }
  })
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Hiện không thể gửi yêu cầu này.')
  expect(screen.getByRole('button', { name: 'Gửi yêu cầu' }).props.accessibilityState.disabled).toBe(true)
  expect(accessRequestSubmit).not.toHaveBeenCalled()
})

test('requires a duration for K1 and submits the reviewed number of months', async () => {
  const catalog = await jest.mocked(requestablePlanList)()
  if (!catalog.data.data) throw new Error('Expected catalog')
  catalog.data.data.items[0].provisioningType = 'K1'
  jest.mocked(accessRequestSubmit).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  screen.getByText('Nhập thời gian hợp lệ cho gói và lý do từ 1 đến 1000 ký tự.')
  expect(accessRequestPreview).not.toHaveBeenCalled()
  await fireEvent.changeText(screen.getByLabelText('Thời gian dùng theo tháng (bắt buộc, 1–9)'), '10')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  expect(accessRequestPreview).not.toHaveBeenCalled()
  await fireEvent.changeText(screen.getByLabelText('Thời gian dùng theo tháng (bắt buộc, 1–9)'), '3')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  expect(accessRequestPreview).toHaveBeenCalledWith({ planId: id, termMonths: 3 }, expect.anything())
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
  await waitFor(() =>
    expect(accessRequestSubmit).toHaveBeenCalledWith(
      { planId: id, businessReason: 'Thiết kế', termMonths: 3 },
      expect.anything()
    )
  )
  await screen.findByText('Chưa thể xác nhận kết quả. Hãy kiểm tra danh sách yêu cầu trước khi gửi lại để tránh trùng.')
})

test('allows a long-term K2 preview but respects a server refusal', async () => {
  const catalog = await jest.mocked(requestablePlanList)()
  if (!catalog.data.data) throw new Error('Expected catalog')
  catalog.data.data.items[0].provisioningType = 'K2'
  const result = await jest.mocked(accessRequestPreview)({ planId: id })
  if (!result.data.data) throw new Error('Expected preview')
  jest.mocked(accessRequestPreview).mockClear()
  jest.mocked(accessRequestPreview).mockResolvedValue({
    ...result,
    data: {
      ...result.data,
      data: { preview: { ...result.data.data.preview, canSubmit: false, termRefusal: 'TERM_LONG_TERM_NOT_ALLOWED' } }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Tài khoản của bạn cần chọn thời gian dùng có thời hạn.')
  expect(accessRequestPreview).toHaveBeenCalledWith({ planId: id }, expect.anything())
  expect(screen.getByRole('button', { name: 'Gửi yêu cầu' }).props.accessibilityState.disabled).toBe(true)
})

test('explains a cost center setup error returned by the server', async () => {
  jest.mocked(accessRequestPreview).mockRejectedValueOnce({
    status: 409,
    info: { success: false, error: { code: 'FINANCE.SETUP_INCOMPLETE' } }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Phòng ban chưa có trung tâm chi phí đang hoạt động. Hãy liên hệ bộ phận tài chính.')
  expect(accessRequestSubmit).not.toHaveBeenCalled()
})

test('sends deployed-contract JSON through the generated preview and submit clients', async () => {
  const previewResponse = await jest.mocked(accessRequestPreview)({ planId: id })
  const api = jest.requireActual<typeof import('@/shared/api/generated/api/access-requests/access-requests')>(
    '@/shared/api/generated/api/access-requests/access-requests'
  )
  const fetchMock = jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(new Response(JSON.stringify(previewResponse.data), { status: 200 }))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, message: 'ACCESS_REQUEST.SUBMITTED', data: { request: { id } } }), {
        status: 201
      })
    )
  jest.mocked(accessRequestPreview).mockImplementationOnce(api.accessRequestPreview)
  jest.mocked(accessRequestSubmit).mockImplementationOnce(api.accessRequestSubmit)
  try {
    const screen = await renderScreen()
    await screen.findByText('Figma')
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
    await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
    await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
    await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
    await fireEvent.press(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalled())
    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify({ planId: id }))
    expect(fetchMock.mock.calls[1][1]?.body).toBe(JSON.stringify({ planId: id, businessReason: 'Thiết kế' }))
  } finally {
    fetchMock.mockRestore()
  }
})

test('shows the form immediately and allows changing plans without losing entered details', async () => {
  const response = await jest.mocked(requestablePlanList)()
  if (!response.data.data) throw new Error('Expected catalog')
  const first = response.data.data.items[0]
  response.data.data.items.push({
    ...first,
    id: '11234567-89ab-cdef-0123-456789abcdef',
    name: 'Team',
    application: { ...first.application, name: 'Slack' }
  })
  const screen = await renderScreen()
  await screen.findByText('Slack')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  expect(screen.queryByText('Slack')).toBeNull()
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  await fireEvent.press(screen.getByRole('button', { name: 'Đổi gói' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Slack, Team' }))
  expect(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)').props.value).toBe('Thiết kế')
  expect(screen.queryByRole('button', { name: 'Gửi yêu cầu' })).toBeNull()
  screen.getByText('Slack')
})

test('confirms a navigation removal and replays its original action only after approval', async () => {
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  const action = { type: 'GO_BACK' }
  let [prevent, callback] = mockPreventRemove.mock.calls[mockPreventRemove.mock.calls.length - 1]
  expect(prevent).toBe(true)
  await act(() => callback({ data: { action } }))
  await fireEvent.press(screen.getByRole('button', { name: 'Tiếp tục chỉnh sửa' }))
  expect(mockNavigation.dispatch).not.toHaveBeenCalled()
  ;[, callback] = mockPreventRemove.mock.calls[mockPreventRemove.mock.calls.length - 1]
  await act(() => callback({ data: { action } }))
  await fireEvent.press(screen.getByRole('button', { name: 'Rời yêu cầu' }))
  expect(mockNavigation.dispatch).toHaveBeenCalledWith(action)
})

test('does not prevent the authentication redirect after session expiration', async () => {
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  mockSession.state = 'anonymous'
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  await screen.rerender(
    <QueryClientProvider client={client}>
      <LiveRequestCreateScreen />
    </QueryClientProvider>
  )
  expect(mockPreventRemove.mock.calls[mockPreventRemove.mock.calls.length - 1][0]).toBe(false)
})

test('confirms Android system back when this is the last route', async () => {
  const oldPlatform = Platform.OS
  Platform.OS = 'android'
  mockRouter.canGoBack.mockReturnValue(false)
  const listeners: (() => boolean | null | undefined)[] = []
  const subscription = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    listeners.push(handler)
    return { remove: jest.fn() }
  })
  const exit = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => {})
  try {
    const screen = await renderScreen()
    await screen.findByText('Figma')
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
    await act(() => expect(listeners[listeners.length - 1]()).toBe(true))
    await fireEvent.press(screen.getByRole('button', { name: 'Tiếp tục chỉnh sửa' }))
    expect(exit).not.toHaveBeenCalled()
    await act(() => expect(listeners[listeners.length - 1]()).toBe(true))
    await fireEvent.press(screen.getByRole('button', { name: 'Rời yêu cầu' }))
    expect(exit).toHaveBeenCalledTimes(1)
  } finally {
    Platform.OS = oldPlatform
    subscription.mockRestore()
    exit.mockRestore()
  }
})
test('loads catalog errors and retries', async () => {
  jest.mocked(requestablePlanList).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Không thể tải danh mục.')
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await waitFor(() => screen.getByText('Figma'))
})

test('navigates between employee tabs and confirms before discarding entered details', async () => {
  const screen = await renderScreen()
  await screen.findByText('Figma')
  expect(screen.getByRole('tab', { name: 'Mở mục Tạo yêu cầu' }).props.accessibilityState.selected).toBe(true)
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phần mềm' }))
  expect(mockRouter.replace).toHaveBeenCalledWith('/my-software')

  jest.clearAllMocks()
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Thông báo' }))
  screen.getByText('Gói đã chọn và thông tin bạn nhập sẽ không được lưu.')
  expect(mockRouter.replace).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Tiếp tục chỉnh sửa' }))
  expect(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)').props.value).toBe('Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Quay lại yêu cầu' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Rời yêu cầu' }))
  expect(mockRouter.replace).toHaveBeenCalledWith('/live-requests')
})

test('disables tab navigation while submitting', async () => {
  let rejectSubmit: (error: Error) => void = () => {
    throw new Error('Submission was not started')
  }
  jest.mocked(accessRequestSubmit).mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectSubmit = reject
      })
  )
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
  await waitFor(() =>
    expect(screen.getByRole('tab', { name: 'Mở mục Thông báo' }).props.accessibilityState.disabled).toBe(true)
  )
  const [prevent, callback] = mockPreventRemove.mock.calls[mockPreventRemove.mock.calls.length - 1]
  expect(prevent).toBe(true)
  await act(() => callback({ data: { action: { type: 'GO_BACK' } } }))
  expect(screen.queryByText('Rời khỏi yêu cầu này?')).toBeNull()
  expect(mockNavigation.dispatch).not.toHaveBeenCalled()
  rejectSubmit(new Error('offline'))
  await screen.findByText('Chưa thể xác nhận kết quả. Hãy kiểm tra danh sách yêu cầu trước khi gửi lại để tránh trùng.')
})

test('navigates to the created request after successful submission', async () => {
  jest.mocked(accessRequestSubmit).mockResolvedValueOnce({
    status: 201,
    headers: new Headers(),
    data: {
      success: true,
      message: 'REQUEST.CREATED',
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
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
  await waitFor(() =>
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/live-requests/[requestId]',
      params: { requestId: id }
    })
  )
  const [, callback] = mockPreventRemove.mock.calls[mockPreventRemove.mock.calls.length - 1]
  const action = { type: 'REPLACE' }
  await act(() => callback({ data: { action } }))
  expect(mockNavigation.dispatch).toHaveBeenCalledWith(action)
  await screen.findByText('Đang gửi yêu cầu. Vui lòng chờ.')
})
