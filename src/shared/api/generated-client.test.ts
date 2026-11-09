/** @jest-environment node */
import { authLogin, authLogout } from './generated/api/auth/auth'
import { meSoftwareRightList } from './generated/api/me/me'
import { getAuthLoginResponseMock } from './generated/mocks/auth/auth.faker'
import { env } from '../config/env'

describe('generated backend client', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('sends a login request and parses its generated response envelope', async () => {
    const body = {
      ...getAuthLoginResponseMock(),
      message: 'AUTH.LOGGED_IN',
      data: {
        accessToken: 'test-access-token',
        tokenType: 'Bearer' as const,
        expiresAt: '2026-11-09T15:00:00.000Z',
        refreshToken: 'test-refresh-token',
        refreshExpiresAt: '2026-11-10T15:00:00.000Z'
      }
    }
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    )

    const result = await authLogin({ email: 'test@example.test', password: 'test-password' })

    expect(fetchMock).toHaveBeenCalledWith(
      `${env.API_BASE_URL}/api/v1/auth/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.test', password: 'test-password' })
      })
    )
    expect(result.status).toBe(200)
    expect(result.data).toEqual(body)
  })

  it('forwards pagination and authorization and exposes server errors', async () => {
    const error = { success: false, message: 'AUTH.UNAUTHENTICATED', data: null }
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(error), { status: 401 }))

    await expect(
      meSoftwareRightList({ view: 'current', page: 2, pageSize: 20 }, { headers: { Authorization: 'Bearer test' } })
    ).rejects.toMatchObject({ status: 401, info: error })
    expect(fetchMock).toHaveBeenCalledWith(
      `${env.API_BASE_URL}/api/v1/me/software-rights?view=current&page=2&pageSize=20`,
      expect.objectContaining({ method: 'GET', headers: { Authorization: 'Bearer test' } })
    )
  })

  it('handles a successful logout with no response body', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 204 }))

    const result = await authLogout({ refreshToken: 'test-refresh-token' })

    expect(result.status).toBe(204)
    expect(result.data).toBeUndefined()
  })
})
