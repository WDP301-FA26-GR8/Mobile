import { fireEvent, render } from '@testing-library/react-native'

import { MySoftwareScreen } from '@/features/licenses'
import { setAppLanguage } from '@/shared/i18n/i18n'
import { resources } from '@/shared/i18n/resources'

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace })
}))

describe('<MySoftwareScreen />', () => {
  beforeAll(async () => {
    await setAppLanguage('vi', false)
  })

  beforeEach(() => {
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  test('shows the Figma-matched employee summary and software list', async () => {
    const screen = await render(<MySoftwareScreen />)

    screen.getByText('Nguyễn Văn A')
    screen.getByText('4 phần mềm')
    screen.getByText('1 mục')
    screen.getByText('Linear Plus')
    screen.getByText('Figma Professional')
    screen.getByText('GitHub Enterprise')
    screen.getByText('JetBrains All Products')
    screen.getAllByText('Workspace seat')
    screen.getAllByText('Khóa bản quyền (K4)')
    screen.getByText('Còn 14 ngày')
    screen.getByText('Mỗi người một tài khoản công ty / seat riêng. Không chia sẻ thông tin đăng nhập (QĐ-75).')
  })

  test('navigates to software details and the employee request tabs', async () => {
    const screen = await render(<MySoftwareScreen />)

    fireEvent.press(screen.getByRole('button', { name: 'Mở chi tiết Figma Professional' }))

    expect(mockPush).toHaveBeenCalledWith({
      params: { softwareId: 'figma-professional' },
      pathname: '/my-software/[softwareId]'
    })

    fireEvent.press(screen.getByRole('tab', { name: 'Mở mục Tạo yêu cầu' }))
    expect(mockPush).toHaveBeenCalledWith('/my-requests/new')
  })

  test('provides English employee-screen copy', () => {
    expect(resources.en.translation.licenses.employeeName).toBe('Nguyen Van A')
    expect(resources.en.translation.licenses.securityNote).toContain('QĐ-75')
  })
})
