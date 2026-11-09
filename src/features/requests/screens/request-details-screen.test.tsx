import { fireEvent, render } from '@testing-library/react-native'

import { RequestDetailsScreen, RequestsProvider } from '@/features/requests'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRedirect = jest.fn((_props: { href: string }) => null)
const mockRouter = { back: jest.fn(), canGoBack: jest.fn(() => false), replace: jest.fn() }

jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => mockRedirect(props),
  useRouter: () => mockRouter
}))

describe('<RequestDetailsScreen />', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  test('shows the web-submitted Slack request with its locked amount and timeline', async () => {
    const screen = await render(
      <RequestsProvider>
        <RequestDetailsScreen requestId='BM01-2104' />
      </RequestsProvider>
    )

    screen.getByText('Slack Pro')
    screen.getByText('8.400.000 VNĐ/năm')
    screen.getByText('KH-2026-DEV-04')
    screen.getByText('Lê Hoàng đã trình lô trên web')
    screen.getByText('Chờ duyệt chi')
  })

  test('shows the Finance review notice without presenting a spending decision', async () => {
    const screen = await render(
      <RequestsProvider>
        <RequestDetailsScreen requestId='BM01-2103' />
      </RequestsProvider>
    )

    screen.getByText('Finance đang rà soát. Yêu cầu chưa vào hàng đợi Người duyệt chi.')
    expect(screen.queryByText('Đang chờ quyết định duyệt chi')).toBeNull()
  })

  test('shows the localized rejection reason without exposing budget codes or allowing withdrawal', async () => {
    const screen = await render(
      <RequestsProvider>
        <RequestDetailsScreen requestId='BM01-2041' />
      </RequestsProvider>
    )

    screen.getByText('Từ chối bởi trưởng phòng Lê Hoàng · 20/08/2025')
    screen.getByText('Ngân sách phòng quý này đã tối ưu. Dùng Figma Pro hoặc Canva Team trong bộ chuẩn.')
    screen.getByText('Không hiện mã kiểm tra ngân sách hay số dư. Không rút đơn đã kết thúc.')
    expect(screen.queryByRole('button', { name: 'Rút yêu cầu' })).toBeNull()
  })

  test('redirects an unknown request to the canonical list route', async () => {
    await render(
      <RequestsProvider>
        <RequestDetailsScreen requestId='index' />
      </RequestsProvider>
    )

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ href: '/my-requests' }))
  })

  test('returns to the request list when opened without history', async () => {
    const screen = await render(
      <RequestsProvider>
        <RequestDetailsScreen requestId='BM01-2104' />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Quay lại' }))
    expect(mockRouter.replace).toHaveBeenCalledWith('/my-requests')
  })
})
