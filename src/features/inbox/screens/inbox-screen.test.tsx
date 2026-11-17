import { fireEvent, render as renderNative } from '@testing-library/react-native'
import type { ReactElement } from 'react'

import { RequestsProvider } from '@/entities/demo-requests'
import { InboxScreen } from '@/features/inbox'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn()
}

function render(element: ReactElement) {
  return renderNative(element, { wrapper: RequestsProvider })
}

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter
}))

describe('<InboxScreen />', () => {
  beforeEach(async () => {
    mockRouter.push.mockClear()
    mockRouter.replace.mockClear()
    await setAppLanguage('vi', false)
  })

  test('shows unread request notices and a read expiry notice', async () => {
    const screen = await render(<InboxScreen />)

    screen.getByText('Sẵn sàng cấp phát')
    screen.getByText('Nhu cầu đã được duyệt')
    screen.getByText('Yêu cầu bị từ chối')
    screen.getByText('Đã đọc')
    screen.getByText('Giấy phép Canva Team đã hết hạn.')
    screen.getByText('Ngân sách phòng quý này đã tối ưu. Dùng Figma Pro hoặc Canva Team trong bộ chuẩn.')
  })

  test('opens the corresponding request when a notification is selected', async () => {
    const screen = await render(<InboxScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo về Adobe Creative Cloud' }))

    expect(mockRouter.push).toHaveBeenCalledWith({
      params: { requestId: 'BM01-2041' },
      pathname: '/my-requests/[requestId]'
    })
  })

  test('provides all four mobile navigation tabs', async () => {
    const screen = await render(<InboxScreen />)

    screen.getByRole('tab', { name: 'Mở mục Phần mềm' })
    screen.getByRole('tab', { name: 'Mở mục Tạo yêu cầu' })
    screen.getByRole('tab', { name: 'Mở mục Yêu cầu' })
    screen.getByRole('tab', { name: 'Mở mục Thông báo' })
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Yêu cầu' }))
    expect(mockRouter.push).toHaveBeenCalledWith('/my-requests')
  })
})
