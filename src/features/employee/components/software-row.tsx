import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { SoftwareAssignment } from '@/entities/software'
import { theme } from '@/shared/ui/theme'

interface SoftwareRowProps {
  badgeLabel: string
  kindLabel: string
  onPress: () => void
  software: SoftwareAssignment
}

export function SoftwareRow({ badgeLabel, kindLabel, onPress, software }: SoftwareRowProps) {
  const expiring = software.status === 'expiring'

  return (
    <Pressable
      accessibilityRole='button'
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.mark, { backgroundColor: software.markColor }]}>
        <Text style={styles.monogram}>{software.monogram}</Text>
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>
          {software.name}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.kindPill}>
            <Text style={styles.kind}>{kindLabel}</Text>
          </View>
          <Text numberOfLines={1} style={styles.subtitle}>{`• ${software.subtitle}`}</Text>
        </View>
      </View>
      <View style={[styles.badge, expiring ? styles.badgeExpiring : styles.badgeActive]}>
        <Text style={[styles.badgeLabel, expiring ? styles.badgeLabelExpiring : styles.badgeLabelActive]}>
          {badgeLabel}
        </Text>
      </View>
      <Ionicons color='#c4b5aa' name='chevron-forward' size={16} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: '#fffdf9',
    borderColor: theme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#241c18',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 8
  },
  pressed: {
    opacity: 0.86
  },
  mark: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  monogram: {
    color: theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700'
  },
  copy: {
    flex: 1,
    gap: 5,
    minWidth: 0
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
    flex: 1,
    fontSize: 11
  },
  badge: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  badgeActive: {
    backgroundColor: '#dcfce7'
  },
  badgeExpiring: {
    backgroundColor: '#fef3c7'
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700'
  },
  badgeLabelActive: {
    color: theme.colors.successInk
  },
  badgeLabelExpiring: {
    color: theme.colors.warningInk
  }
})
