import { Redirect } from 'expo-router'

import { homeHref, useSession } from '@/features/session'

export default function IndexRoute() {
  const { persona } = useSession()

  if (!persona) return <Redirect href='/sign-in' />
  return <Redirect href={homeHref(persona.id)} />
}
