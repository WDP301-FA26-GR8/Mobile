import { Session, SessionExpiredError } from './session'

const tokens = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  tokenType: 'Bearer' as const,
  expiresAt: '2099-01-01T00:00:00.000Z',
  refreshExpiresAt: '2099-02-01T00:00:00.000Z'
}

function setup() {
  let saved: string | null = null
  const storage = {
    read: jest.fn(async () => saved),
    remove: jest.fn(async () => {
      saved = null
    }),
    write: jest.fn(async (value: string) => {
      saved = value
    })
  }
  const api = {
    login: jest.fn(async () => tokens),
    refresh: jest.fn(async () => ({ ...tokens, accessToken: 'access-2', refreshToken: 'refresh-2' })),
    logout: jest.fn(async () => {})
  }
  const onExpired = jest.fn()
  return { session: new Session(storage, api, onExpired), storage, api, onExpired }
}

test('signs in, persists the refresh token and sends the access token', async () => {
  const { session, storage } = setup()
  await session.login('person@example.test', 'password')
  expect(storage.write).toHaveBeenCalledWith('refresh-1')
  await expect(session.read(async (token) => token)).resolves.toBe('access-1')
})

test('shares one rotation when concurrent requests receive 401', async () => {
  const { session, api, storage } = setup()
  await session.login('person@example.test', 'password')
  const call = jest.fn(async (token: string) => {
    if (token === 'access-1') throw { status: 401 }
    return token
  })

  await expect(Promise.all([session.read(call), session.read(call)])).resolves.toEqual(['access-2', 'access-2'])
  expect(api.refresh).toHaveBeenCalledTimes(1)
  expect(api.refresh).toHaveBeenCalledWith('refresh-1')
  expect(storage.remove).toHaveBeenCalledTimes(1)
  expect(storage.write).toHaveBeenLastCalledWith('refresh-2')
})

test('does not rotate twice when new and old access token strings are identical', async () => {
  const { session, api } = setup()
  api.refresh.mockResolvedValueOnce({ ...tokens, refreshToken: 'refresh-2' })
  await session.login('person@example.test', 'password')
  let rejectDelayed: (error: { status: number }) => void = () => {
    throw new Error('Request not started')
  }
  const delayed = jest
    .fn()
    .mockImplementationOnce(() => new Promise((_resolve, reject) => (rejectDelayed = reject)))
    .mockResolvedValueOnce('retried')
  const pending = session.read(delayed)
  let first = true
  await session.read(async () => {
    if (first) {
      first = false
      throw { status: 401 }
    }
    return 'ok'
  })
  rejectDelayed({ status: 401 })
  await expect(pending).resolves.toBe('retried')
  expect(api.refresh).toHaveBeenCalledTimes(1)
})

test('does not retry a refresh whose result was lost', async () => {
  const { session, api, storage, onExpired } = setup()
  await session.login('person@example.test', 'password')
  api.refresh.mockRejectedValueOnce(new Error('network error'))
  await expect(session.read(async () => Promise.reject({ status: 401 }))).rejects.toBeInstanceOf(SessionExpiredError)
  expect(await storage.read()).toBeNull()
  expect(onExpired).toHaveBeenCalledTimes(1)
  await expect(session.restore()).resolves.toBe(false)
  expect(api.refresh).toHaveBeenCalledTimes(1)
})

test('retains the session if server logout fails and clears it only after success', async () => {
  const { session, storage, api, onExpired } = setup()
  await session.login('person@example.test', 'password')
  api.logout.mockRejectedValueOnce(new Error('offline'))
  await expect(session.logout()).rejects.toThrow('offline')
  expect(await storage.read()).toBe('refresh-1')
  await expect(session.read(async (token) => token)).resolves.toBe('access-1')
  await session.logout()
  expect(await storage.read()).toBeNull()
  expect(onExpired).toHaveBeenCalledTimes(1)
  await expect(session.read(async (token) => token)).rejects.toBeInstanceOf(SessionExpiredError)
})

test('expires the local session when a refreshed access token is also unauthorized', async () => {
  const { session, storage, api, onExpired } = setup()
  await session.login('person@example.test', 'password')
  await expect(session.read(async () => Promise.reject({ status: 401 }))).rejects.toBeInstanceOf(SessionExpiredError)
  expect(api.refresh).toHaveBeenCalledTimes(1)
  expect(await storage.read()).toBeNull()
  expect(onExpired).toHaveBeenCalledTimes(1)
})

test('restores by rotating a stored token', async () => {
  const { session, storage, api } = setup()
  await storage.write('refresh-1')
  await expect(session.restore()).resolves.toBe(true)
  expect(api.refresh).toHaveBeenCalledWith('refresh-1')
  expect(await storage.read()).toBe('refresh-2')
})

test('revokes a new server session when secure storage fails', async () => {
  const { session, storage, api } = setup()
  storage.write.mockRejectedValueOnce(new Error('storage unavailable'))
  await expect(session.login('person@example.test', 'password')).rejects.toThrow('storage unavailable')
  expect(api.logout).toHaveBeenCalledWith('refresh-1')
})

test('rejects a late response after sign out', async () => {
  const { session } = setup()
  await session.login('person@example.test', 'password')
  let finish: (value: string) => void = () => {
    throw new Error('Request not started')
  }
  const pending = session.read(() => new Promise<string>((resolve) => (finish = resolve)))
  await session.logout()
  finish('private data')
  await expect(pending).rejects.toBeInstanceOf(SessionExpiredError)
})

test('does not retry mutations when the server returns 401', async () => {
  const { session, api } = setup()
  await session.login('person@example.test', 'password')
  const operation = jest.fn(async () => Promise.reject({ status: 401 }))
  await expect(session.write(operation)).rejects.toEqual({ status: 401 })
  expect(operation).toHaveBeenCalledTimes(1)
  expect(api.refresh).not.toHaveBeenCalled()
})
