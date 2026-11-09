export type InboxNotificationKind =
  | 'approved'
  | 'expired'
  | 'ready'
  | 'rejected'
  | 'needApproved'
  | 'spendApproved'
  | 'assignedNeed'
  | 'withdrawn'
  | 'otherNeedApproved'
  | 'otherRejected'

export interface InboxNotification {
  id: string
  isRead: boolean
  kind: InboxNotificationKind
  occurredAt: string
  requestId?: string
  softwareName: string
  reason?: string
  role?: 'employee' | 'manager' | 'spending'
}

export const inboxNotifications: InboxNotification[] = [
  {
    id: 'notice-BM01-2105-ready',
    isRead: false,
    kind: 'ready',
    occurredAt: '2026-10-20T15:00:00+07:00',
    requestId: 'BM01-2105',
    softwareName: 'Raycast Pro'
  },
  {
    id: 'notice-BM01-2103-approved',
    isRead: false,
    kind: 'approved',
    occurredAt: '2026-10-28T15:00:00+07:00',
    requestId: 'BM01-2103',
    softwareName: 'Notion AI'
  },
  {
    id: 'notice-BM01-2041-rejected',
    isRead: false,
    kind: 'rejected',
    occurredAt: '2025-08-20T11:00:00+07:00',
    requestId: 'BM01-2041',
    softwareName: 'Adobe Creative Cloud'
  },
  {
    id: 'notice-canva-expired',
    isRead: true,
    kind: 'expired',
    occurredAt: '2025-05-30T09:00:00+07:00',
    softwareName: 'Canva Team'
  }
]
