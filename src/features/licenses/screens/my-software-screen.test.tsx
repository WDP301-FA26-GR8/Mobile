import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { MySoftwareScreen } from '@/features/licenses'
import { meGet, meSoftwareRightList } from '@/shared/api/generated/api/me/me'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockLogout = jest.fn()
const mockSession = {
  state: 'authenticated',
  logout: mockLogout,
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}

jest.mock('expo-router', () => ({ Redirect: () => null }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/me/me', () => ({ meGet: jest.fn(), meSoftwareRightList: jest.fn() }))

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(
    <QueryClientProvider client={client}>
      <MySoftwareScreen />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  await setAppLanguage('vi', false)
  jest.clearAllMocks()
  mockSession.state = 'authenticated'
  jest.mocked(meGet).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'ME.RETRIEVED',
      data: {
        appUserId: 'user-id',
        loginEmail: 'person@example.test',
        employee: {
          id: 'employee-id',
          employeeCode: 'E1',
          fullName: 'Nguyễn An',
          department: null,
          unplaced: true,
          jobTitle: null
        },
        roles: ['EMPLOYEE'],
        managerScope: null
      }
    }
  })
  jest.mocked(meSoftwareRightList).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'ME.SOFTWARE_RIGHTS_LISTED',
      data: {
        asOf: '2026-11-09',
        view: 'current',
        items: [
          {
            assignmentId: 'assignment-id',
            application: { id: 'application-id', name: 'Figma' },
            plan: { id: 'plan-id', name: 'Professional' },
            provisioningType: 'K4',
            status: 'ACTIVE',
            effectiveFrom: '2026-01-01',
            grantedOn: null,
            effectiveFromLabel: null,
            expectedEndDate: null,
            expiringSoon: false,
            validUntil: null,
            successorAssignmentId: null
          }
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 }
      }
    }
  })
})

test('shows only server account and rights, without invented license keys', async () => {
  const screen = await renderScreen()
  await screen.findByText('Figma')
  screen.getByText('Nguyễn An')
  screen.getByText('Gói: Professional')
  screen.getByText('Đang hoạt động')
  expect(screen.queryByText(/FIG-PRO/)).toBeNull()
  expect(meSoftwareRightList).toHaveBeenCalledWith(
    { view: 'current', page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
})

test('shows errors and retries without falling back to mock data', async () => {
  jest.mocked(meSoftwareRightList).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Không thể tải thông tin. Vui lòng kiểm tra kết nối và thử lại.')
  expect(screen.queryByText('Linear Plus')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await screen.findByText('Figma')
})

test('loads subsequent pages from the server', async () => {
  const first = await jest.mocked(meSoftwareRightList)()
  if (!first.data.data) throw new Error('Expected software page')
  const firstPage = {
    ...first,
    data: {
      ...first.data,
      data: { ...first.data.data, pagination: { page: 1, pageSize: 20, totalItems: 21, totalPages: 2 } }
    }
  }
  const secondPage = {
    ...firstPage,
    data: {
      ...firstPage.data,
      data: {
        ...firstPage.data.data,
        items: [],
        pagination: { page: 2, pageSize: 20, totalItems: 21, totalPages: 2 }
      }
    }
  }
  jest.mocked(meSoftwareRightList).mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage)
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Trang sau' }))
  await screen.findByText('Không có quyền phần mềm trên trang này.')
  expect(meSoftwareRightList).toHaveBeenLastCalledWith({ view: 'current', page: 2, pageSize: 20 }, expect.anything())
})

test('reports failed server logout without claiming success', async () => {
  mockLogout.mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }))
  await waitFor(() =>
    screen.getByText('Chưa thể xác nhận đăng xuất với máy chủ. Vui lòng kiểm tra kết nối và thử lại.')
  )
})
