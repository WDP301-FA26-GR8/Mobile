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
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  chipSelected: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary
  },
  label: {
    color: theme.colors.mutedForeground,
    fontSize: 13,
    fontWeight: '700'
  },
  labelSelected: {
    color: theme.colors.primaryInk
  }
})
