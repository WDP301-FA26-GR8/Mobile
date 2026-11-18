import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { LiveRequestDetailsScreen } from '@/features/requests'
import {
  accessRequestEventList,
  accessRequestGet,
  accessRequestWithdraw
} from '@/shared/api/generated/api/access-requests/access-requests'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) }
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
  ...jest.requireActual('@react-navigation/native'),
  usePreventRemove: jest.fn()
}))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/use-account-profile', () => ({
  useAccountProfile: () => ({
    data: { roles: ['EMPLOYEE'], employee: { id: '01234567-89ab-cdef-0123-456789abcdef', unplaced: false } },
    isError: false
  })
}))
jest.mock('@/shared/api/generated/api/access-requests/access-requests', () => ({
  accessRequestGet: jest.fn(),
  accessRequestEventList: jest.fn(),
  accessRequestWithdraw: jest.fn()
}))

const id = '01234567-89ab-cdef-0123-456789abcdef'

function mockRequest(state: string, extra: Record<string, unknown> = {}) {
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
          state,
          routing: { mode: 'VIA_HEAD', oneStepReason: null },
          plan: { planId: id, planName: 'Pro', applicationId: id, applicationName: 'Figma' },
          proposal: null,
          department: { id, code: 'IT', name: 'IT' },
          costCenter: null,
          requester: { employeeId: id, employeeCode: 'E1', fullName: 'An' },
          beneficiary: null,
          lineCount: 1,
          businessReason: 'Thiết kế',
          termMonths: 3,
          expectedEndDate: null,
          serviceAccount: null,
          limitExemption: null,
          renewal: null,
          spend: null,
          budgetYear: null,
          pricing: { status: 'NOT_APPLICABLE' },
          cost: null,
          policy: { version: 1, hasSpendStep: true, slaWorkingDays: 2 },
          submittedAt: '2026-11-09T00:00:00Z',
          needStep: {
            id,
            state: 'PENDING',
            assignee: { employeeId: id, employeeCode: 'M1', fullName: 'Bình' },
            routingRow: 1,
            waitingReason: null,
            slaWorkingDays: 2,
            createdAt: '2026-11-09T00:00:00Z',
            assignedAt: null,
            decidedAt: null
          },
          needDecision: null,
          withdrawal: null,
          cancellation: null,
          ...extra
        }
      }
    }
  } as never)
}

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  return render(
    <QueryClientProvider client={client}>
      <LiveRequestDetailsScreen requestId={id} />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  await setAppLanguage('vi', false)
  jest.clearAllMocks()
  jest.mocked(accessRequestEventList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'EVENTS',
      data: { items: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 } }
    }
  } as never)
})

test('shows the approval route and holder', async () => {
  mockRequest('PENDING')
  const screen = await renderScreen()
  await screen.findByText('Tuyến duyệt')
  screen.getByText('Người đang giữ: Bình')
})

test('confirms before withdrawing and reports the returned state', async () => {
  mockRequest('PENDING')
  jest.mocked(accessRequestWithdraw).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: { success: true, message: 'OK', data: { request: { id, state: 'WITHDRAWN' } } }
  } as never)
  const screen = await renderScreen()
  await fireEvent.press(await screen.findByRole('button', { name: 'Rút yêu cầu' }))
  expect(accessRequestWithdraw).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận rút' }))
  await waitFor(() => expect(accessRequestWithdraw).toHaveBeenCalledWith(id, {}, expect.anything()))
  await screen.findByText('Trạng thái máy chủ trả về:')
})

test('explains that a returned request is revised on the web', async () => {
  mockRequest('AWAITING_REQUESTER_REVISION')
  const screen = await renderScreen()
  await screen.findByText(/chỉ thực hiện được trên web/)
})

test('offers to request again after a rejection and opens the same application', async () => {
  mockRequest('REJECTED')
  const screen = await renderScreen()
  expect(screen.queryByRole('button', { name: 'Rút yêu cầu' })).toBeNull()
  await fireEvent.press(await screen.findByRole('button', { name: 'Xin lại Figma' }))
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/live-request-create',
    params: { applicationId: id, applicationName: 'Figma' }
  })
})

test('explains a refused withdrawal after a decision', async () => {
  mockRequest('PENDING')
  jest.mocked(accessRequestWithdraw).mockRejectedValue({
    status: 409,
    info: { error: { code: 'ACCESS_REQUEST.WITHDRAWAL_AFTER_DECISION', requestId: 'r1' } }
  })
  const screen = await renderScreen()
  await fireEvent.press(await screen.findByRole('button', { name: 'Rút yêu cầu' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận rút' }))
  await screen.findByText('Yêu cầu đã có quyết định nên không rút được nữa.')
})
