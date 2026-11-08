import { fireEvent, render } from '@testing-library/react-native'
import { Text } from 'react-native'

import { NewRequestScreen, RequestsProvider, useRequests } from '@/features/requests'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn()
}

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter
}))

function RequestIdProbe() {
  const { requests } = useRequests()
  return <Text>{requests[0]?.id}</Text>
}

describe('<NewRequestScreen />', () => {
  beforeEach(async () => {
    mockRouter.back.mockClear()
    mockRouter.push.mockClear()
    mockRouter.replace.mockClear()
    await setAppLanguage('vi', false)
  })

  test('keeps Raycast separate from Claude and requires an out-of-standard reason', async () => {
    const screen = await render(
      <RequestsProvider>
        <NewRequestScreen />
      </RequestsProvider>
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Chọn Raycast' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Tiếp tục' }))
    screen.getByText('Raycast')
    screen.getByText('12 tháng')
    expect(screen.queryByText(/OI-07a/)).toBeNull()

    await fireEvent.press(screen.getByRole('button', { name: 'Xem lại yêu cầu' }))
    screen.getByText('Hãy nhập lý do nghiệp vụ cho phần mềm ngoài bộ công cụ chuẩn.')

    await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ'), 'Phục vụ công việc')
    await fireEvent.press(screen.getByRole('button', { name: 'Xem lại yêu cầu' }))

    screen.getByText('Xem lại trước khi gửi')
    screen.getByText('Mobile không trình lô. Khi áp dụng, trưởng phòng có thể trình lô trên web.')
    await fireEvent.press(screen.getByRole('button', { name: 'Quay lại' }))
    screen.getAllByText('Thông tin yêu cầu')
  })

  test('filters the catalog and shows an empty state for unmatched software', async () => {
    const screen = await render(
      <RequestsProvider>
        <NewRequestScreen />
      </RequestsProvider>
    )

    await fireEvent.changeText(screen.getByLabelText('Tìm phần mềm'), 'ray')
    screen.getByRole('button', { name: 'Chọn Raycast' })
    expect(screen.queryByRole('button', { name: 'Chọn Claude' })).toBeNull()

    await fireEvent.changeText(screen.getByLabelText('Tìm phần mềm'), 'unknown')
    screen.getByText('Không tìm thấy phần mềm')
  })

  test('shows OI-07a only above 12 months and creates a Claude request', async () => {
    const screen = await render(
      <RequestsProvider>
        <NewRequestScreen />
        <RequestIdProbe />
      </RequestsProvider>
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Chọn Claude' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Tiếp tục' }))
    screen.getByText(/OI-07a/)
    await fireEvent.press(screen.getByRole('button', { name: '12 tháng' }))
    expect(screen.queryByText(/OI-07a/)).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: '18 tháng' }))
    screen.getByText(/OI-07a/)

    await fireEvent.press(screen.getByRole('button', { name: 'Xem lại yêu cầu' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Gửi yêu cầu' }))

    screen.getByText('BM01-2107')
    expect(mockRouter.replace).toHaveBeenCalledWith({
      params: { requestId: 'BM01-2107' },
      pathname: '/my-requests/[requestId]'
    })
  })
})
