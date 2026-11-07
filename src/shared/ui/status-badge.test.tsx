import { render } from '@testing-library/react-native'

import { setAppLanguage } from '@/shared/i18n/i18n'

import { StatusBadge } from './status-badge'

describe('<StatusBadge />', () => {
  test('renders the Vietnamese status label', async () => {
    await setAppLanguage('vi', false)
    const screen = await render(<StatusBadge status='active' />)

    screen.getByText('Đang hiệu lực')
  })

  test('renders the English status label', async () => {
    await setAppLanguage('en', false)
    const screen = await render(<StatusBadge status='rejected' />)

    screen.getByText('Rejected')
  })
})
