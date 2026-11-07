import { Redirect } from 'expo-router'
import type { ReactNode } from 'react'

import type { PersonaId } from '@/entities/actors'

import { homeHref } from './model/home-href'
import { useSession } from './session-provider'

export function RequirePersona({ children, personaId }: { children: ReactNode; personaId: PersonaId }) {
  const { persona } = useSession()

  if (!persona) return <Redirect href='/sign-in' />
  if (persona.id !== personaId) return <Redirect href={homeHref(persona.id)} />

  return children
}
