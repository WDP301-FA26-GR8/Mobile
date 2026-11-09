import { authLogin, authLogout, authRefresh } from './generated/api/auth/auth'
import type { SessionTokenResponseDtoData } from './generated/contracts/auth'
import { env } from '../config/env'
import { assertSecureApiOrigin } from './secure-origin'

type Tokens = NonNullable<SessionTokenResponseDtoData>
type Storage = {
  read(): Promise<string | null>
  remove(): Promise<void>
  write(token: string): Promise<void>
}

type SessionApi = {
  login(email: string, password: string): Promise<Tokens>
  refresh(refreshToken: string): Promise<Tokens>
  logout(refreshToken: string): Promise<void>
}

function requireTokens(tokens: SessionTokenResponseDtoData): Tokens {
  if (
    !tokens?.accessToken ||
    !tokens.refreshToken ||
    tokens.tokenType !== 'Bearer' ||
    !Number.isFinite(Date.parse(tokens.expiresAt)) ||
    !Number.isFinite(Date.parse(tokens.refreshExpiresAt))
  ) {
    throw new Error('Invalid session response')
  }
  return tokens
}

export const sessionApi: SessionApi = {
  async login(email, password) {
    assertSecureApiOrigin(env.API_BASE_URL, __DEV__)
    return requireTokens((await authLogin({ email, password })).data.data)
  },
  async refresh(refreshToken) {
    assertSecureApiOrigin(env.API_BASE_URL, __DEV__)
    return requireTokens((await authRefresh({ refreshToken })).data.data)
  },
  async logout(refreshToken) {
    assertSecureApiOrigin(env.API_BASE_URL, __DEV__)
    await authLogout({ refreshToken })
  }
}

function statusOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}

export class SessionExpiredError extends Error {
  constructor(options?: ErrorOptions) {
    super('Session could not be refreshed; sign in again', options)
    this.name = 'SessionExpiredError'
  }
}

export class Session {
  private tokens: Tokens | null = null
  private refreshing: Promise<Tokens> | null = null
  private revision = 0
  private loggingOut = false
  private signingIn = false

  constructor(
    private readonly storage: Storage,
    private readonly api: SessionApi,
    private readonly onExpired: (reason: 'expired' | 'logout') => void
  ) {}

  async login(email: string, password: string): Promise<void> {
    if (this.loggingOut || this.refreshing || this.tokens || this.signingIn)
      throw new Error('Session is already active or changing')
    this.signingIn = true
    try {
      const revision = ++this.revision
      const tokens = await this.api.login(email, password)
      if (this.revision !== revision) throw new SessionExpiredError()
      try {
        await this.storage.write(tokens.refreshToken)
      } catch (storageError) {
        try {
          await this.api.logout(tokens.refreshToken)
        } catch (logoutError) {
          throw new AggregateError([storageError, logoutError], 'Could not save or revoke the new session')
        }
        throw storageError
      }
      if (this.revision !== revision) {
        await this.storage.remove()
        throw new SessionExpiredError()
      }
      this.tokens = tokens
    } finally {
      this.signingIn = false
    }
  }

  async restore(): Promise<boolean> {
    if (this.loggingOut || this.refreshing || this.tokens || this.signingIn)
      throw new Error('Session is already active or changing')
    this.signingIn = true
    try {
      const token = await this.storage.read()
      if (!token) return false
      await this.refresh(token)
      return true
    } finally {
      this.signingIn = false
    }
  }

  private refresh(refreshToken: string): Promise<Tokens> {
    if (this.refreshing) return this.refreshing
    const revision = this.revision
    const operation = (async () => {
      try {
        // A refresh may consume the token even if the response is lost.
        await this.storage.remove()
        const tokens = await this.api.refresh(refreshToken)
        if (this.revision !== revision) throw new SessionExpiredError()
        await this.storage.write(tokens.refreshToken)
        if (this.revision !== revision) {
          await this.storage.remove()
          throw new SessionExpiredError()
        }
        this.tokens = tokens
        return tokens
      } catch (error) {
        this.tokens = null
        this.revision += 1
        this.onExpired('expired')
        throw new SessionExpiredError({ cause: error })
      }
    })()
    this.refreshing = operation
    void operation.then(
      () => {
        if (this.refreshing === operation) this.refreshing = null
      },
      () => {
        if (this.refreshing === operation) this.refreshing = null
      }
    )
    return operation
  }

  async read<T>(operation: (accessToken: string) => Promise<T>): Promise<T> {
    if (this.loggingOut) throw new SessionExpiredError()
    const revision = this.revision
    let tokens = this.tokens
    if (!tokens) throw new SessionExpiredError()
    if (Date.parse(tokens.expiresAt) <= Date.now()) tokens = await this.refresh(tokens.refreshToken)
    try {
      const result = await operation(tokens.accessToken)
      if (this.revision !== revision || this.loggingOut) throw new SessionExpiredError()
      return result
    } catch (error) {
      if (statusOf(error) !== 401) throw error
      if (this.revision !== revision || this.loggingOut) throw new SessionExpiredError({ cause: error })
      const current = this.tokens
      if (!current) throw new SessionExpiredError({ cause: error })
      const next = current === tokens ? await this.refresh(current.refreshToken) : current
      let result: T
      try {
        result = await operation(next.accessToken)
      } catch (retryError) {
        if (statusOf(retryError) === 401 && this.revision === revision) {
          ++this.revision
          this.tokens = null
          this.onExpired('expired')
          await this.storage.remove()
          throw new SessionExpiredError({ cause: retryError })
        }
        throw retryError
      }
      if (this.revision !== revision || this.loggingOut) throw new SessionExpiredError()
      return result
    }
  }

  async write<T>(operation: (accessToken: string) => Promise<T>): Promise<T> {
    if (this.loggingOut) throw new SessionExpiredError()
    const revision = this.revision
    let tokens = this.tokens
    if (!tokens) throw new SessionExpiredError()
    if (Date.parse(tokens.expiresAt) <= Date.now()) tokens = await this.refresh(tokens.refreshToken)
    if (this.revision !== revision || this.loggingOut) throw new SessionExpiredError()
    const result = await operation(tokens.accessToken)
    if (this.revision !== revision || this.loggingOut) throw new SessionExpiredError()
    return result
  }

  async logout(): Promise<void> {
    if (this.loggingOut) throw new Error('Logout already in progress')
    this.loggingOut = true
    try {
      if (this.refreshing) await this.refreshing
      const tokens = this.tokens
      if (!tokens) throw new SessionExpiredError()
      await this.api.logout(tokens.refreshToken)
      ++this.revision
      this.tokens = null
      this.onExpired('logout')
      await this.storage.remove()
    } finally {
      this.loggingOut = false
    }
  }
}
