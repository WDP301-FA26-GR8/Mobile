import { fireEvent, render } from '@testing-library/react-native'

import { RequestsProvider, MyRequestsScreen } from '@/features/requests'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn()
}

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter
}))

describe('<MyRequestsScreen />', () => {
  beforeEach(async () => {
    mockRouter.back.mockClear()
    mockRouter.push.mockClear()
    mockRouter.replace.mockClear()
    await setAppLanguage('vi', false)
  })

  test('allows withdrawal while waiting for execution, but not during execution', async () => {
    const screen = await render(
      <RequestsProvider>
        <MyRequestsScreen />
      </RequestsProvider>
    )

    screen.getByRole('button', { name: 'Rút yêu cầu BM01-2105' })
    expect(screen.queryByRole('button', { name: 'Rút yêu cầu BM01-2106' })).toBeNull()
    screen.getByText('Đang thực thi · không thể rút')
  })

  test('shows the Figma request sample IDs and withdrawal policy', async () => {
    const screen = await render(
      <RequestsProvider>
        <MyRequestsScreen />
      </RequestsProvider>
    )

    screen.getByText(/BM01-2101/)
    screen.getByText(/BM01-2041/)
    screen.getByText(/Hàng đợi là việc được giao/)
  })

  test('confirms withdrawal and changes the request to withdrawn', async () => {
    const screen = await render(
      <RequestsProvider>
        <MyRequestsScreen />
      </RequestsProvider>
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Rút yêu cầu BM01-2105' }))
    screen.getByText('Rút yêu cầu BM01-2105?')
    await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận rút' }))

    screen.getByText('Đã rút')
    expect(screen.queryByRole('button', { name: 'Rút yêu cầu BM01-2105' })).toBeNull()
  })

  test('opens the selected request details', async () => {
    const screen = await render(
      <RequestsProvider>
        <MyRequestsScreen />
      </RequestsProvider>
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Mở yêu cầu BM01-2104 cho Slack Pro' }))

    expect(mockRouter.push).toHaveBeenCalledWith({
      params: { requestId: 'BM01-2104' },
      pathname: '/my-requests/[requestId]'
    })
  })

  test('returns to My Software from the request list', async () => {
    const screen = await render(
      <RequestsProvider>
        <MyRequestsScreen />
      </RequestsProvider>
    )

    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phần mềm' }))

    expect(mockRouter.push).toHaveBeenCalledWith('/my-software')
  })
})
