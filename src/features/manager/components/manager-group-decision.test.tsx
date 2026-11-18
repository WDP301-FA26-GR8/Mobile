import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import {
  accessRequestLineList,
  accessRequestLineNeedDecide
} from '@/shared/api/generated/api/group-requests/group-requests'
import { setAppLanguage } from '@/shared/i18n/i18n'

import { ManagerGroupDecision } from './manager-group-decision'

const mockSession = {
  state: 'authenticated',
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token'),
  write: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/group-requests/group-requests', () => ({
  accessRequestLineList: jest.fn(),
  accessRequestLineNeedDecide: jest.fn()
}))

const id = '01234567-89ab-cdef-0123-456789abcdef'
const person = (employeeId: string, fullName: string) => ({
  employee: { employeeId, employeeCode: employeeId, fullName },
  state: 'AWAITING_NEED'
})
const checklist = {
  policyVersionId: 'policy-1',
  step: { checklist: [{ code: 'Q1', text: 'Nhu cầu hợp lý?', check: 'PERSON' }] }
}

function renderIt() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  return render(
    <QueryClientProvider client={client}>
      <ManagerGroupDecision
        requestId={id}
        checklist={checklist}
        checklistLoading={false}
        checklistError={false}
        onReloadChecklist={jest.fn()}
      />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  await setAppLanguage('vi', false)
  jest.clearAllMocks()
  jest.mocked(accessRequestLineList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'OK',
      data: {
        items: [person('e1', 'Lan'), person('e2', 'Minh')],
        pagination: { page: 1, pageSize: 100, totalItems: 2, totalPages: 1 }
      }
    }
  } as never)
})

test('sends one decision per person with a single checklist', async () => {
  jest.mocked(accessRequestLineNeedDecide).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: { success: true, message: 'OK', data: { request: { id } } }
  } as never)
  const screen = await renderIt()
  await screen.findByText('Lan')
  const confirm = screen.getByRole('button', { name: 'Xác nhận quyết định' })
  expect(confirm.props.accessibilityState.disabled).toBe(true)
  await fireEvent.press(screen.getByRole('radio', { name: 'Duyệt Lan' }))
  await fireEvent.press(screen.getByRole('radio', { name: 'Từ chối Minh' }))
  await fireEvent.changeText(screen.getByLabelText('Lý do từ chối Minh'), 'Không cần')
  await fireEvent.press(screen.getAllByRole('radio', { name: 'Có' })[0]!)
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận quyết định' }))
  await waitFor(() =>
    expect(accessRequestLineNeedDecide).toHaveBeenCalledWith(
      id,
      {
        lines: [
          { employeeId: 'e1', decision: 'APPROVE' },
          { employeeId: 'e2', decision: 'REJECT', reason: 'Không cần' }
        ],
        checklist: { policyVersionId: 'policy-1', answers: [{ itemCode: 'Q1', answer: 'YES' }] }
      },
      expect.anything()
    )
  )
  await screen.findByText(/Đã ghi nhận quyết định cho nhóm/)
})

test('blocks approval when a checklist answer is No', async () => {
  const screen = await renderIt()
  await screen.findByText('Lan')
  await fireEvent.press(screen.getByRole('radio', { name: 'Duyệt Lan' }))
  await fireEvent.press(screen.getByRole('radio', { name: 'Duyệt Minh' }))
  await fireEvent.press(screen.getAllByRole('radio', { name: 'Không' })[0]!)
  expect(screen.getByRole('button', { name: 'Xác nhận quyết định' }).props.accessibilityState.disabled).toBe(true)
  expect(accessRequestLineNeedDecide).not.toHaveBeenCalled()
})
