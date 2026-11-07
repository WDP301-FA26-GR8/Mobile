import type { PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'

import { theme } from './theme'

export function Surface({ children }: PropsWithChildren) {
  return <View style={styles.surface}>{children}</View>
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg
  }
})
