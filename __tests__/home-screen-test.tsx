import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { HomeScreen } from '@/features/home'
import { setAppLanguage } from '@/shared/i18n/i18n'

describe('<HomeScreen />', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  test('renders Vietnamese copy from the translation resources', async () => {
    const screen = await render(<HomeScreen />)

    screen.getByText('SaaS-Sentry trên di động')
    screen.getByText('Phần mềm và yêu cầu của tôi')
    screen.getByText('Duyệt nhu cầu')
    screen.getByText('Duyệt chi')
    screen.getByText('Hộp thông báo trong ứng dụng')
    screen.getByText(/OpenAPI hiện chỉ có endpoint trạng thái hệ thống/i)
  })

  test('switches every mapped label to English', async () => {
    const screen = await render(<HomeScreen />)

    fireEvent.press(screen.getByLabelText('Chuyển sang Tiếng Anh'))

    await waitFor(() => {
      screen.getByText('SaaS-Sentry on mobile')
      screen.getByText('My software and requests')
      screen.getByText('Need approval')
      screen.getByText('Spending approval')
      screen.getByText('In-app inbox')
    })
  })
})
