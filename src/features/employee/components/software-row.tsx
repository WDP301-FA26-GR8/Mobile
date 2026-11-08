import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { SoftwareAssignment } from '@/entities/software'
import { StatusBadge } from '@/shared/ui/status-badge'
import { theme } from '@/shared/ui/theme'

interface SoftwareRowProps {
  badgeLabel?: string
  kindLabel: string
  onPress: () => void
  software: SoftwareAssignment
}

export function SoftwareRow({ badgeLabel, kindLabel, onPress, software }: SoftwareRowProps) {
  return (
    <Pressable accessibilityRole='button' onPress={onPress} style={styles.row}>
      <View style={[styles.mark, { backgroundColor: software.markColor }]}>
        <Text style={styles.monogram}>{software.monogram}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{software.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.kindPill}>
            <Text style={styles.kind}>{kindLabel}</Text>
          </View>
          <Text style={styles.subtitle}>{`• ${software.subtitle}`}</Text>
        </View>
      </View>
      <StatusBadge label={badgeLabel} status={software.status === 'expiring' ? 'expiring' : 'active'} />
      {software.kind === 'shared' ? (
        <Ionicons color={theme.colors.mutedForeground} name='chevron-forward' size={16} />
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14
  },
  mark: {
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  monogram: {
    color: theme.colors.primaryForeground,
    fontSize: 13,
    fontWeight: '700'
  },
  copy: {
    flex: 1,
    gap: 4
  },
  name: {
    color: theme.colors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6
  },
  kindPill: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  kind: {
    color: theme.colors.mutedForeground,
    fontSize: 10,
    fontWeight: '600'
  },
  subtitle: {
    color: theme.colors.mutedForeground,
    flexShrink: 1,
    fontSize: 11
  }
})
