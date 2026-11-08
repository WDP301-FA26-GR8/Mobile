import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { MySoftwareScreen } from '@/features/licenses'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

describe('<MySoftwareScreen />', () => {
  beforeEach(async () => {
    mockPush.mockClear()
    await setAppLanguage('vi', false)
  })

  test('shows the employee software list with localized workspace and K4 types', async () => {
    const screen = await render(<MySoftwareScreen />)

    screen.getByText('Phần mềm của tôi')
    screen.getByText('Linear')
    screen.getAllByText('Workspace seat')
    screen.getAllByText('Khóa bản quyền (K4)')
    screen.getByText('Còn 14 ngày')
  })

  test('filters the list and navigates to the selected software details', async () => {
    const screen = await render(<MySoftwareScreen />)

    fireEvent.press(screen.getByRole('button', { name: 'Thiết kế' }))

    await waitFor(() => {
      screen.getByText('Figma')
      expect(screen.queryByText('Linear')).toBeNull()
    })

    fireEvent.press(screen.getByRole('button', { name: 'Mở chi tiết Figma' }))

    expect(mockPush).toHaveBeenCalledWith({
      params: { softwareId: 'figma-professional' },
      pathname: '/my-software/[softwareId]'
    })
  })

  test('switches visible copy to English', async () => {
    await setAppLanguage('en', false)
    const screen = await render(<MySoftwareScreen />)

    screen.getByText('My software')
    screen.getByText('3 active')
    screen.getByText('Expires in 14 days')
  })
})
