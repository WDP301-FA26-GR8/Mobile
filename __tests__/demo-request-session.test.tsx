import { fireEvent, render } from '@testing-library/react-native'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { RequestsProvider, useRequests } from '@/entities/demo-requests'
import { InboxScreen } from '@/features/inbox'
import { ManagerApprovalsScreen } from '@/features/manager'
import { RequestDetailsScreen } from '@/features/requests'
import { SpendingApprovalsScreen } from '@/features/spending-approval'
import { setAppLanguage } from '@/shared/i18n/i18n'

jest.mock('expo-router', () => ({
  Redirect: () => null,
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: jest.fn(), replace: jest.fn() })
}))

type Screen = 'manager' | 'spending' | 'inbox' | 'claude' | 'slack' | 'notion' | 'new' | 'control'

function Controls() {
  const { createRequest, decide, withdrawRequest } = useRequests()
  const [result, setResult] = useState('')

  return (
    <View>
      <Pressable
        testID='create'
        onPress={() => {
          const request = createRequest({
            softwareId: 'raycast',
            softwareName: 'Raycast',
            durationMonths: 12,
            reason: 'Phục vụ công việc'
          })
          setResult(request.id)
        }}
      />
      <Pressable
        testID='withdraw-slack'
        onPress={() => {
          withdrawRequest('BM01-2104')
          setResult(String(decide('spending', { requestId: 'BM01-2104', kind: 'approved' })))
        }}
      />
      <Pressable
        testID='withdraw-notion'
        onPress={() => {
          withdrawRequest('BM01-2103')
          setResult('Notion withdrawn')
        }}
      />
      <Pressable
        testID='duplicate-decision'
        onPress={() => {
          const first = decide('manager', { requestId: 'BM01-2102', kind: 'approved' })
          const second = decide('manager', { requestId: 'BM01-2102', kind: 'approved' })
          setResult(`${first}/${second}`)
        }}
      />
      <Text>{result}</Text>
    </View>
  )
}

function Session() {
  const [screen, setScreen] = useState<Screen>('manager')
  return (
    <View>
      {(['manager', 'spending', 'inbox', 'claude', 'slack', 'notion', 'new', 'control'] as const).map((item) => (
        <Pressable key={item} onPress={() => setScreen(item)}>
          <Text>{`Test ${item}`}</Text>
        </Pressable>
      ))}
      {screen === 'manager' ? <ManagerApprovalsScreen /> : null}
      {screen === 'spending' ? <SpendingApprovalsScreen /> : null}
      {screen === 'inbox' ? <InboxScreen /> : null}
      {screen === 'claude' ? <RequestDetailsScreen requestId='BM01-2102' /> : null}
      {screen === 'slack' ? <RequestDetailsScreen requestId='BM01-2104' /> : null}
      {screen === 'notion' ? <RequestDetailsScreen requestId='BM01-2103' /> : null}
      {screen === 'new' ? <RequestDetailsScreen requestId='BM01-2107' /> : null}
      {screen === 'control' ? <Controls /> : null}
    </View>
  )
}

describe('shared demo session', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  test('manager approval updates employee timeline, inbox, and department view across remounts', async () => {
    const screen = await render(
      <RequestsProvider>
        <Session />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu BM01-2102 cho Claude Team AI' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
    await fireEvent.press(screen.getByRole('checkbox', { name: /Tôi xác nhận nhu cầu/ }))
    await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận duyệt nhu cầu' }))
    await fireEvent.press(screen.getByText('Test claude'))
    screen.getByText('Chờ trưởng phòng trình')
    screen.getByText('Đã duyệt nhu cầu')
    await fireEvent.press(screen.getByText('Test inbox'))
    screen.getByText(/BM01-2102 đã được duyệt và chuyển sang chờ trưởng phòng/)
    await fireEvent.press(screen.getByRole('button', { name: 'Mở thông báo về Claude Team AI' }))
    await fireEvent.press(screen.getByText('Test claude'))
    await fireEvent.press(screen.getByText('Test inbox'))
    screen.getByText('Chưa đọc · 3')
    screen.getByText(/BM01-2102 đã được duyệt và chuyển sang chờ trưởng phòng/)
    await fireEvent.press(screen.getByText('Test manager'))
    expect(screen.queryByRole('button', { name: /BM01-2102/ })).toBeNull()
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phòng ban' }))
    screen.getByText('BM01-2102')
    screen.getByText('Chờ trưởng phòng trình')
  })

  test('spending rejection preserves its reason in employee detail and inbox', async () => {
    const screen = await render(
      <RequestsProvider>
        <Session />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByText('Test spending'))
    await fireEvent.press(screen.getByRole('button', { name: 'Xem BM01-2104 cho Slack Pro' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Từ chối' }))
    await fireEvent.changeText(screen.getByLabelText('Lý do quyết định'), 'Chưa phù hợp kế hoạch')
    await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận từ chối' }))
    await fireEvent.press(screen.getByText('Test slack'))
    screen.getByText('Chưa phù hợp kế hoạch')
    screen.getByText(/Từ chối bởi người duyệt chi/)
    screen.getByText('Yêu cầu đã bị từ chối')
    await fireEvent.press(screen.getByText('Test inbox'))
    screen.getByText('Chưa phù hợp kế hoạch')
    await fireEvent.press(screen.getByText('Test spending'))
    expect(screen.queryByRole('button', { name: /BM01-2104/ })).toBeNull()
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Đã xử lý' }))
    screen.getByText('Chưa phù hợp kế hoạch')
  })

  test('spending approval updates Slack and SoD-4 need approval updates department context only', async () => {
    const screen = await render(
      <RequestsProvider>
        <Session />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByText('Test spending'))
    await fireEvent.press(screen.getByRole('button', { name: 'Xem BM01-2104 cho Slack Pro' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt chi' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Xem BM01-2088 cho DataDog' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt bước nhu cầu' }))
    await fireEvent.press(screen.getByText('Test slack'))
    screen.getByText('Chờ IT thực thi')
    screen.getByText('Đã duyệt chi')
    screen.getByText('IT chưa bắt đầu cấp phát')
    await fireEvent.press(screen.getByText('Test manager'))
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phòng ban' }))
    screen.getByText('Đã duyệt nhu cầu · phạm vi phòng')
    screen.getByText(/Các bước tiếp theo chưa được mô phỏng/)
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Thông báo' }))
    screen.getByText(/Người duyệt chi đã duyệt bước nhu cầu của yêu cầu BM01-2088/)
  })

  test('withdrawn Slack cannot be decided, Finance visibility updates, and created requests reach the queue', async () => {
    const screen = await render(
      <RequestsProvider>
        <Session />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByText('Test control'))
    await fireEvent.press(screen.getByTestId('withdraw-slack'))
    screen.getByText('false')
    await fireEvent.press(screen.getByTestId('withdraw-notion'))
    await fireEvent.press(screen.getByTestId('create'))
    screen.getByText('BM01-2107')
    await fireEvent.press(screen.getByText('Test spending'))
    expect(screen.queryByRole('button', { name: /BM01-2104/ })).toBeNull()
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Thông báo' }))
    screen.getByText(/Nhân viên đã rút yêu cầu BM01-2104/)
    await fireEvent.press(screen.getByText('Test manager'))
    screen.getByRole('button', { name: 'Xem yêu cầu BM01-2107 cho Raycast' })
    await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu BM01-2107 cho Raycast' }))
    screen.getByText('Phục vụ công việc')
    screen.getByText('Chưa có thông tin kế hoạch ngân sách trong demo')
    await fireEvent.press(screen.getByRole('button', { name: 'Về hàng đợi phòng ban' }))
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phòng ban' }))
    screen.getByText('Nhân viên đã rút yêu cầu này.')
    await fireEvent.press(screen.getByText('Test notion'))
    screen.getByText('Đã rút')
    expect(screen.queryByText('Finance đang rà soát. Yêu cầu chưa vào hàng đợi Người duyệt chi.')).toBeNull()
  })

  test('a second decision on an already processed request is rejected', async () => {
    const screen = await render(
      <RequestsProvider>
        <Session />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByText('Test control'))
    await fireEvent.press(screen.getByTestId('duplicate-decision'))
    screen.getByText('true/false')
    await fireEvent.press(screen.getByText('Test claude'))
    expect(screen.getAllByText('Đã duyệt nhu cầu')).toHaveLength(1)
  })

  test('a newly created request can be approved in the manager queue', async () => {
    const screen = await render(
      <RequestsProvider>
        <Session />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByText('Test control'))
    await fireEvent.press(screen.getByTestId('create'))
    await fireEvent.press(screen.getByText('Test manager'))
    await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu BM01-2107 cho Raycast' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Duyệt nhu cầu' }))
    await fireEvent.press(screen.getByText('Test new'))
    screen.getByText('Chờ trưởng phòng trình')
    screen.getByText('Đã duyệt nhu cầu')
    await fireEvent.press(screen.getByText('Test inbox'))
    screen.getByText(/BM01-2107 đã được duyệt và chuyển sang chờ trưởng phòng/)
  })

  test('manager rejection reaches employee timeline and notification with the entered reason', async () => {
    const screen = await render(
      <RequestsProvider>
        <Session />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Xem yêu cầu BM01-2102 cho Claude Team AI' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Từ chối' }))
    await fireEvent.changeText(screen.getByLabelText('Lý do từ chối'), 'Chưa phù hợp dự án')
    await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận từ chối' }))
    await fireEvent.press(screen.getByText('Test claude'))
    screen.getByText('Chưa phù hợp dự án')
    screen.getByText(/Từ chối bởi trưởng phòng/)
    await fireEvent.press(screen.getByText('Test inbox'))
    screen.getByText('Chưa phù hợp dự án')
  })

  test('withdrawing Claude removes it from the manager queue and informs the manager', async () => {
    const screen = await render(
      <RequestsProvider>
        <Session />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByText('Test claude'))
    await fireEvent.press(screen.getByRole('button', { name: 'Rút yêu cầu' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận rút' }))
    screen.getByText('Đã rút')
    await fireEvent.press(screen.getByText('Test manager'))
    expect(screen.queryByRole('button', { name: /BM01-2102/ })).toBeNull()
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Thông báo' }))
    screen.getByText(/Nhân viên đã rút yêu cầu BM01-2102/)
  })

  test('a rejected SoD-4 request shows its reason to the manager, not the employee', async () => {
    const screen = await render(
      <RequestsProvider>
        <Session />
      </RequestsProvider>
    )
    await fireEvent.press(screen.getByText('Test spending'))
    await fireEvent.press(screen.getByRole('button', { name: 'Xem BM01-2088 cho DataDog' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Từ chối' }))
    await fireEvent.changeText(screen.getByLabelText('Lý do quyết định'), 'Chưa phù hợp kế hoạch')
    await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận từ chối' }))
    await fireEvent.press(screen.getByText('Test manager'))
    await fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Phòng ban' }))
    screen.getByText('Chưa phù hợp kế hoạch')
    screen.getByText('Người duyệt chi đã từ chối bước nhu cầu của yêu cầu tự gửi.')
    await fireEvent.press(screen.getByText('Test inbox'))
    expect(screen.queryByText('Chưa phù hợp kế hoạch')).toBeNull()
  })
})
