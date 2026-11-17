import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react-native'

import { LiveSoftwareDetailsScreen } from '@/features/licenses'
import { meSoftwareRightList } from '@/shared/api/generated/api/me/me'
import type { MySoftwarePageResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/me'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { back: jest.fn(), canGoBack: jest.fn(() => false), replace: jest.fn() }
const mockSession = {
  state: 'authenticated',
  read: <T,>(operation: (token: string) => Promise<T>) => operation('test-token')
}
jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => mockRouter }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/me/me', () => ({ meSoftwareRightList: jest.fn() }))

const assignmentId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const item: MySoftwarePageResponseDtoDataItemsItem = {
  assignmentId,
  application: { id: 'app', name: 'Figma', logoUrl: null },
  plan: { id: 'plan', name: 'Professional' },
  provisioningType: 'K4',
  status: 'ENDED',
  effectiveFrom: '2026-01-01',
  grantedOn: null,
  effectiveFromLabel: 'Ngày cấp thật chưa biết',
  expectedEndDate: null,
  validUntil: '2026-10-01',
  expiringSoon: false,
  successorAssignmentId: 'successor'
}

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(
    <QueryClientProvider client={client}>
      <LiveSoftwareDetailsScreen assignmentId={assignmentId} />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  jest.clearAllMocks()
  await setAppLanguage('vi', false)
  mockSession.state = 'authenticated'
})

test('finds an ended right after searching all current pages', async () => {
  jest.mocked(meSoftwareRightList).mockImplementation(async (params) => ({
    status: 200,
    headers: new Headers(),
    data: {
      success: true,
      message: 'LISTED',
      data: {
        asOf: '2026-11-09',
        view: params?.view ?? 'current',
        items: params?.view === 'ended' ? [item] : [],
        pagination: {
          page: params?.page ?? 1,
          pageSize: 100,
          totalItems: 1,
          totalPages: params?.view === 'current' ? 2 : 1
        }
      }
    }
  }))
  const screen = await renderScreen()
  await screen.findByText('Figma')
  screen.getByText('Ngày cấp thật chưa biết')
  screen.getByText('Đã gia hạn')
  screen.getByText(/Có hiệu lực đến:/)
  expect(meSoftwareRightList).toHaveBeenCalledTimes(3)
  expect(meSoftwareRightList).toHaveBeenLastCalledWith(
    { view: 'ended', page: 1, pageSize: 100 },
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } })
  )
  await fireEvent.press(screen.getByRole('button', { name: 'Quay lại' }))
  expect(mockRouter.replace).toHaveBeenCalledWith('/my-software')
})

test('distinguishes missing access from a failed lookup', async () => {
  jest
    .mocked(meSoftwareRightList)
    .mockRejectedValueOnce(new Error('offline'))
    .mockImplementation(async (params) => ({
      status: 200,
      headers: new Headers(),
      data: {
        success: true,
        message: 'LISTED',
        data: {
          asOf: '2026-11-09',
          view: params?.view ?? 'current',
          items: [],
          pagination: { page: 1, pageSize: 100, totalItems: 0, totalPages: 0 }
        }
      }
    }))
  const screen = await renderScreen()
  await screen.findByText('Không thể tải thông tin. Vui lòng kiểm tra kết nối và thử lại.')
  expect(screen.queryByText('Không tìm thấy quyền phần mềm này trong tài khoản của bạn.')).toBeNull()
  await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }))
  await screen.findByText('Không tìm thấy quyền phần mềm này trong tài khoản của bạn.')
})
