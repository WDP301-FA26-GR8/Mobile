import { Pressable, StyleSheet, Text } from 'react-native'

import { theme } from './theme'

type ButtonVariant = 'primary' | 'danger' | 'ghost'

interface AppButtonProps {
  accessibilityHint?: string
  disabled?: boolean
  fullWidth?: boolean
  label: string
  onPress: () => void
  variant?: ButtonVariant
}

export function AppButton({
  accessibilityHint,
  disabled = false,
  fullWidth = false,
  label,
  onPress,
  variant = 'primary'
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityRole='button'
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <Text style={[styles.label, styles[`${variant}Label`], disabled && styles.disabledLabel]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.spacing.lg
  },
  fullWidth: {
    alignSelf: 'stretch'
  },
  pressed: {
    opacity: 0.85
  },
  primary: {
    backgroundColor: theme.colors.primary
  },
  danger: {
    backgroundColor: theme.colors.danger
  },
  ghost: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1
  },
  disabled: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 0
  },
  label: {
    fontSize: 16,
    fontWeight: '700'
  },
  primaryLabel: {
    color: theme.colors.primaryForeground
  },
  dangerLabel: {
    color: theme.colors.primaryForeground
  },
  ghostLabel: {
    color: theme.colors.foreground
  },
  disabledLabel: {
    color: theme.colors.mutedForeground
  }
})
