import AsyncStorage from '@react-native-async-storage/async-storage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { MySoftwareScreen } from '@/features/licenses'
import { employeeDashboardGet } from '@/shared/api/generated/api/dashboards/dashboards'
import { meGet, meSoftwareRightList } from '@/shared/api/generated/api/me/me'
import { setAppLanguage } from '@/shared/i18n/i18n'
import { ThemeProvider } from '@/shared/theme/theme-provider'

const mockLogout = jest.fn()
const mockSession = {
  state: 'authenticated',
  logout: mockLogout,
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}

const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => ({ push: mockPush, replace: mockReplace }) }))
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
          unplaced: false,
          jobTitle: null
        },
        roles: ['EMPLOYEE'],
        managerScope: null,
        upcomingUnits: [],
        pendingPolicyAcknowledgements: [],
        avatar: null,
        workPhone: null
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
            assignmentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
            application: { id: 'application-id', name: 'Figma', logoUrl: null },
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
  screen.getByText('Gói: Professional')
  screen.getByText('Đang sử dụng')
  screen.getByText('0 quyền')
  screen.getByText('1 quyền')
  expect(screen.queryByText('Không gian nhân viên · demo')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Trang trước' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Đăng xuất' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Duyệt nhu cầu' })).toBeNull()
  expect(screen.queryByText(/FIG-PRO/)).toBeNull()
  expect(meSoftwareRightList).toHaveBeenCalledWith(
    { view: 'current', page: 1, pageSize: 20 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Mở quyền phần mềm: Figma, Professional' }))
  expect(mockPush).toHaveBeenCalledWith({
    pathname: '/my-software/[softwareId]',
    params: { softwareId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }
  })
})

test('uses the stored dark appearance', async () => {
  await AsyncStorage.setItem('saas-sentry.theme', 'dark')
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const screen = await render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <MySoftwareScreen />
      </ThemeProvider>
    </QueryClientProvider>
  )
  await screen.findByText('Figma')
  await waitFor(() =>
    expect(screen.getByRole('header', { name: 'Phần mềm của tôi' })).toHaveStyle({ color: '#f8fcff' })
  )
  expect(screen.getByText('Figma')).toBeTruthy()
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

test('switches to ended software and resets the current-page filter', async () => {
  const response = await jest.mocked(meSoftwareRightList)()
  if (!response.data.data) throw new Error('Expected software data')
  const current = response.data.data
  jest.mocked(meSoftwareRightList).mockImplementation(async (params) => ({
    ...response,
    data: {
      ...response.data,
      data:
        params?.view === 'ended'
          ? { ...current, view: 'ended', items: [{ ...current.items[0], status: 'ENDED' }] }
          : current
    }
  }))
  const screen = await renderScreen()
  await screen.findByText('Figma')
  await fireEvent.press(screen.getByRole('button', { name: 'Sắp hết hạn' }))
  await fireEvent.press(screen.getByRole('button', { name: 'Đã kết thúc' }))
  await waitFor(() =>
    expect(meSoftwareRightList).toHaveBeenCalledWith({ view: 'ended', page: 1, pageSize: 20 }, expect.anything())
  )
  await screen.findByText('Figma')
  expect(screen.queryByRole('button', { name: 'Sắp hết hạn' })).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Hiện có' }))
  await screen.findByText('Figma')
  screen.getByRole('button', { name: 'Sắp hết hạn' })
})

test('keeps the active status visible alongside an expiry warning', async () => {
  const response = await jest.mocked(meSoftwareRightList)()
  if (!response.data.data) throw new Error('Expected software page')
  jest.mocked(meSoftwareRightList).mockResolvedValue({
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        items: response.data.data.items.map((item) => ({ ...item, expiringSoon: true }))
      }
    }
  })
  const screen = await renderScreen()
  await screen.findByText('Figma')
  screen.getByText('Đang sử dụng')
  screen.getByText('Sắp hết hạn trong bảy ngày')
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
  screen.getByRole('header', { name: 'My software' })
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
