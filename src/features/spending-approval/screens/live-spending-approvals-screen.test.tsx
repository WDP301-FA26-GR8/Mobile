import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { BackHandler, Platform } from 'react-native'

import { LiveSpendingApprovalsScreen } from '@/features/spending-approval'
import {
  accessRequestLineList,
  spendApprovalLineDecide
} from '@/shared/api/generated/api/group-requests/group-requests'
import { policyStepGet } from '@/shared/api/generated/api/policies/policies'
import {
  spendApprovalDecide,
  spendApprovalGet,
  spendApprovalList
} from '@/shared/api/generated/api/spend-approvals/spend-approvals'
import type { PolicyStepGet200 } from '@/shared/api/generated/contracts/policies'
import type {
  AccessRequestLineList200,
  LinesResponseDtoDataItemsItem,
  SpendApprovalLineDecide200
} from '@/shared/api/generated/contracts/group-requests'
import type { SpendApprovalDecide200, SpendApprovalGet200 } from '@/shared/api/generated/contracts/spend-approvals'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { push: jest.fn(), canGoBack: jest.fn(() => false) }
const mockPreventRemove = jest.fn()
const mockRedirect = jest.fn()
const mockSession = {
  state: 'authenticated' as 'authenticated' | 'anonymous' | 'loading',
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token'),
  write: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
const mockProfile = {
  data: {
    roles: ['SPENDING_APPROVER'],
    employee: { fullName: 'Alex Nguyen', department: { name: 'Engineering' } }
  },
  isError: false,
  refetch: jest.fn()
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
jest.mock('@/shared/api/use-account-profile', () => ({ useAccountProfile: () => mockProfile }))
jest.mock('@/shared/api/generated/api/spend-approvals/spend-approvals', () => ({
  spendApprovalList: jest.fn(),
  spendApprovalGet: jest.fn(),
  spendApprovalDecide: jest.fn()
}))
jest.mock('@/shared/api/generated/api/group-requests/group-requests', () => ({
  accessRequestLineList: jest.fn(),
  spendApprovalLineDecide: jest.fn()
}))
jest.mock('@/shared/api/generated/api/policies/policies', () => ({ policyStepGet: jest.fn() }))

function makeApprovalDetail(lineCount = 1, group = lineCount > 1): SpendApprovalGet200 {
  return {
    success: true,
    message: 'SPEND_APPROVAL.FETCHED',
    data: {
      spendApproval: {
        routing: { mode: 'VIA_HEAD', oneStepReason: null },
        requestId: '01234567-89ab-cdef-0123-456789abcdef',
        step: {
          id: '11234567-89ab-cdef-0123-456789abcdef',
          state: 'PENDING',
          waitingReason: null,
          assignee: null,
          openedAt: '2026-11-18T00:00:00.000Z',
          decidedAt: null,
          slaWorkingDays: 5
        },
        request: {
          state: 'AWAITING_SPEND_APPROVAL',
          plan: null,
          softwareName: 'Live app',
          requester: {
            employeeId: '21234567-89ab-cdef-0123-456789abcdef',
            employeeCode: 'E-1',
            fullName: 'Requester'
          },
          beneficiary: group
            ? null
            : {
                employeeId: '51234567-89ab-cdef-0123-456789abcdef',
                employeeCode: 'E-2',
                fullName: 'Beneficiary'
              },
          lineCount,
          costCenter: { id: '31234567-89ab-cdef-0123-456789abcdef', code: 'CC-1' },
          businessReason: 'Test request reason',
          termMonths: 6,
          expectedEndDate: '2027-05-01',
          budgetYear: 2026
        },
        need: null,
        cost: null,
        termCost: null,
        assessment: null,
        decision: null,
        budgetSnapshot: null,
        nextYearBudget: null,
        annualVendorAmount: null
      }
    }
  }
}

function returnedApproval(detail: SpendApprovalGet200): SpendApprovalGet200 {
  if (!detail.data) throw new Error('Missing test approval')
  const approval = detail.data.spendApproval
  return {
    ...detail,
    data: {
      spendApproval: {
        ...approval,
        step: { ...approval.step, state: 'CLOSED' },
        request: { ...approval.request, state: 'AWAITING_SPEND_SUBMISSION' },
        decision: null
      }
    }
  }
}

function makeWaitingLine(employeeId: string, fullName: string): LinesResponseDtoDataItemsItem {
  return {
    employee: { employeeId, employeeCode: employeeId, fullName },
    position: 1,
    state: 'NEED_CONFIRMED',
    needStep: { id: 'step-1', state: 'APPROVED', assignee: null },
    expectedEndDate: null,
    needDecision: null,
    spendDecision: null,
    cost: null,
    share: null,
    endedAt: null,
    endedBy: null,
    endReason: null,
    cancelCause: null
  }
}

function renderScreen(requestId?: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  return render(
    <QueryClientProvider client={client}>
      <LiveSpendingApprovalsScreen requestId={requestId} />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  jest.clearAllMocks()
  await setAppLanguage('vi', false)
  mockSession.state = 'authenticated'
  mockProfile.data.roles = ['SPENDING_APPROVER']
  jest.mocked(spendApprovalList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'SPEND_APPROVAL.LISTED',
      data: {
        items: [
          {
            routing: { mode: 'VIA_HEAD', oneStepReason: null },
            requestId: '01234567-89ab-cdef-0123-456789abcdef',
            stepId: '11234567-89ab-cdef-0123-456789abcdef',
            stepKind: 'SPEND_APPROVAL',
            openedAt: '2026-11-18T00:00:00.000Z',
            slaWorkingDays: 5,
            dueOn: '2026-11-25',
            plan: null,
            softwareName: 'Live app',
            requester: {
              employeeId: '21234567-89ab-cdef-0123-456789abcdef',
              employeeCode: 'E-1',
              fullName: 'Requester'
            },
            beneficiary: {
              employeeId: '51234567-89ab-cdef-0123-456789abcdef',
              employeeCode: 'E-2',
              fullName: 'Beneficiary'
            },
            lineCount: 1,
            costCenter: { id: '31234567-89ab-cdef-0123-456789abcdef', code: 'CC-1' },
            amount: { amount: '1200', currency: 'VND' },
            primaryCode: 'CLOSED_OR_EXPIRED_BUDGET_PERIOD',
            outcome: 'BLOCKED',
            nextYearBudget: null,
            batchId: null
          }
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 }
      }
    }
  })

  const approvalDetail = makeApprovalDetail()
  jest.mocked(spendApprovalGet).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: approvalDetail
  })

  const policy: PolicyStepGet200 = {
    success: true,
    message: 'POLICY.STEP',
    data: {
      policyCode: 'POL-MF1',
      policyVersionId: '41234567-89ab-cdef-0123-456789abcdef',
      versionNumber: 1,
      step: {
        code: '1.7',
        title: 'Duyệt chi',
        checklist: [{ code: '1.7-01', text: 'Checklist question', check: 'PERSON' }]
      }
    }
  }
  jest.mocked(policyStepGet).mockResolvedValue({ status: 200, headers: new Headers(), data: policy })
  jest.mocked(spendApprovalDecide).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      ...approvalDetail,
      data: {
        spendApproval: {
          ...approvalDetail.data!.spendApproval,
          step: { ...approvalDetail.data!.spendApproval.step, state: 'APPROVED' },
          request: { ...approvalDetail.data!.spendApproval.request, state: 'AWAITING_EXECUTION' },
          decision: {
            decision: 'APPROVED',
            reason: null,
            decidedAt: '2026-11-18T00:00:00.000Z',
            decidedBy: {
              employeeId: '21234567-89ab-cdef-0123-456789abcdef',
              employeeCode: 'E-1',
              fullName: 'Requester'
            }
          }
        }
      }
    } satisfies SpendApprovalDecide200
  })
})

test('renders work returned by the live queue with an accessible request action', async () => {
  const screen = await renderScreen()
  await screen.findByRole('button', { name: 'Xem 01234567-89ab-cdef-0123-456789abcdef cho Live app' })

  screen.getByText('Live app')
  screen.getByText('Người yêu cầu: Requester')
  screen.getByText('Kỳ ngân sách đã đóng hoặc hết hạn')
  expect(jest.mocked(spendApprovalList)).toHaveBeenCalled()
})

test('redirects accounts without the Spending Approver role to Home', async () => {
  mockProfile.data.roles = ['EMPLOYEE']
  await renderScreen()

  await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith('/home'))
  expect(spendApprovalList).not.toHaveBeenCalled()
})

test('verifies a notification in the assigned queue and blocks approval after a No answer', async () => {
  const screen = await renderScreen('01234567-89ab-cdef-0123-456789abcdef')

  await screen.findByText('Checklist question')
  const approve = screen.getByRole('button', { name: 'Duyệt' })
  expect(approve.props.accessibilityState?.disabled).toBeFalsy()
  await fireEvent.press(screen.getByRole('button', { name: 'Không' }))

  expect(screen.getByRole('button', { name: 'Duyệt' }).props.accessibilityState?.disabled).toBe(true)
  screen.getByText('Câu trả lời Không chặn phê duyệt. Bạn có thể từ chối hoặc trả về yêu cầu.')
  expect(spendApprovalGet).toHaveBeenCalledWith('01234567-89ab-cdef-0123-456789abcdef', expect.anything())
  expect(spendApprovalDecide).not.toHaveBeenCalled()
})

test('returns every waiting group line in one confirmed decision', async () => {
  const requestId = '01234567-89ab-cdef-0123-456789abcdef'
  const approvalDetail = makeApprovalDetail(2)
  const lines = [makeWaitingLine('employee-1', 'Employee One'), makeWaitingLine('employee-2', 'Employee Two')]
  jest.mocked(spendApprovalGet).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: approvalDetail
  })
  const lineResponse: AccessRequestLineList200 = {
    success: true,
    message: 'ACCESS_REQUEST.LINES',
    data: { items: lines, pagination: { page: 1, pageSize: 100, totalItems: 2, totalPages: 1 } }
  }
  jest.mocked(accessRequestLineList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: lineResponse
  })
  jest.mocked(spendApprovalLineDecide).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: returnedApproval(approvalDetail) satisfies SpendApprovalLineDecide200
  })

  const screen = await renderScreen(requestId)
  await screen.findByText('Employee One')
  await screen.findByText('Employee Two')
  await fireEvent.press(screen.getByRole('button', { name: 'Có' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Trả về trưởng bộ phận' }))
  await fireEvent.changeText(
    screen.getByLabelText('Lý do (bắt buộc trừ khi checklist có câu trả lời Không)'),
    'Budget review required'
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }))

  await waitFor(() =>
    expect(spendApprovalLineDecide).toHaveBeenCalledWith(
      requestId,
      {
        lines: [
          { employeeId: 'employee-1', decision: 'RETURN', reason: 'Budget review required' },
          { employeeId: 'employee-2', decision: 'RETURN', reason: 'Budget review required' }
        ],
        checklist: {
          policyVersionId: '41234567-89ab-cdef-0123-456789abcdef',
          answers: [{ itemCode: '1.7-01', answer: 'YES' }]
        }
      },
      expect.anything()
    )
  )
  expect(spendApprovalDecide).not.toHaveBeenCalled()
  await screen.findByText('Đã gửi quyết định. Hàng đợi sẽ được tải lại.')
})

test('uses the group endpoint when only one person remains in a group', async () => {
  const requestId = '01234567-89ab-cdef-0123-456789abcdef'
  const approvalDetail = makeApprovalDetail(1, true)
  jest.mocked(spendApprovalGet).mockResolvedValue({ status: 200, headers: new Headers(), data: approvalDetail })
  jest.mocked(accessRequestLineList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'ACCESS_REQUEST.LINES',
      data: {
        items: [makeWaitingLine('employee-1', 'Employee One')],
        pagination: { page: 1, pageSize: 100, totalItems: 1, totalPages: 1 }
      }
    }
  })
  jest.mocked(spendApprovalLineDecide).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: returnedApproval(approvalDetail)
  })

  const screen = await renderScreen(requestId)
  await screen.findByText('Employee One')
  await fireEvent.press(screen.getByRole('button', { name: 'Có' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Trả về trưởng bộ phận' }))
  await fireEvent.changeText(
    screen.getByLabelText('Lý do (bắt buộc trừ khi checklist có câu trả lời Không)'),
    'Needs review'
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }))
  await waitFor(() =>
    expect(spendApprovalLineDecide).toHaveBeenCalledWith(
      requestId,
      expect.objectContaining({ lines: [{ employeeId: 'employee-1', decision: 'RETURN', reason: 'Needs review' }] }),
      expect.anything()
    )
  )
  expect(spendApprovalDecide).not.toHaveBeenCalled()
  await screen.findByText('Đã gửi quyết định. Hàng đợi sẽ được tải lại.')
})

test('does not report a group approval as successful when its request state is inconsistent', async () => {
  const detail = makeApprovalDetail(1, true)
  if (!detail.data) throw new Error('Missing test approval')
  const approval = detail.data.spendApproval
  jest.mocked(spendApprovalGet).mockResolvedValue({ status: 200, headers: new Headers(), data: detail })
  jest.mocked(accessRequestLineList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'ACCESS_REQUEST.LINES',
      data: {
        items: [makeWaitingLine('employee-1', 'Employee One')],
        pagination: { page: 1, pageSize: 100, totalItems: 1, totalPages: 1 }
      }
    }
  })
  jest.mocked(spendApprovalLineDecide).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      ...detail,
      data: {
        spendApproval: {
          ...approval,
          step: { ...approval.step, state: 'APPROVED' },
          decision: {
            decision: 'APPROVED',
            reason: null,
            decidedAt: '2026-11-18T00:00:00.000Z',
            decidedBy: approval.request.requester
          }
        }
      }
    }
  })
  const screen = await renderScreen('01234567-89ab-cdef-0123-456789abcdef')
  await screen.findByText('Employee One')
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Có' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Tiếp tục với các quyết định riêng lẻ' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }))
  await screen.findByText('Máy chủ chưa xác nhận kết quả. Không thử gửi lại; hãy tải hàng đợi và kiểm tra trạng thái.')
  expect(spendApprovalLineDecide).toHaveBeenCalledTimes(1)
  expect(screen.queryByText('Đã gửi quyết định. Hàng đợi sẽ được tải lại.')).toBeNull()
})

test('confirms a returned individual request without a spend decision record', async () => {
  const requestId = '01234567-89ab-cdef-0123-456789abcdef'
  jest.mocked(spendApprovalDecide).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: returnedApproval(makeApprovalDetail())
  })
  const screen = await renderScreen(requestId)
  await screen.findByText('Checklist question')
  await fireEvent.press(screen.getByRole('button', { name: 'Có' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Trả về trưởng bộ phận' }))
  await fireEvent.changeText(
    screen.getByLabelText('Lý do (bắt buộc trừ khi checklist có câu trả lời Không)'),
    'Needs review'
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }))
  await screen.findByText('Đã gửi quyết định. Hàng đợi sẽ được tải lại.')
  expect(spendApprovalDecide).toHaveBeenCalledTimes(1)
})

test('returns a one-step request to its requester', async () => {
  const detail = makeApprovalDetail()
  if (!detail.data) throw new Error('Missing test approval')
  const approval = detail.data.spendApproval
  approval.routing = { mode: 'ONE_STEP', oneStepReason: 'REQUESTER_IS_HEAD' }
  const returned = returnedApproval(detail)
  if (!returned.data) throw new Error('Missing returned approval')
  returned.data.spendApproval.request.state = 'AWAITING_REQUESTER_REVISION'
  jest.mocked(spendApprovalGet).mockResolvedValue({ status: 200, headers: new Headers(), data: detail })
  jest.mocked(spendApprovalDecide).mockResolvedValue({ status: 200, headers: new Headers(), data: returned })
  const screen = await renderScreen('01234567-89ab-cdef-0123-456789abcdef')
  await screen.findByText('Checklist question')
  await fireEvent.press(screen.getByRole('button', { name: 'Có' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Trả về người yêu cầu' }))
  await fireEvent.changeText(
    screen.getByLabelText('Lý do (bắt buộc trừ khi checklist có câu trả lời Không)'),
    'Needs review'
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }))
  await screen.findByText('Đã gửi quyết định. Hàng đợi sẽ được tải lại.')
})

test('requires a different verified policy version before a manual retry', async () => {
  jest.mocked(spendApprovalDecide).mockRejectedValueOnce({
    status: 409,
    info: { error: { code: 'POLICY.VERSION_CHANGED' } }
  })
  const policy = await jest.mocked(policyStepGet)('POL-MF1', '1.7')
  if (!policy.data.data) throw new Error('Missing test policy')
  const screen = await renderScreen('01234567-89ab-cdef-0123-456789abcdef')
  await screen.findByText('Checklist question')
  await fireEvent.press(screen.getByRole('button', { name: 'Có' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }))
  await screen.findByText('Chính sách đã thay đổi trước khi ghi nhận quyết định. Tải checklist hiện tại và xem lại.')
  await fireEvent.press(screen.getByRole('button', { name: 'Tải lại chính sách và yêu cầu hiện tại' }))
  await screen.findByText('Không thể xác minh chính sách hoặc yêu cầu được giao. Hãy tải lại hoặc về hàng đợi.')
  expect(spendApprovalDecide).toHaveBeenCalledTimes(1)

  jest.mocked(policyStepGet).mockResolvedValue({
    ...policy,
    data: {
      ...policy.data,
      data: { ...policy.data.data, policyVersionId: '51234567-89ab-cdef-0123-456789abcdef' }
    }
  })
  await fireEvent.press(screen.getByRole('button', { name: 'Tải lại chính sách và yêu cầu hiện tại' }))
  await screen.findByText('Checklist question')
  expect(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }).props.accessibilityState.disabled).toBe(
    true
  )
  expect(spendApprovalDecide).toHaveBeenCalledTimes(1)
})

test.each([
  [
    409,
    'Máy chủ đã kiểm tra lại ngân sách và trả yêu cầu về người gửi hoặc trưởng bộ phận. Chưa có quyết định nào được ghi nhận.'
  ],
  [500, 'Máy chủ chưa xác nhận kết quả. Không thử gửi lại; hãy tải hàng đợi và kiểm tra trạng thái.']
])('uses HTTP status %i to distinguish a confirmed return from an uncertain failure', async (status, message) => {
  jest.mocked(spendApprovalDecide).mockRejectedValueOnce({
    status,
    info: { error: { code: 'SPEND.RECHECKED_RETURNED_TO_HEAD' } }
  })
  const screen = await renderScreen('01234567-89ab-cdef-0123-456789abcdef')
  await screen.findByText('Checklist question')
  await fireEvent.press(screen.getByRole('button', { name: 'Có' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }))
  await screen.findByText(message)
  expect(spendApprovalDecide).toHaveBeenCalledTimes(1)
})

test('locks navigation while a decision is in flight and never reports an inconsistent response as success', async () => {
  let resolveDecision: (value: Awaited<ReturnType<typeof spendApprovalDecide>>) => void = () => {
    throw new Error('Decision was not started')
  }
  jest.mocked(spendApprovalDecide).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveDecision = resolve
      })
  )
  const screen = await renderScreen('01234567-89ab-cdef-0123-456789abcdef')
  await screen.findByText('Checklist question')
  await fireEvent.press(screen.getByRole('button', { name: 'Có' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }))
  await waitFor(() => {
    expect(spendApprovalDecide).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Quay lại việc được giao' }).props.accessibilityState.disabled).toBe(true)
    expect(mockPreventRemove).toHaveBeenLastCalledWith(true)
  })
  await act(() => resolveDecision({ status: 200, headers: new Headers(), data: makeApprovalDetail() }))
  await screen.findByText('Máy chủ chưa xác nhận kết quả. Không thử gửi lại; hãy tải hàng đợi và kiểm tra trạng thái.')
  expect(screen.queryByText('Đã gửi quyết định. Hàng đợi sẽ được tải lại.')).toBeNull()
  expect(spendApprovalDecide).toHaveBeenCalledTimes(1)
})

test('blocks Android system exit on the last route while a decision is in flight', async () => {
  const previousPlatform = Platform.OS
  Platform.OS = 'android'
  let back: () => boolean | null | undefined = () => false
  const subscription = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    back = handler
    return { remove: jest.fn() }
  })
  let resolveDecision: (value: Awaited<ReturnType<typeof spendApprovalDecide>>) => void = () => {
    throw new Error('Decision was not started')
  }
  jest.mocked(spendApprovalDecide).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveDecision = resolve
      })
  )
  try {
    const screen = await renderScreen('01234567-89ab-cdef-0123-456789abcdef')
    await screen.findByText('Checklist question')
    expect(back()).toBe(false)
    await fireEvent.press(screen.getByRole('button', { name: 'Có' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định riêng lẻ' }))
    await waitFor(() => expect(back()).toBe(true))
    await act(() => resolveDecision({ status: 200, headers: new Headers(), data: makeApprovalDetail() }))
    await screen.findByText(
      'Máy chủ chưa xác nhận kết quả. Không thử gửi lại; hãy tải hàng đợi và kiểm tra trạng thái.'
    )
    await waitFor(() => expect(back()).toBe(false))
    screen.unmount()
  } finally {
    subscription.mockRestore()
    Platform.OS = previousPlatform
  }
})
