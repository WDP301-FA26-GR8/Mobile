import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { LoginScreen } from '@/features/auth'
import { MySoftwareScreen } from '@/features/licenses'
import { setAppLanguage } from '@/shared/i18n/i18n'

import { SessionProvider, useSession } from './session-context'

let mockStoredToken: string | null = null
const mockRouter = { replace: jest.fn() }

jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => mockRouter }))
jest.mock('@/shared/native/session-storage', () => ({
  sessionStorage: {
    read: async () => mockStoredToken,
    write: async (token: string) => {
      mockStoredToken = token
    },
    remove: async () => {
      mockStoredToken = null
    }
  }
}))

function Screens() {
  const { state } = useSession()
  if (state === 'loading') return null
  return state === 'authenticated' ? <MySoftwareScreen /> : <LoginScreen />
}

test('signs in, loads account rights with bearer auth, and logs out', async () => {
  await setAppLanguage('vi', false)
  mockStoredToken = null
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, options) => {
    const url = String(input)
    if (url.endsWith('/auth/login')) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'AUTH.LOGGED_IN',
          data: {
            accessToken: 'access-test',
            refreshToken: 'refresh-test',
            tokenType: 'Bearer',
            expiresAt: '2099-01-01T00:00:00.000Z',
            refreshExpiresAt: '2099-02-01T00:00:00.000Z'
          }
        }),
        { status: 200 }
      )
    }
    if (url.endsWith('/auth/logout')) return new Response(null, { status: 204 })
    expect(options?.headers).toEqual({ Authorization: 'Bearer access-test' })
    if (url.endsWith('/me')) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'ME.RETRIEVED',
          data: {
            appUserId: 'user-id',
            loginEmail: 'person@example.test',
            employee: {
              id: 'employee-id',
              employeeCode: 'E1',
              fullName: 'Nguyễn An',
              department: null,
              unplaced: true,
              jobTitle: null
            },
            roles: ['EMPLOYEE'],
            managerScope: null
          }
        }),
        { status: 200 }
      )
    }
    if (url.endsWith('/dashboards/employee')) {
      const counted = { state: 'COUNTED', count: 0, sourceOperationId: 'meSoftwareRightList', reason: null }
      return new Response(
        JSON.stringify({
          success: true,
          message: 'DASHBOARD.EMPLOYEE_RETRIEVED',
          data: {
            asOf: '2026-11-09',
            sections: { softwareRights: counted, expiringRights: counted, requests: counted, saasIssues: counted }
          }
        }),
        { status: 200 }
      )
    }
    if (url.includes('/me/software-rights')) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'ME.SOFTWARE_RIGHTS_LISTED',
          data: {
            asOf: '2026-11-09',
            view: 'current',
            items: [],
            pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 }
          }
        }),
        { status: 200 }
      )
    }
    throw new Error(`Unexpected API request: ${url}`)
  })

  const screen = await render(
    <QueryClientProvider client={client}>
      <SessionProvider>
        <Screens />
      </SessionProvider>
    </QueryClientProvider>
  )
  await screen.findByLabelText('Email công ty')
  await fireEvent.changeText(screen.getByLabelText('Email công ty'), 'person@example.test')
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu'), 'password')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng nhập' }))
  await screen.findByText('Nguyễn An')
  await screen.findByText('Bạn chưa có quyền phần mềm hiện tại.')
  expect(mockStoredToken).toBe('refresh-test')
  await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }))
  await waitFor(() => screen.getByLabelText('Email công ty'))
  expect(mockStoredToken).toBeNull()
  expect(
    client
      .getQueryCache()
      .getAll()
      .every((query) => query.state.data === undefined)
  ).toBe(true)
  expect(fetchMock).toHaveBeenCalledTimes(5)
  screen.unmount()
  client.clear()
  fetchMock.mockRestore()
})
