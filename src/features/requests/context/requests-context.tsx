import { createContext, type PropsWithChildren, useContext, useRef, useState } from 'react'

import {
  canWithdrawRequest,
  createEmployeeRequest,
  initialEmployeeRequests,
  type EmployeeRequest,
  type NewEmployeeRequest
} from '../model/employee-requests'

interface RequestsContextValue {
  createRequest: (request: NewEmployeeRequest) => EmployeeRequest
  requests: EmployeeRequest[]
  withdrawRequest: (requestId: string) => boolean
}

const RequestsContext = createContext<RequestsContextValue | undefined>(undefined)

export function RequestsProvider({ children }: PropsWithChildren) {
  const [requests, setRequests] = useState(initialEmployeeRequests)
  const nextRequestNumber = useRef(2107)

  function createRequest(input: NewEmployeeRequest) {
    const request = createEmployeeRequest(input, `BM01-${nextRequestNumber.current}`)
    nextRequestNumber.current += 1
    setRequests((currentRequests) => [request, ...currentRequests])
    return request
  }

  function withdrawRequest(requestId: string) {
    const request = requests.find((item) => item.id === requestId)
    if (!request || !canWithdrawRequest(request.status)) return false

    setRequests((currentRequests) =>
      currentRequests.map((item) =>
        item.id === requestId
          ? {
              ...item,
              status: 'withdrawn',
              timeline: [...item.timeline, { at: '2026-11-08T09:05:00+07:00', event: 'withdrawn' }]
            }
          : item
      )
    )
    return true
  }

  return (
    <RequestsContext.Provider value={{ createRequest, requests, withdrawRequest }}>{children}</RequestsContext.Provider>
  )
}

export function useRequests() {
  const context = useContext(RequestsContext)
  if (!context) throw new Error('useRequests must be used within RequestsProvider')
  return context
}
