import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { HomeScreen } from '@/features/home/home-screen'
import { setAppLanguage } from '@/shared/i18n/i18n'

describe('<HomeScreen />', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  test('renders Vietnamese copy from the translation resources', async () => {
    const screen = await render(<HomeScreen />)

    screen.getByText(/nền tảng Mobile đã sẵn sàng/i)
    screen.getByText('Orval sinh API client từ OpenAPI')
  })

  test('switches every mapped label to English', async () => {
    const screen = await render(<HomeScreen />)

    fireEvent.press(screen.getByLabelText('Chuyển sang Tiếng Anh'))

    await waitFor(() => {
      screen.getByText('The Mobile foundation is ready for the research phase.')
      screen.getByText('Orval generates the API client from OpenAPI')
    })
  })
})
