import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { CatalogItem } from '@/entities/software'
import { StatusBadge } from '@/shared/ui/status-badge'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'

interface CatalogCardProps {
  accessibilityLabel: string
  availabilityLabel: string
  costLabel: string
  item: CatalogItem
  onPress: () => void
  standardLabel: string
}

export function CatalogCard({
  accessibilityLabel,
  availabilityLabel,
  costLabel,
  item,
  onPress,
  standardLabel
}: CatalogCardProps) {
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole='button' onPress={onPress}>
      <Surface>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.badges}>
          {item.ownedSoftwareId ? (
            <StatusBadge status='owned' />
          ) : (
            <StatusBadge status={item.availability === 'in-stock' ? 'inStock' : 'purchase'} />
          )}
          {item.standardToolset ? null : <StatusBadge status='outsideStandard' />}
        </View>
        <Text style={styles.meta}>{item.standardToolset ? standardLabel : availabilityLabel}</Text>
        <Text style={styles.meta}>{costLabel}</Text>
      </Surface>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  name: {
    color: theme.colors.foreground,
    fontSize: 18,
    fontWeight: '700'
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  meta: {
    color: theme.colors.mutedForeground,
    fontSize: 14
  }
})
