import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { NavigationAction } from '@react-navigation/native'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { BackHandler, Platform } from 'react-native'

import { LiveRequestCreateScreen } from '@/features/requests'
import { accessRequestPreview, accessRequestSubmit } from '@/shared/api/generated/api/access-requests/access-requests'
import { meDepartmentSoftwareList } from '@/shared/api/generated/api/department-software-list/department-software-list'
import {
  requestableApplicationList,
  requestablePlanList
} from '@/shared/api/generated/api/requestable-software/requestable-software'
import { i18n, setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { replace: jest.fn(), canGoBack: jest.fn(() => true) }
const mockNavigation = { dispatch: jest.fn() }
const mockPreventRemove = jest.fn<void, [boolean, (event: { data: { action: NavigationAction } }) => void]>()
const mockSession = {
  state: 'authenticated',
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token'),
  write: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
const mockRequestAccount = { roles: ['EMPLOYEE'], employee: { unplaced: false } }
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
jest.mock('@/shared/api/use-account-profile', () => ({
  useAccountProfile: () => ({ data: mockRequestAccount, isError: false })
}))
jest.mock('@/shared/api/generated/api/department-software-list/department-software-list', () => ({
  meDepartmentSoftwareList: jest.fn()
}))
jest.mock('@/shared/api/generated/api/requestable-software/requestable-software', () => ({
  requestablePlanList: jest.fn(),
  requestableApplicationList: jest.fn()
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
async function openFigma(screen: Awaited<ReturnType<typeof renderScreen>>) {
  await screen.findByText('Figma')
  await fireEvent.press(
    screen.getByRole('button', {
      name: i18n.t('requests.createLive.catalog.openSuggestion', { name: 'Figma', plan: 'Pro' })
    })
  )
  await screen.findByRole('button', { name: i18n.t('requests.createLive.choosePlan', { app: 'Figma', plan: 'Pro' }) })
}
beforeEach(async () => {
  jest.clearAllMocks()
  mockRouter.canGoBack.mockReturnValue(true)
  mockSession.state = 'authenticated'
  mockRequestAccount.roles = ['EMPLOYEE']
  mockRequestAccount.employee.unplaced = false
  await setAppLanguage('vi', false)
  jest.mocked(meDepartmentSoftwareList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'LISTED',
      data: {
        departmentId: id,
        items: [
          {
            entryId: id,
            applicationId: id,
            applicationName: 'Figma',
            applicationLogoUrl: null,
            planId: id,
            planName: 'Pro',
            note: null,
            addedAt: '2026-11-09T00:00:00Z'
          }
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 }
      }
    }
  })
  jest.mocked(requestableApplicationList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'LISTED',
      data: {
        items: [
          {
            id,
            name: 'Figma',
            kind: 'SAAS',
            logoUrl: null,
            vendorName: 'Figma Inc.',
            functionalGroup: { id, name: 'Design' },
            planCount: 1,
            costsMoney: true,
            canSubmit: false,
            submitBlockedReason: 'FINANCE_SETUP_INCOMPLETE'
          }
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 }
      }
    }
  })
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

test('does not load the catalog for an ineligible account entering the route directly', async () => {
  mockRequestAccount.roles = ['SPENDING_APPROVER']
  const screen = await renderScreen()
  screen.getByText('Tài khoản của bạn không thể tạo yêu cầu phần mềm. Hãy liên hệ quản trị viên nếu cần hỗ trợ.')
  expect(requestablePlanList).not.toHaveBeenCalled()
  expect(requestableApplicationList).not.toHaveBeenCalled()
  expect(meDepartmentSoftwareList).not.toHaveBeenCalled()
})

test('requires a valid reason, previews the actual plan, and locks after an uncertain submission', async () => {
  jest.mocked(accessRequestSubmit).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await openFigma(screen)
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

test('explains a confirmed rejection and requires a fresh preview before another submission', async () => {
  jest.mocked(accessRequestSubmit).mockRejectedValueOnce({
    status: 409,
    info: { success: false, error: { code: 'ACCESS_REQUEST.OPEN_REQUEST_EXISTS', details: { requestId: id } } }
  })
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
  await screen.findByText('Máy chủ từ chối vì bạn đã có yêu cầu đang xử lý cho gói này.')
  expect(accessRequestSubmit).toHaveBeenCalledTimes(1)
  await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu đang xử lý' }))
  screen.getByText('Gói đã chọn và thông tin bạn nhập sẽ không được lưu.')
  await fireEvent.press(screen.getByRole('button', { name: 'Tiếp tục chỉnh sửa' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Chỉnh sửa và kiểm tra lại' }))
  expect((await screen.findByLabelText('Lý do nghiệp vụ (bắt buộc)')).props.value).toBe('Thiết kế')
  expect(screen.queryByRole('button', { name: 'Gửi yêu cầu' })).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  expect(accessRequestPreview).toHaveBeenCalledTimes(2)
  expect(accessRequestSubmit).toHaveBeenCalledTimes(1)
})

test('links a confirmed existing-access conflict to its server-provided assignment', async () => {
  jest.mocked(accessRequestSubmit).mockRejectedValueOnce({
    status: 409,
    info: {
      success: false,
      error: { code: 'ACCESS_REQUEST.ALREADY_HOLDS_ACCESS', details: { assignment: { assignmentId: id } } }
    }
  })
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
  await screen.findByText('Máy chủ từ chối vì bạn đã có quyền sử dụng gói này.')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem quyền đã có' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Rời yêu cầu' }))
  expect(mockRouter.replace).toHaveBeenCalledWith({ pathname: '/my-software/[softwareId]', params: { softwareId: id } })
})

test('keeps the result uncertain for an unexpected status even when it contains a known code', async () => {
  jest.mocked(accessRequestSubmit).mockRejectedValueOnce({
    status: 503,
    info: { success: false, error: { code: 'ACCESS_REQUEST.OPEN_REQUEST_EXISTS' } }
  })
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
  await screen.findByText('Chưa thể xác nhận kết quả. Hãy kiểm tra danh sách yêu cầu trước khi gửi lại để tránh trùng.')
  expect(screen.queryByRole('button', { name: 'Chỉnh sửa và kiểm tra lại' })).toBeNull()
  expect(accessRequestSubmit).toHaveBeenCalledTimes(1)
})

test('removes preview on form changes and blocks submission if server rejects preview', async () => {
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  await fireEvent.press(screen.getByRole('button', { name: 'Chỉnh sửa thông tin' }))
  await fireEvent.changeText(await screen.findByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế mới')
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
  await openFigma(screen)
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
  await openFigma(screen)
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
  await openFigma(screen)
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
    await openFigma(screen)
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
  const secondId = '11234567-89ab-cdef-0123-456789abcdef'
  const second = {
    ...first,
    id: secondId,
    name: 'Team',
    application: { ...first.application, id: secondId, name: 'Slack' }
  }
  const data = response.data.data
  jest.mocked(requestablePlanList).mockImplementation(async (params) => ({
    ...response,
    data: { ...response.data, data: { ...data, items: params?.applicationId === secondId ? [second] : [first] } }
  }))
  const department = await jest.mocked(meDepartmentSoftwareList)()
  if (!department.data.data) throw new Error('Expected department software')
  department.data.data.items.push({
    entryId: secondId,
    applicationId: secondId,
    applicationName: 'Slack',
    applicationLogoUrl: null,
    planId: secondId,
    planName: 'Team',
    note: null,
    addedAt: '2026-11-09T00:00:00Z'
  })
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  expect(screen.queryByText('Slack')).toBeNull()
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Có thể gửi yêu cầu. Máy chủ sẽ kiểm tra lại khi gửi.')
  await fireEvent.press(screen.getByRole('button', { name: 'Chỉnh sửa thông tin' }))
  await fireEvent.press(await screen.findByRole('button', { name: 'Đổi gói' }))
  await fireEvent.press(await screen.findByRole('button', { name: 'Xem các gói của Slack, gợi ý Team' }))
  await fireEvent.press(await screen.findByRole('button', { name: 'Chọn Slack, Team' }))
  expect(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)').props.value).toBe('Thiết kế')
  expect(screen.queryByRole('button', { name: 'Gửi yêu cầu' })).toBeNull()
  screen.getByText('Slack')
})

test('confirms a navigation removal and replays its original action only after approval', async () => {
  const screen = await renderScreen()
  await openFigma(screen)
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
  await openFigma(screen)
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
    await openFigma(screen)
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
  jest.mocked(meDepartmentSoftwareList).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Không thể tải danh mục.')
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await waitFor(() => screen.getByText('Figma'))
})

test('navigates between employee tabs and confirms before discarding entered details', async () => {
  const screen = await renderScreen()
  await openFigma(screen)
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
  await openFigma(screen)
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
  await openFigma(screen)
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

test('shows actual price, future estimate, limit and approval route in the review step', async () => {
  const response = await jest.mocked(accessRequestPreview)({ planId: id })
  if (!response.data.data) throw new Error('Expected preview')
  const preview = response.data.data.preview
  const amount = { amount: '100.00', currency: 'USD' }
  jest.mocked(accessRequestPreview).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        preview: {
          ...preview,
          pricing: { ...preview.pricing, status: 'PRICED', monthlyPrice: amount, months: 2, amount },
          cost: {
            currentYear: { year: 2026, months: 1, amount },
            nextYear: { from: '2027-01-01', months: 1, amount, estimate: true },
            termCutAt: null,
            months: 2
          },
          chain: [
            {
              sequence: 1,
              kind: 'SPEND_APPROVAL',
              role: 'SPENDING_APPROVER',
              assignee: null,
              expectedWorkingDays: 2,
              explanation: 'HEAD_ASKS_FOR_SELF',
              waitingReason: 'NO_SPENDING_APPROVER'
            }
          ]
        }
      }
    }
  })
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Kết quả kiểm tra từ máy chủ')
  screen.getByText('Lý do nghiệp vụ: Thiết kế')
  screen.getByText(/Yêu cầu cấp mới đang xử lý trong tuần: 0\/3/)
  screen.getByText(/mỗi tháng × 2 tháng/)
  screen.getByText(/dự kiến, chưa phải chi phí hiện tại/)
  screen.getByText('Yêu cầu của trưởng phòng chuyển thẳng đến người duyệt chi.')
  screen.getByText('Chờ người duyệt chi.')
  expect(screen.queryByLabelText('Lý do nghiệp vụ (bắt buộc)')).toBeNull()
})

test('blocks a conflicting preview and confirms before opening existing access', async () => {
  const response = await jest.mocked(accessRequestPreview)({ planId: id })
  if (!response.data.data) throw new Error('Expected preview')
  jest.mocked(accessRequestPreview).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        preview: {
          ...response.data.data.preview,
          existingAccess: { assignmentId: id, effectiveFrom: '2026-01-01', validUntil: null }
        }
      }
    }
  })
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Bạn đã có quyền sử dụng phần mềm này.')
  expect(screen.getByRole('button', { name: 'Gửi yêu cầu' }).props.accessibilityState.disabled).toBe(true)
  await fireEvent.press(screen.getByRole('button', { name: 'Xem quyền đã có' }))
  screen.getByText('Gói đã chọn và thông tin bạn nhập sẽ không được lưu.')
  expect(mockRouter.replace).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Rời yêu cầu' }))
  expect(mockRouter.replace).toHaveBeenCalledWith({ pathname: '/my-software/[softwareId]', params: { softwareId: id } })
})

test('rejects a preview that belongs to a different plan', async () => {
  const response = await jest.mocked(accessRequestPreview)({ planId: id })
  if (!response.data.data) throw new Error('Expected preview')
  const preview = response.data.data.preview
  jest.mocked(accessRequestPreview).mockResolvedValue({
    ...response,
    data: { ...response.data, data: { preview: { ...preview, plan: { ...preview.plan, planId: 'other-plan' } } } }
  })
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Không thể kiểm tra yêu cầu. Vui lòng thử lại.')
  expect(screen.queryByRole('button', { name: 'Gửi yêu cầu' })).toBeNull()
  expect(accessRequestSubmit).not.toHaveBeenCalled()
})

test('shows missing pricing and review controls in English', async () => {
  await setAppLanguage('en', false)
  const response = await jest.mocked(accessRequestPreview)({ planId: id })
  if (!response.data.data) throw new Error('Expected preview')
  const preview = response.data.data.preview
  jest.mocked(accessRequestPreview).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        preview: {
          ...preview,
          pricing: { ...preview.pricing, status: 'MISSING' },
          spendSubmission: 'BLOCKED_UNTIL_PRICED'
        }
      }
    }
  })
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Select Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Business reason (required)'), 'Design')
  await fireEvent.press(screen.getByRole('button', { name: 'Review request' }))
  await screen.findByText('Pricing is not available yet.')
  screen.getByText('The spending step cannot proceed until pricing is available.')
  expect(screen.getByRole('button', { name: 'Send request' }).props.accessibilityState.disabled).toBe(false)
  screen.getByRole('button', { name: 'Edit request details' })
})

test('offers the conflicting open request and does not send even if the server response is inconsistent', async () => {
  const response = await jest.mocked(accessRequestPreview)({ planId: id })
  if (!response.data.data) throw new Error('Expected preview')
  const preview = response.data.data.preview
  jest.mocked(accessRequestPreview).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        preview: {
          ...preview,
          limits: { ...preview.limits, refusal: 'HAS_OPEN_REQUEST', openRequestId: id }
        }
      }
    }
  })
  const screen = await renderScreen()
  await openFigma(screen)
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Figma, Pro' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ (bắt buộc)'), 'Thiết kế')
  await fireEvent.press(screen.getByRole('button', { name: 'Kiểm tra yêu cầu' }))
  await screen.findByText('Bạn đã có yêu cầu đang xử lý cho gói này.')
  expect(screen.getByRole('button', { name: 'Gửi yêu cầu' }).props.accessibilityState.disabled).toBe(true)
  await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu đang xử lý' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Rời yêu cầu' }))
  expect(mockRouter.replace).toHaveBeenCalledWith({ pathname: '/live-requests/[requestId]', params: { requestId: id } })
  expect(accessRequestSubmit).not.toHaveBeenCalled()
})

test('browses suggestions, searches the full catalog, and loads plans for the selected application', async () => {
  const screen = await renderScreen()
  await screen.findByText('Figma')
  screen.getByText('Đây là gợi ý của phòng. Bạn vẫn có thể chọn trong toàn bộ danh mục.')
  expect(requestableApplicationList).not.toHaveBeenCalled()
  expect(requestablePlanList).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Xem toàn bộ danh mục' }))
  await screen.findByText('Nhà cung cấp: Figma Inc.')
  screen.getByText('Design')
  screen.getByText('1 gói')
  screen.getByText('Phòng ban chưa có trung tâm chi phí đang hoạt động. Hãy liên hệ bộ phận tài chính.')
  await fireEvent.changeText(screen.getByLabelText('Tìm ứng dụng'), 'Fig')
  await waitFor(() =>
    expect(requestableApplicationList).toHaveBeenLastCalledWith(
      { search: 'Fig', page: 1, pageSize: 20 },
      expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
    )
  )
  await fireEvent.changeText(screen.getByLabelText('Tìm ứng dụng'), '')
  await waitFor(() =>
    expect(requestableApplicationList).toHaveBeenLastCalledWith(
      { search: undefined, page: 1, pageSize: 20 },
      expect.anything()
    )
  )
  await fireEvent.press(await screen.findByRole('button', { name: 'Xem các gói của Figma' }))
  await screen.findByRole('button', { name: 'Chọn Figma, Pro' })
  expect(requestablePlanList).toHaveBeenCalledWith(
    { applicationId: id, page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  screen.getByText('Đã có dữ liệu giá')
})

test('does not retry or pretend a catalog is available when the account has no department', async () => {
  jest.mocked(requestableApplicationList).mockRejectedValue({
    status: 409,
    info: { error: { code: 'REQUESTABLE_SOFTWARE.NO_DEPARTMENT' } }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem toàn bộ danh mục' }))
  await screen.findByText('Tài khoản chưa thuộc phòng ban hợp lệ. Hãy liên hệ quản trị viên.')
  expect(requestableApplicationList).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('button', { name: 'Thử lại' })).toBeNull()
  expect(requestablePlanList).not.toHaveBeenCalled()
})

test('allows selecting an application outside department suggestions with missing pricing', async () => {
  const applications = await jest.mocked(requestableApplicationList)()
  const plans = await jest.mocked(requestablePlanList)()
  if (!applications.data.data || !plans.data.data) throw new Error('Expected catalog')
  const otherId = '11234567-89ab-cdef-0123-456789abcdef'
  applications.data.data.items.push({
    ...applications.data.data.items[0],
    id: otherId,
    name: 'Slack',
    vendorName: 'Slack'
  })
  plans.data.data.items[0].application = { ...plans.data.data.items[0].application, id: otherId, name: 'Slack' }
  plans.data.data.items[0].price.status = 'MISSING'
  const screen = await renderScreen()
  await screen.findByText('Figma')
  expect(screen.queryByText('Slack')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Xem toàn bộ danh mục' }))
  await fireEvent.press(await screen.findByRole('button', { name: 'Xem các gói của Slack' }))
  await screen.findByText('Chưa có dữ liệu giá')
  await fireEvent.press(screen.getByRole('button', { name: 'Chọn Slack, Pro' }))
  screen.getByText('Slack')
  screen.getByText('Gói: Pro')
})

test('paginates department suggestions without treating them as the full catalog', async () => {
  const response = await jest.mocked(meDepartmentSoftwareList)()
  if (!response.data.data) throw new Error('Expected department software')
  const data = response.data.data
  jest.mocked(meDepartmentSoftwareList).mockImplementation(async (params) => ({
    ...response,
    data: {
      ...response.data,
      data: {
        ...data,
        items: params?.page === 2 ? [{ ...data.items[0], entryId: 'other', applicationName: 'Slack' }] : data.items,
        pagination: { ...data.pagination, page: params?.page ?? 1, totalItems: 21, totalPages: 2 }
      }
    }
  }))
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Trang sau' }))
  await screen.findByText('Slack')
  expect(meDepartmentSoftwareList).toHaveBeenLastCalledWith({ page: 2, pageSize: 20 }, expect.anything())
  screen.getByRole('button', { name: 'Xem toàn bộ danh mục' })
})

test('confirms discarding a catalog search before leaving', async () => {
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.changeText(screen.getByLabelText('Tìm ứng dụng'), 'Fig')
  await fireEvent.press(screen.getByRole('button', { name: 'Quay lại yêu cầu' }))
  screen.getByText('Gói đã chọn và thông tin bạn nhập sẽ không được lưu.')
  expect(mockRouter.replace).not.toHaveBeenCalled()
})

test('distinguishes suggested plans for the same application to screen readers', async () => {
  const response = await jest.mocked(meDepartmentSoftwareList)()
  if (!response.data.data) throw new Error('Expected department software')
  response.data.data.items.push({ ...response.data.data.items[0], entryId: 'other', planName: 'Basic' })
  const screen = await renderScreen()
  await screen.findByRole('button', { name: 'Xem các gói của Figma, gợi ý Pro' })
  screen.getByRole('button', { name: 'Xem các gói của Figma, gợi ý Basic' })
})

test('shows an error instead of plans returned for a different application', async () => {
  const response = await jest.mocked(requestablePlanList)()
  if (!response.data.data) throw new Error('Expected plans')
  response.data.data.items[0].application.id = 'different-application'
  const screen = await renderScreen()
  await fireEvent.press(await screen.findByRole('button', { name: 'Xem các gói của Figma, gợi ý Pro' }))
  await screen.findByRole('alert')
  expect(screen.queryByRole('button', { name: 'Chọn Figma, Pro' })).toBeNull()
  screen.getByRole('button', { name: 'Thử lại' })
})
