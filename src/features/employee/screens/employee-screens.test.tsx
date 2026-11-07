import { fireEvent, render } from '@testing-library/react-native'
import { Text } from 'react-native'

import { RequestDetailScreen, RequestWizardScreen, SoftwareDetailScreen, SoftwareListScreen } from '@/features/employee'
import { SessionProvider, useSession } from '@/features/session'
import { setAppLanguage } from '@/shared/i18n/i18n'

function RequestNames() {
  const { requests } = useSession()
  const names = requests.map((request) => request.softwareName).join('|')
  return <Text>{names}</Text>
}

describe('employee screens', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  test('filters the software vault and shows the empty state', async () => {
    const screen = await render(
      <SessionProvider initialPersonaId='employee'>
        <SoftwareListScreen />
      </SessionProvider>
    )

    screen.getByText('GitHub Enterprise')
    screen.getByText('Figma Professional')

    await fireEvent.press(screen.getAllByText('Thiết kế')[0])
    expect(screen.queryByText('GitHub Enterprise')).toBeNull()
    screen.getByText('Figma Professional')

    await fireEvent.press(screen.getByText('Tất cả'))
    await fireEvent.changeText(screen.getByLabelText('Tìm phần mềm'), 'khong-co')
    screen.getByText('Không có phần mềm phù hợp')
  })

  test('reveals a masked license key', async () => {
    const screen = await render(
      <SessionProvider initialPersonaId='employee'>
        <SoftwareDetailScreen softwareId='sw-figma' />
      </SessionProvider>
    )

    screen.getByText('FIG-PRO-••••-••••-8819')
    await fireEvent.press(screen.getByText('Hiện khóa'))
    screen.getByText('FIG-PRO-8K2M-Q19L-8819')
  })

  test('blocks a catalog product the employee already has', async () => {
    const screen = await render(
      <SessionProvider initialPersonaId='employee'>
        <RequestWizardScreen />
      </SessionProvider>
    )

    await fireEvent.press(screen.getByLabelText('Chọn GitHub Enterprise'))
    screen.getByText('Đã chặn vì trùng bản quyền')
  })

  test('submits a catalog product that is not assigned yet', async () => {
    const screen = await render(
      <SessionProvider initialPersonaId='employee'>
        <RequestWizardScreen />
        <RequestNames />
      </SessionProvider>
    )

    await fireEvent.press(screen.getByLabelText('Chọn Jira Standard'))
    await fireEvent.changeText(screen.getByLabelText('Lý do nghiệp vụ'), 'Cần Jira cho dự án WDP')
    await fireEvent.press(screen.getByText('Tiếp tục'))
    await fireEvent.press(screen.getByText('Xác nhận gửi phiếu BM-01'))

    screen.getByText('Jira Standard|Slack Business+|Adobe Illustrator')
  })

  test('withdraws a pending request and shows a rejection reason', async () => {
    const pending = await render(
      <SessionProvider initialPersonaId='employee'>
        <RequestDetailScreen requestId='req-slack' />
      </SessionProvider>
    )

    pending.getByText('Đang chờ trưởng phòng Trần Minh')
    await fireEvent.press(pending.getByText('Rút yêu cầu'))
    pending.getByText('Bạn đã rút yêu cầu này khi đơn còn đang chờ duyệt.')

    const rejected = await render(
      <SessionProvider initialPersonaId='employee'>
        <RequestDetailScreen requestId='req-adobe' />
      </SessionProvider>
    )

    rejected.getByText('Đã có công cụ thay thế trong bộ chuẩn.')
    rejected.getByText('Trưởng phòng Trần Minh đã từ chối')
  })
})
