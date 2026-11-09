import { useQueryClient } from '@tanstack/react-query'
import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from 'react'

import { sessionStorage } from '@/shared/native/session-storage'

import { Session, sessionApi } from './session'

type SessionState = 'loading' | 'anonymous' | 'authenticated'
type SessionContextValue = {
  state: SessionState
  restoreFailed: boolean
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
  read<T>(operation: (accessToken: string) => Promise<T>): Promise<T>
  write<T>(operation: (accessToken: string) => Promise<T>): Promise<T>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<SessionState>('loading')
  const [restoreFailed, setRestoreFailed] = useState(false)
  const [session] = useState(
    () =>
      new Session(sessionStorage, sessionApi, (reason) => {
        queryClient.clear()
        setRestoreFailed(reason === 'expired')
        setState('anonymous')
      })
  )
  const restore = useRef<Promise<boolean> | null>(null)

  useEffect(() => {
    let active = true
    if (!restore.current) restore.current = session.restore()
    void restore.current.then(
      (restored) => {
        if (active) setState(restored ? 'authenticated' : 'anonymous')
      },
      () => {
        if (active) {
          setRestoreFailed(true)
          setState('anonymous')
        }
      }
    )
    return () => {
      active = false
    }
  }, [session])

  return (
    <SessionContext.Provider
      value={{
        state,
        restoreFailed,
        login: async (email, password) => {
          await session.login(email, password)
          queryClient.clear()
          setRestoreFailed(false)
          setState('authenticated')
        },
        logout: () => session.logout(),
        read: (operation) => session.read(operation),
        write: (operation) => session.write(operation)
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('SessionProvider is missing')
  return context
}
