import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { CatalogItem } from '@/entities/software'
import { StatusBadge } from '@/shared/ui/status-badge'
import { theme } from '@/shared/ui/theme'

interface CatalogCardProps {
  accessibilityLabel: string
  costLabel: string
  item: CatalogItem
  onPress: () => void
  ownedLabel: string
  standardLabel: string
}

export function CatalogCard({
  accessibilityLabel,
  costLabel,
  item,
  onPress,
  ownedLabel,
  standardLabel
}: CatalogCardProps) {
  const owned = Boolean(item.ownedSoftwareId)

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole='button'
      onPress={onPress}
      style={[styles.row, owned && styles.owned]}
    >
      <View style={[styles.mark, { backgroundColor: item.markColor }]}>
        <Text style={styles.monogram}>{item.monogram}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.meta}>
          {owned ? (
            <StatusBadge label={ownedLabel} status='owned' />
          ) : item.standardToolset ? (
            <StatusBadge label={standardLabel} status='active' />
          ) : (
            <StatusBadge status='outsideStandard' />
          )}
          <Text style={styles.price}>{costLabel}</Text>
        </View>
      </View>
      <Ionicons color={theme.colors.mutedForeground} name='chevron-forward' size={16} />
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
  owned: {
    opacity: 0.7
  },
  mark: {
    alignItems: 'center',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  monogram: {
    color: theme.colors.primaryForeground,
    fontSize: 13,
    fontWeight: '700'
  },
  copy: {
    flex: 1,
    gap: 6
  },
  name: {
    color: theme.colors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  price: {
    color: theme.colors.mutedForeground,
    flexShrink: 1,
    fontSize: 11
  }
})
