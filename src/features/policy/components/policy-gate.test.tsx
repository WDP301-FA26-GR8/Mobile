import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { Text } from 'react-native'

import { PolicyGate } from '@/features/policy'
import { meGet } from '@/shared/api/generated/api/me/me'
import { policyAcknowledgementCreate, policyGet } from '@/shared/api/generated/api/policies/policies'
import type { MeResponseDtoData } from '@/shared/api/generated/contracts/me'
import { i18n, setAppLanguage } from '@/shared/i18n/i18n'

const mockSession = {
  state: 'authenticated',
  logout: jest.fn(),
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token'),
  write: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/me/me', () => ({ meGet: jest.fn() }))
jest.mock('@/shared/api/generated/api/policies/policies', () => ({
  policyGet: jest.fn(),
  policyAcknowledgementCreate: jest.fn()
}))

const account: NonNullable<MeResponseDtoData> = {
  appUserId: 'account',
  loginEmail: 'person@example.test',
  roles: ['EMPLOYEE'],
  employee: { id: 'employee', employeeCode: 'E1', fullName: 'An', department: null, unplaced: false, jobTitle: null },
  managerScope: null,
  upcomingUnits: [],
  pendingPolicyAcknowledgements: [{ code: 'POL-MF1', title: 'Quy định', versionNumber: 1 }],
  avatar: null,
  workPhone: null
}
let version = 1

async function renderGate() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } }
  })
  return render(
    <QueryClientProvider client={client}>
      <PolicyGate>
        <Text>{i18n.t('home.live.actions')}</Text>
      </PolicyGate>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  jest.clearAllMocks()
  await setAppLanguage('vi', false)
  mockSession.state = 'authenticated'
  account.pendingPolicyAcknowledgements = [{ code: 'POL-MF1', title: 'Quy định', versionNumber: 1 }]
  version = 1
  jest.mocked(meGet).mockImplementation(async () => ({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'ME',
      data: { ...account, pendingPolicyAcknowledgements: [...account.pendingPolicyAcknowledgements] }
    }
  }))
  jest.mocked(policyGet).mockImplementation(async (code) => ({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'POLICY',
      data: {
        id: 'version',
        code,
        title: code === 'POL-MF1' ? 'Quy định' : 'Quy định khác',
        versionNumber: version,
        isCurrent: true,
        publishedAt: '2026-11-01T00:00:00Z',
        changeNote: '',
        publishedByAppUserId: null,
        requiresReacknowledgement: true,
        applicableRoles: ['EMPLOYEE'],
        content: { sections: [{ heading: 'Phạm vi', body: 'Nội dung chính sách' }], steps: [] },
        myAcknowledgement: null
      }
    }
  }))
})

test('blocks a directly opened screen until the server confirms the policy', async () => {
  jest.mocked(policyAcknowledgementCreate).mockImplementation(async () => {
    account.pendingPolicyAcknowledgements = []
    return {
      status: 201,
      headers: new Headers(),
      data: {
        success: true,
        message: 'ACK',
        data: { policyCode: 'POL-MF1', versionNumber: version, acknowledgedAt: null, alreadyAcknowledged: false }
      }
    }
  })
  const screen = await renderGate()
  await screen.findByText('Nội dung chính sách')
  expect(screen.queryByText('Truy cập nhanh')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Tôi đã đọc và hiểu' }))
  await waitFor(() => screen.getByText('Truy cập nhanh'))
  expect(policyAcknowledgementCreate).toHaveBeenCalledTimes(1)
  expect(policyAcknowledgementCreate).toHaveBeenCalledWith(
    'POL-MF1',
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
})

test('keeps the gate closed when acknowledgement and account refresh fail', async () => {
  jest.mocked(policyAcknowledgementCreate).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderGate()
  await screen.findByText('Nội dung chính sách')
  jest.mocked(meGet).mockRejectedValue(new Error('offline'))
  await fireEvent.press(screen.getByRole('button', { name: 'Tôi đã đọc và hiểu' }))
  await screen.findByText('Không thể tải thông tin tài khoản. Kiểm tra kết nối và thử lại.')
  expect(screen.queryByText('Truy cập nhanh')).toBeNull()
  expect(policyAcknowledgementCreate).toHaveBeenCalledTimes(1)
})

test('requires reading again when the acknowledged version changed during submission', async () => {
  jest.mocked(policyAcknowledgementCreate).mockImplementation(async () => {
    version = 2
    account.pendingPolicyAcknowledgements = []
    return {
      status: 201,
      headers: new Headers(),
      data: {
        success: true,
        message: 'ACK',
        data: { policyCode: 'POL-MF1', versionNumber: 2, acknowledgedAt: null, alreadyAcknowledged: false }
      }
    }
  })

  const screen = await renderGate()
  await screen.findByText('Phiên bản 1')
  await fireEvent.press(screen.getByRole('button', { name: 'Tôi đã đọc và hiểu' }))
  await screen.findByText('Chính sách đã thay đổi khi bạn xác nhận. Hãy đọc phiên bản hiện hành và xác nhận lại.')
  await screen.findByText('Phiên bản 2')
  expect(screen.queryByText('Truy cập nhanh')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Tôi đã đọc và hiểu' }))
  await waitFor(() => screen.getByText('Truy cập nhanh'))
  expect(policyAcknowledgementCreate).toHaveBeenCalledTimes(2)
})

test('keeps blocking until all pending policies are acknowledged', async () => {
  account.pendingPolicyAcknowledgements.push({ code: 'POL-IT1', title: 'Quy định khác', versionNumber: 1 })
  jest.mocked(policyAcknowledgementCreate).mockImplementation(async (code) => {
    account.pendingPolicyAcknowledgements = account.pendingPolicyAcknowledgements.filter(
      (policy) => policy.code !== code
    )
    return {
      status: 201,
      headers: new Headers(),
      data: {
        success: true,
        message: 'ACK',
        data: { policyCode: code, versionNumber: 1, acknowledgedAt: null, alreadyAcknowledged: false }
      }
    }
  })
  const screen = await renderGate()
  await screen.findByText('Nội dung chính sách')
  await fireEvent.press(screen.getByRole('button', { name: 'Tôi đã đọc và hiểu' }))
  await screen.findByText('Quy định khác')
  expect(screen.queryByText('Truy cập nhanh')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Tôi đã đọc và hiểu' }))
  await waitFor(() => screen.getByText('Truy cập nhanh'))
  expect(policyAcknowledgementCreate).toHaveBeenCalledTimes(2)
})

test('keeps the session and policy gate visible when sign out fails', async () => {
  mockSession.logout.mockRejectedValueOnce(new Error('offline'))
  const screen = await renderGate()
  await screen.findByText('Nội dung chính sách')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận đăng xuất' }))
  await screen.findByText('Chưa thể xác nhận đăng xuất với máy chủ. Vui lòng kiểm tra kết nối và thử lại.')
  expect(screen.queryByText('Truy cập nhanh')).toBeNull()
  expect(mockSession.logout).toHaveBeenCalledTimes(1)
})
