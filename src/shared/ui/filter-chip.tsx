import { Pressable, StyleSheet, Text } from 'react-native'

import { theme } from './theme'

interface FilterChipProps {
  label: string
  onPress: () => void
  selected: boolean
}

export function FilterChip({ label, onPress, selected }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  chipSelected: {
    backgroundColor: theme.colors.primary
  },
  label: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
    fontWeight: '600'
  },
  labelSelected: {
    color: theme.colors.primaryForeground
  }
})
