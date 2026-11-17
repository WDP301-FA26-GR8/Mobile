import { render } from '@testing-library/react-native'

import ForgotPasswordRoute from '../app/forgot-password'
import InboxRoute from '../app/inbox'
import ManagerRoute from '../app/manager'
import LegacyRequestDetailsRoute from '../app/my-requests/[requestId]'
import MyRequestsRoute from '../app/my-requests/index'
import NewRequestRoute from '../app/my-requests/new'

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text: MockText } = jest.requireActual('react-native')
    return <MockText>{href}</MockText>
  }
}))

test.each([
  [ForgotPasswordRoute, '/'],
  [InboxRoute, '/live-inbox'],
  [ManagerRoute, '/live-need-approvals'],
  [MyRequestsRoute, '/live-requests'],
  [NewRequestRoute, '/live-request-create'],
  [LegacyRequestDetailsRoute, '/live-requests']
])('redirects prototype routes to safe live screens', async (Route, destination) => {
  const screen = await render(<Route />)
  screen.getByText(destination)
})
