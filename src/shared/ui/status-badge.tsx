import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { theme } from './theme'

export type BadgeStatus =
  | 'active'
  | 'expiring'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'withdrawn'
  | 'owned'
  | 'outsideStandard'
  | 'inStock'
  | 'purchase'
  | 'info'

interface StatusBadgeProps {
  status: BadgeStatus
}

const labelKey = {
  active: 'status.active',
  approved: 'status.approved',
  completed: 'status.completed',
  expiring: 'status.expiring',
  inStock: 'status.inStock',
  info: 'status.info',
  outsideStandard: 'status.outsideStandard',
  owned: 'status.owned',
  pending: 'status.pending',
  purchase: 'status.purchase',
  rejected: 'status.rejected',
  withdrawn: 'status.withdrawn'
} as const

const tone = {
  active: { background: theme.colors.successSoft, text: theme.colors.successInk },
  approved: { background: theme.colors.successSoft, text: theme.colors.successInk },
  completed: { background: theme.colors.successSoft, text: theme.colors.successInk },
  expiring: { background: theme.colors.warningSoft, text: theme.colors.warningInk },
  inStock: { background: theme.colors.infoSoft, text: theme.colors.infoInk },
  info: { background: theme.colors.infoSoft, text: theme.colors.infoInk },
  outsideStandard: { background: theme.colors.warningSoft, text: theme.colors.warningInk },
  owned: { background: theme.colors.primarySoft, text: theme.colors.primaryInk },
  pending: { background: theme.colors.warningSoft, text: theme.colors.warningInk },
  purchase: { background: theme.colors.primarySoft, text: theme.colors.primaryInk },
  rejected: { background: theme.colors.dangerSoft, text: theme.colors.dangerInk },
  withdrawn: { background: theme.colors.surfaceSubtle, text: theme.colors.mutedForeground }
} as const

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()
  const colors = tone[status]

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>{t(labelKey[status])}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  label: {
    fontSize: 12,
    fontWeight: '700'
  }
})
