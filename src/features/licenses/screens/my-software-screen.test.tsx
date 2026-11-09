import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { MySoftwareScreen } from '@/features/licenses'
import { employeeDashboardGet } from '@/shared/api/generated/api/dashboards/dashboards'
import { meGet, meSoftwareRightList } from '@/shared/api/generated/api/me/me'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockLogout = jest.fn()
const mockSession = {
  state: 'authenticated',
  logout: mockLogout,
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}

const mockPush = jest.fn()
jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => ({ push: mockPush }) }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/me/me', () => ({ meGet: jest.fn(), meSoftwareRightList: jest.fn() }))
jest.mock('@/shared/api/generated/api/dashboards/dashboards', () => ({ employeeDashboardGet: jest.fn() }))

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
  const counted = { state: 'COUNTED' as const, count: 0, sourceOperationId: 'meSoftwareRightList', reason: null }
  jest.mocked(employeeDashboardGet).mockResolvedValue({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'DASHBOARD.EMPLOYEE_RETRIEVED',
      data: {
        asOf: '2026-11-09',
        sections: { softwareRights: counted, expiringRights: counted, requests: counted, saasIssues: counted }
      }
    }
  })
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
  screen.getByText('0 quyền')
  screen.getByText('1 quyền')
  expect(screen.queryByText('Không gian nhân viên · demo')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Trang trước' })).toBeNull()
  await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Tạo yêu cầu' }))
  expect(mockPush).toHaveBeenCalledWith('/live-request-create')
  await fireEvent.press(screen.getByRole('button', { name: 'Mở mục Thông báo' }))
  expect(mockPush).toHaveBeenCalledWith('/live-inbox')
  expect(screen.queryByRole('button', { name: 'Duyệt nhu cầu' })).toBeNull()
  expect(screen.queryByText(/FIG-PRO/)).toBeNull()
  expect(meSoftwareRightList).toHaveBeenCalledWith(
    { view: 'current', page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
})

test('allows an active manager to return to the manager workspace', async () => {
  const response = await jest.mocked(meGet)()
  if (!response.data.data) throw new Error('Expected account')
  jest.mocked(meGet).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        roles: ['MANAGER'],
        managerScope: { departmentId: 'department-id', departmentCode: 'IT', departmentName: 'IT' }
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Nguyễn An')
  await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
  expect(mockPush).toHaveBeenCalledWith('/live-need-approvals')
})

test('filters the current page and explains the filter scope', async () => {
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Sắp hết hạn' }))
  screen.getByText('Bộ lọc chỉ áp dụng cho trang hiện tại. Chuyển trang để xem thêm.')
  screen.getByText('Không có quyền sắp hết hạn trên trang này.')
  expect(screen.queryByText('Figma')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Tất cả' }))
  screen.getByText('Figma')
})

test('shows unavailable rather than a fabricated total when the dashboard fails', async () => {
  jest.mocked(employeeDashboardGet).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Không thể tải tổng số quyền sắp hết hạn.')
  screen.getByText('Chưa có dữ liệu')
  expect(screen.queryByText('0 quyền')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: /Không thể tải tổng số quyền sắp hết hạn/ }))
  await screen.findByText('0 quyền')
})

test('does not present an unavailable dashboard section as zero', async () => {
  const response = await jest.mocked(employeeDashboardGet)()
  if (!response.data.data) throw new Error('Expected dashboard data')
  jest.mocked(employeeDashboardGet).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        sections: {
          ...response.data.data.sections,
          expiringRights: { state: 'NOT_AVAILABLE', count: null, sourceOperationId: null, reason: 'NO_DATA_SOURCE' }
        }
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await screen.findByText('Chưa có dữ liệu')
  expect(screen.queryByText('0 quyền')).toBeNull()
})

test('shows live software and unavailable navigation in English', async () => {
  await setAppLanguage('en', false)
  const screen = await renderScreen()
  await screen.findByText('Figma')
  screen.getByText('My workspace')
  await fireEvent.press(screen.getByRole('tab', { name: 'Open Requests' }))
  expect(mockPush).toHaveBeenCalledWith('/live-requests')
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

test('allows sign out when the profile cannot be loaded', async () => {
  jest.mocked(meGet).mockRejectedValueOnce(new Error('offline'))
  const screen = await renderScreen()
  await screen.findByText('Không thể tải thông tin. Vui lòng kiểm tra kết nối và thử lại.')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }))
  expect(mockLogout).toHaveBeenCalledTimes(1)
})
