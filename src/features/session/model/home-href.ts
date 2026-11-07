import type { PersonaId } from '@/entities/actors'

export function homeHref(personaId: PersonaId): '/software/index' | '/manager-queue' | '/spend-queue' {
  if (personaId === 'manager') return '/manager-queue'
  if (personaId === 'approver') return '/spend-queue'
  return '/software/index'
}

export function homeRouteName(personaId: PersonaId): 'software' | 'manager-queue' | 'spend-queue' {
  if (personaId === 'manager') return 'manager-queue'
  if (personaId === 'approver') return 'spend-queue'
  return 'software'
}
