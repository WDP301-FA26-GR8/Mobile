import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import type { ReactElement } from 'react'

import { LiveRequestDetailsScreen, LiveRequestsScreen } from '@/features/requests'
import { accessRequestGet, accessRequestWithdraw } from '@/shared/api/generated/api/access-requests/access-requests'
import { meAccessRequestList } from '@/shared/api/generated/api/me/me'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) }
const mockSession = {
  state: 'authenticated',
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token'),
  write: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => mockRouter }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/me/me', () => ({ meAccessRequestList: jest.fn() }))
jest.mock('@/shared/api/generated/api/access-requests/access-requests', () => ({
  accessRequestGet: jest.fn(),
  accessRequestWithdraw: jest.fn()
}))

const id = '01234567-89ab-cdef-0123-456789abcdef'
function renderScreen(element: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  return render(<QueryClientProvider client={client}>{element}</QueryClientProvider>)
}

test('returns to the previous screen or personal software', async () => {
  const screen = await renderScreen(<LiveRequestsScreen />)
  await fireEvent.press(screen.getByRole('button', { name: 'Quay lại' }))
  expect(mockRouter.replace).toHaveBeenCalledWith('/my-software')
})

beforeEach(async () => {
  await setAppLanguage('vi', false)
  jest.clearAllMocks()
  mockSession.state = 'authenticated'
  jest.mocked(meAccessRequestList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'REQUEST.LISTED',
      data: {
        items: [
          {
            id,
            type: 'GRANT',
            branch: 'PAID_IN_CATALOG',
            state: 'PENDING',
            plan: { planId: id, planName: 'Pro', applicationId: id, applicationName: 'Figma' },
            softwareName: null,
            beneficiary: null,
            lineCount: 1,
            termMonths: 12,
            submittedAt: '2026-11-09T00:00:00Z',
            updatedAt: '2026-11-09T00:00:00Z',
            needStep: { state: 'PENDING', assignee: null, waitingReason: null },
            spend: null,
            outcome: null,
            withdrawal: null,
            canWithdraw: true
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

test('lists server requests and opens their details', async () => {
  const screen = await renderScreen(<LiveRequestsScreen />)
  await screen.findByText('Figma')
  screen.getByText('Chờ xử lý')
  expect(meAccessRequestList).toHaveBeenCalledWith(
    { view: 'open', page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Tạo yêu cầu' }))
  expect(mockRouter.push).toHaveBeenCalledWith('/live-request-create')
  await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu cho Figma' }))
  expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/live-requests/[requestId]', params: { requestId: id } })
})

test('confirms withdrawal, sends once and reloads the list', async () => {
  const detail = await jest.mocked(accessRequestGet)(id)
  if (!detail.data.data || !('request' in detail.data.data)) throw new Error('Expected request')
  jest.mocked(accessRequestWithdraw).mockResolvedValueOnce({
    status: 200,
    headers: new Headers(),
    data: { success: true, message: 'REQUEST.WITHDRAWN', data: { request: detail.data.data.request } }
  })
  const screen = await renderScreen(<LiveRequestsScreen />)
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Rút yêu cầu cho Figma' }))
  screen.getByText('Rút yêu cầu này?')
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận rút' }))
  await waitFor(() =>
    expect(accessRequestWithdraw).toHaveBeenCalledWith(
      id,
      {},
      expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
    )
  )
  await waitFor(() => expect(meAccessRequestList).toHaveBeenCalledTimes(2))
})

test('surfaces uncertain withdrawal and prevents immediate repeat', async () => {
  jest.mocked(accessRequestWithdraw).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen(<LiveRequestsScreen />)
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Rút yêu cầu cho Figma' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận rút' }))
  await screen.findByText(
    'Chưa thể xác nhận kết quả. Hãy kiểm tra trạng thái yêu cầu sau khi tải lại trước khi thử lại.'
  )
  expect(screen.getByRole('button', { name: 'Rút yêu cầu cho Figma' }).props.accessibilityState.disabled).toBe(true)
  expect(accessRequestWithdraw).toHaveBeenCalledTimes(1)
})

test('does not offer withdrawal when the server does not allow it', async () => {
  const response = await jest.mocked(meAccessRequestList)()
  if (!response.data.data) throw new Error('Expected list data')
  jest.mocked(meAccessRequestList).mockResolvedValueOnce({
    ...response,
    data: {
      ...response.data,
      data: { ...response.data.data, items: response.data.data.items.map((item) => ({ ...item, canWithdraw: false })) }
    }
  })
  const screen = await renderScreen(<LiveRequestsScreen />)
  await screen.findByText('Figma')
  expect(screen.queryByRole('button', { name: 'Rút yêu cầu cho Figma' })).toBeNull()
})

test('switches server view, resets page and handles empty results', async () => {
  const response = await jest.mocked(meAccessRequestList)()
  if (!response.data.data) throw new Error('Expected list data')
  const data = response.data.data
  jest.mocked(meAccessRequestList).mockImplementation(async (params) => ({
    ...response,
    data: {
      ...response.data,
      data: {
        ...data,
        items: params?.view === 'ended' || params?.page === 2 ? [] : data.items,
        pagination: { ...data.pagination, page: params?.page ?? 1, totalPages: params?.view === 'ended' ? 0 : 2 }
      }
    }
  }))
  const screen = await renderScreen(<LiveRequestsScreen />)
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Trang sau' }))
  await screen.findByText('Không có yêu cầu trên trang này.')
  await fireEvent.press(screen.getByRole('button', { name: 'Đã kết thúc' }))
  await screen.findByText('Không có yêu cầu trên trang này.')
  expect(meAccessRequestList).toHaveBeenLastCalledWith({ view: 'ended', page: 1, pageSize: 20 }, expect.anything())
})

test('reports list failures and retries without showing demo requests', async () => {
  jest.mocked(meAccessRequestList).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen(<LiveRequestsScreen />)
  await screen.findByText('Không thể tải yêu cầu. Vui lòng thử lại.')
  expect(screen.queryByText('Linear Plus')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await screen.findByText('Figma')
})

test('shows detail from server and handles missing authorization with retry', async () => {
  jest.mocked(accessRequestGet).mockRejectedValueOnce({ status: 404 })
  const screen = await renderScreen(<LiveRequestDetailsScreen requestId={id} />)
  await screen.findByText('Không thể tải yêu cầu này. Tài khoản của bạn có thể không có quyền xem.')
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await screen.findByText('Thiết kế')
  screen.getByText('Figma')
  screen.getByText('12 tháng')
  expect(accessRequestGet).toHaveBeenLastCalledWith(
    id,
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Quay lại yêu cầu' }))
  expect(mockRouter.replace).toHaveBeenCalledWith('/live-requests')
})

test('handles draft details without displaying invented request information in English', async () => {
  await setAppLanguage('en', false)
  jest.mocked(accessRequestGet).mockResolvedValueOnce({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'DRAFT.RETRIEVED',
      data: {
        draft: {
          id,
          kind: 'INDIVIDUAL',
          departmentId: id,
          planId: id,
          beneficiaryCount: 1,
          createdAt: '2026-11-09T00:00:00Z'
        }
      }
    }
  })
  const screen = await renderScreen(<LiveRequestDetailsScreen requestId={id} />)
  await screen.findByText('Draft')
  screen.getByText('Draft editing is not available on mobile yet.')
  expect(screen.queryByText('Figma')).toBeNull()
})
