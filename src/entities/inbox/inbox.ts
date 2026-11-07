export type InboxKind = 'pending' | 'license-ready' | 'rejected'
export type InboxGroup = 'today' | 'earlier'

export interface InboxNotice {
  id: string
  kind: InboxKind
  group: InboxGroup
  requestId: string | null
  softwareId: string | null
}

export const demoInbox: InboxNotice[] = [
  {
    id: 'note-slack',
    kind: 'pending',
    group: 'today',
    requestId: 'req-slack',
    softwareId: null
  },
  {
    id: 'note-figma',
    kind: 'license-ready',
    group: 'today',
    requestId: null,
    softwareId: 'sw-figma'
  },
  {
    id: 'note-adobe',
    kind: 'rejected',
    group: 'earlier',
    requestId: 'req-adobe',
    softwareId: null
  }
]

export function inboxGroups(): InboxGroup[] {
  return ['today', 'earlier']
}
