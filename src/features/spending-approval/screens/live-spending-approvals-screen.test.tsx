import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

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

const mockRouter = { push: jest.fn() }
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
  useRouter: () => mockRouter
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

function makeApprovalDetail(lineCount = 1): SpendApprovalGet200 {
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
          beneficiary: null,
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
            beneficiary: null,
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
    data: approvalDetail satisfies SpendApprovalLineDecide200
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
})
