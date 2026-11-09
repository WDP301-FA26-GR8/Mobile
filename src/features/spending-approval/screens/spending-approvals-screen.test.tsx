import { fireEvent, render as renderNative } from '@testing-library/react-native'
import type { ReactElement } from 'react'

import { RequestsProvider } from '@/entities/demo-requests'
import { SpendingApprovalsScreen } from '@/features/spending-approval'
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

describe('<SpendingApprovalsScreen />', () => {
  beforeEach(async () => {
    mockRouter.push.mockClear()
    await setAppLanguage('vi', false)
  })

  test('shows the assigned Slack, Midjourney and SoD-4 tasks without Finance items', async () => {
    const screen = await render(<SpendingApprovalsScreen />)

    screen.getByRole('button', { name: 'Xem BM01-2104 cho Slack Pro' })
    screen.getByRole('button', { name: 'Xem BM01-2095 cho Midjourney' })
    screen.getByRole('button', { name: 'Xem BM01-2088 cho DataDog' })
    expect(screen.queryByText('BM01-2103')).toBeNull()
    expect(screen.queryByText(/Finance rà soát/)).toBeNull()
  })

  test('shows a read-only and arithmetically consistent budget snapshot for Slack', async () => {
    const screen = await render(<SpendingApprovalsScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Xem BM01-2104 cho Slack Pro' }))
    screen.getByText('8.400.000 VNĐ/năm')
    expect(screen.getAllByText('KH-2026-DEV-04')).toHaveLength(2)
    screen.getByText('200.000.000 VNĐ')
    screen.getByText('165.000.000 VNĐ')
    screen.getByText('35.000.000 VNĐ')
    screen.getByText('26.600.000 VNĐ')
    screen.getByText('Trong hạn mức · chỉ để tham khảo')
    expect(screen.queryByRole('button', { name: 'Chỉnh sửa snapshot ngân sách' })).toBeNull()
  })

  test('keeps the DataDog SoD-4 need step separate from a spending decision', async () => {
    const screen = await render(<SpendingApprovalsScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Xem BM01-2088 cho DataDog' }))
    screen.getByText('Tách biệt nhiệm vụ')
    screen.getByText(/SoD-4 giao bước nhu cầu/)
    screen.getByRole('button', { name: 'Duyệt bước nhu cầu' })
    expect(screen.queryByText('Snapshot ngân sách')).toBeNull()
  })

  test('requires a reason before recording the Midjourney override', async () => {
    const screen = await render(<SpendingApprovalsScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Xem BM01-2095 cho Midjourney' }))
    screen.getByText('Cần người duyệt override')
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt chi' }))
    const confirmButton = screen.getByRole('button', { name: 'Xác nhận override' })
    expect(confirmButton.props.accessibilityState?.disabled).toBe(true)

    await fireEvent.changeText(screen.getByLabelText('Lý do quyết định'), 'Ưu tiên dự án')
    await fireEvent.press(confirmButton)
    screen.getByText('Đã ghi nhận quyết định override cho BM01-2095.')
    screen.getByText('Ưu tiên dự án')
    expect(screen.queryByRole('button', { name: /BM01-2095/ })).toBeNull()
  })

  test('records an approved task in the session-only decision history tab', async () => {
    const screen = await render(<SpendingApprovalsScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Xem BM01-2104 cho Slack Pro' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt chi' }))
    screen.getByText('Đã ghi nhận quyết định cho BM01-2104.')

    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Đã xử lý' }))
    screen.getByText('Quyết định gần đây')
    screen.getByText('Slack Pro')
    screen.getByText('Đã duyệt')
  })

  test('retains the spending history when visiting its inbox', async () => {
    const screen = await render(<SpendingApprovalsScreen />)

    await fireEvent.press(screen.getByRole('button', { name: 'Xem BM01-2104 cho Slack Pro' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt chi' }))
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Thông báo' }))
    screen.getByText('Chưa có thông báo demo cho vai trò này.')
    expect(screen.queryByText('Giấy phép Canva Team đã hết hạn.')).toBeNull()
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Đã xử lý' }))
    screen.getByText('Slack Pro')
    screen.getByText('Đã duyệt')
  })

  test('localizes the spending queue in English', async () => {
    await setAppLanguage('en', false)
    const screen = await render(<SpendingApprovalsScreen />)

    screen.getByText('Spending approval queue')
    screen.getByText('Assigned decisions')
    expect(screen.queryByText('spending.subtitle')).toBeNull()
  })
})
