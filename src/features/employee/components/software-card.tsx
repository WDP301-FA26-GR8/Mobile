import { Pressable, StyleSheet, Text } from 'react-native'

import type { SoftwareAssignment } from '@/entities/software'
import { StatusBadge } from '@/shared/ui/status-badge'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'

interface SoftwareCardProps {
  categoryLabel: string
  expiresLabel: string
  onPress: () => void
  software: SoftwareAssignment
  usageLabel: string
}

export function SoftwareCard({ categoryLabel, expiresLabel, onPress, software, usageLabel }: SoftwareCardProps) {
  return (
    <Pressable accessibilityRole='button' onPress={onPress}>
      <Surface>
        <Text style={styles.category}>{categoryLabel}</Text>
        <Text style={styles.name}>{software.name}</Text>
        <Text style={styles.plan}>{software.plan}</Text>
        <StatusBadge status={software.status} />
        <Text style={styles.meta}>{expiresLabel}</Text>
        <Text style={styles.meta}>{usageLabel}</Text>
      </Surface>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  category: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
    fontWeight: '700'
  },
  name: {
    color: theme.colors.foreground,
    fontSize: 18,
    fontWeight: '700'
  },
  plan: {
    color: theme.colors.mutedForeground,
    fontSize: 14
  },
  meta: {
    color: theme.colors.foreground,
    fontSize: 14
  }
})
