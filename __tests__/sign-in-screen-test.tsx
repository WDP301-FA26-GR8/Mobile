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

    screen.getByText('Quản lý bản quyền & chi phí phần mềm')
    screen.getByText('nguyen.van.a@company.com')
    screen.getByText(/không sinh trắc học/i)

    fireEvent.press(screen.getByLabelText('Chuyển sang Tiếng Anh'))

    await waitFor(() => {
      screen.getByText('Software licenses and technology cost')
      screen.getByText(/no biometrics/i)
    })
  })
})
