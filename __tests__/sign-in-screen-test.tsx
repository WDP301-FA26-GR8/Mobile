import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { SignInScreen } from '@/features/auth'
import { SessionProvider } from '@/features/session'
import { setAppLanguage } from '@/shared/i18n/i18n'

describe('<SignInScreen />', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  test('shows the company sign-in copy and switches it to English', async () => {
    const screen = await render(
      <SessionProvider>
        <SignInScreen />
      </SessionProvider>
    )

    screen.getByText('Đăng nhập bằng email công ty')
    screen.getByText('an.nguyen@company.com')
    screen.getByText(/ngoài mobile MVP/i)

    fireEvent.press(screen.getByLabelText('Chuyển sang Tiếng Anh'))

    await waitFor(() => {
      screen.getByText('Sign in with your company email')
      screen.getByText(/outside the mobile MVP/i)
    })
  })
})
