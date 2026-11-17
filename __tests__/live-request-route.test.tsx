import { render } from '@testing-library/react-native'

import LiveRequestDetailsRoute from '../app/live-requests/[requestId]'

let mockId: string | string[] | undefined
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ requestId: mockId }),
  Redirect: ({ href }: { href: string }) => {
    const { Text: MockText } = jest.requireActual('react-native')
    return <MockText>{href}</MockText>
  }
}))
jest.mock('@/features/requests', () => ({
  LiveRequestDetailsScreen: ({ requestId }: { requestId: string }) => {
    const { Text: MockText } = jest.requireActual('react-native')
    return <MockText>{requestId}</MockText>
  }
}))

test('rejects invalid and array route parameters', async () => {
  mockId = ['invalid']
  const screen = await render(<LiveRequestDetailsRoute />)
  screen.getByText('/live-requests')
})

test('passes a UUID to the live detail screen', async () => {
  mockId = '01234567-89ab-cdef-0123-456789abcdef'
  const screen = await render(<LiveRequestDetailsRoute />)
  screen.getByText(mockId)
})
