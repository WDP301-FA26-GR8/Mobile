import { render } from '@testing-library/react-native'

import { SoftwareDetailsScreen } from '@/features/licenses'
import { getMySoftwareById } from '@/features/licenses/model/my-software'
import { setAppLanguage } from '@/shared/i18n/i18n'

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() })
}))

describe('<SoftwareDetailsScreen />', () => {
  beforeAll(async () => {
    await setAppLanguage('vi', false)
  })

  test('shows company account details without exposing a password', async () => {
    const software = getMySoftwareById('linear-plus')

    if (!software) throw new Error('Expected Linear mock data')

    const screen = await render(<SoftwareDetailsScreen software={software} />)

    screen.getByText('nguyen.van.a@company.tech')
    screen.getByText('Company Tech Org')
    screen.getByText('Ứng dụng không hiển thị mật khẩu.')
  })

  test('always renders K4 masked and does not offer reveal or copy actions', async () => {
    const software = getMySoftwareById('figma-professional')

    if (!software) throw new Error('Expected Figma mock data')

    const screen = await render(<SoftwareDetailsScreen software={software} />)

    screen.getByText('FIG-PRO-••••-••••-8819')
    screen.getByText('Khóa bản quyền (K4)')
    expect(screen.queryByRole('button', { name: /hiện|sao chép/i })).toBeNull()
  })
})
