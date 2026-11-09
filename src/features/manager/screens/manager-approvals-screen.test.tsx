import { fireEvent, render as renderNative } from '@testing-library/react-native'
import type { ReactElement } from 'react'

import { RequestsProvider } from '@/entities/demo-requests'
import { ManagerApprovalsScreen } from '@/features/manager'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = {
  push: jest.fn()
}

function render(element: ReactElement) {
  return renderNative(element, { wrapper: RequestsProvider })
}

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter
}))

describe('<ManagerApprovalsScreen />', () => {
  beforeEach(async () => {
    mockRouter.push.mockClear()
    await setAppLanguage('vi', false)
  })

  test('separates assigned work from SoD-4 and Finance department visibility', async () => {
    const screen = await render(<ManagerApprovalsScreen />)

    screen.getByRole('button', { name: 'Xem yêu cầu BM01-2102 cho Claude Team AI' })
    screen.getByRole('button', { name: 'Xem yêu cầu BM01-2091 cho Raycast Pro' })
    expect(screen.queryByText('BM01-2088')).toBeNull()

    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phòng ban' }))
    screen.getByText('BM01-2088')
    screen.getByText('BM01-2103')
    screen.getByText(/Finance đang rà soát; yêu cầu chưa vào hàng đợi Người duyệt chi/)
    expect(screen.queryByRole('button', { name: /BM01-2088/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /BM01-2103/ })).toBeNull()
  })

  test('filters by request flags and employee/software identity', async () => {
    const screen = await render(<ManagerApprovalsScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Ngoài bộ chuẩn' }))
    screen.getByRole('button', { name: 'Xem yêu cầu BM01-2091 cho Raycast Pro' })
    expect(screen.queryByRole('button', { name: /BM01-2102/ })).toBeNull()

    await fireEvent.press(screen.getByRole('button', { name: 'Tất cả' }))
    await fireEvent.changeText(screen.getByLabelText('Tìm theo nhân viên, phần mềm hoặc mã yêu cầu'), 'Claude')
    screen.getByRole('button', { name: 'Xem yêu cầu BM01-2102 cho Claude Team AI' })
    expect(screen.queryByRole('button', { name: /BM01-2091/ })).toBeNull()
  })

  test('uses the bottom tabs to switch between the assigned queue and department context', async () => {
    const screen = await render(<ManagerApprovalsScreen />)

    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phòng ban' }))
    screen.getByText('Phạm vi phòng ban · không được giao')
    screen.getByText('BM01-2088')
    expect(screen.queryByRole('button', { name: /BM01-2102/ })).toBeNull()

    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Hàng đợi' }))
    screen.getByRole('button', { name: 'Xem yêu cầu BM01-2102 cho Claude Team AI' })
  })

  test('keeps manager context when opening inbox and returning to department', async () => {
    const screen = await render(<ManagerApprovalsScreen />)

    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Thông báo' }))
    screen.getByText('Chưa có thông báo demo cho vai trò này.')
    expect(screen.queryByText('Giấy phép Canva Team đã hết hạn.')).toBeNull()
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phòng ban' }))
    screen.getByText('BM01-2103')
  })

  test('requires explicit OI-07a confirmation before approving a long-term request', async () => {
    const screen = await render(<ManagerApprovalsScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu BM01-2102 cho Claude Team AI' }))
    screen.getByText('Kế hoạch ngân sách')
    screen.getByText('Ngoài kế hoạch đã duyệt · demo')
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))

    const confirmButton = screen.getByRole('button', { name: 'Xác nhận duyệt nhu cầu' })
    expect(confirmButton.props.accessibilityState?.disabled).toBe(true)
    await fireEvent.press(screen.getByRole('checkbox', { name: /Tôi xác nhận nhu cầu/ }))
    await fireEvent.press(confirmButton)

    screen.getByText('Đã ghi nhận duyệt nhu cầu cho BM01-2102.')
    expect(screen.queryByRole('button', { name: /BM01-2102/ })).toBeNull()
  })

  test('requires a rejection reason of at least ten characters', async () => {
    const screen = await render(<ManagerApprovalsScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu BM01-2091 cho Raycast Pro' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Từ chối' }))

    const confirmButton = screen.getByRole('button', { name: 'Xác nhận từ chối' })
    expect(confirmButton.props.accessibilityState?.disabled).toBe(true)
    await fireEvent.changeText(screen.getByLabelText('Lý do từ chối'), 'Không phù hợp')
    await fireEvent.press(confirmButton)

    screen.getByText('Đã ghi nhận từ chối yêu cầu BM01-2091 trong demo.')
    screen.getByText('Không phù hợp')
    expect(screen.queryByRole('button', { name: /BM01-2091/ })).toBeNull()
  })
})
