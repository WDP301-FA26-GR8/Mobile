import type { PropsWithChildren } from 'react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

import {
  createAccessRequest,
  demoRequests,
  withdrawAccessRequest,
  type AccessRequest,
  type TermMonths
} from '@/entities/access-request'
import { demoActors, type PersonaId } from '@/entities/actors'

interface SubmitRequestInput {
  catalogId: string
  costVnd: number
  reasonText: string
  softwareName: string
  termMonths: TermMonths
}

interface SessionValue {
  persona: (typeof demoActors)[PersonaId] | null
  requests: AccessRequest[]
  signIn: (personaId: PersonaId) => void
  signOut: () => void
  submitRequest: (input: SubmitRequestInput) => AccessRequest
  withdrawRequest: (requestId: string) => void
}

const SessionContext = createContext<SessionValue | null>(null)

interface SessionProviderProps extends PropsWithChildren {
  initialPersonaId?: PersonaId | null
}

export function SessionProvider({ children, initialPersonaId = null }: SessionProviderProps) {
  const [personaId, setPersonaId] = useState<PersonaId | null>(initialPersonaId)
  const [requests, setRequests] = useState<AccessRequest[]>(demoRequests)
  const sequence = useRef(100)

  const signIn = useCallback((nextPersonaId: PersonaId) => {
    setPersonaId(nextPersonaId)
  }, [])

  const signOut = useCallback(() => {
    setPersonaId(null)
  }, [])

  const submitRequest = useCallback((input: SubmitRequestInput) => {
    const created = createAccessRequest({
      ...input,
      id: `req-new-${sequence.current}`,
      submittedAt: new Date().toISOString()
    })
    sequence.current += 1
    setRequests((current) => [created, ...current])
    return created
  }, [])

  const withdrawRequest = useCallback((requestId: string) => {
    const withdrawnAt = new Date().toISOString()
    setRequests((current) =>
      current.map((request) => (request.id === requestId ? withdrawAccessRequest(request, withdrawnAt) : request))
    )
  }, [])

  const value = useMemo<SessionValue>(
    () => ({
      persona: personaId ? demoActors[personaId] : null,
      requests,
      signIn,
      signOut,
      submitRequest,
      withdrawRequest
    }),
    [personaId, requests, signIn, signOut, submitRequest, withdrawRequest]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return value
}
