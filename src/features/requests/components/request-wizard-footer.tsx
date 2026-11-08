import { Feather } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

interface RequestWizardFooterProps {
  backLabel: string
  onBack: () => void
  onPrimary: () => void
  primaryAccessibilityLabel: string
  primaryDisabled?: boolean
  primaryIcon: 'arrow-right' | 'check'
  primaryLabel: string
}

export function RequestWizardFooter({
  backLabel,
  onBack,
  onPrimary,
  primaryAccessibilityLabel,
  primaryDisabled = false,
  primaryIcon,
  primaryLabel
}: RequestWizardFooterProps) {
  return (
    <View style={styles.footer}>
      <Pressable accessibilityRole='button' onPress={onBack} style={styles.secondaryButton}>
        <Text style={styles.secondaryLabel}>{backLabel}</Text>
      </Pressable>
      <Pressable
        accessibilityLabel={primaryAccessibilityLabel}
        accessibilityRole='button'
        disabled={primaryDisabled}
        onPress={onPrimary}
        style={[styles.primaryButton, primaryDisabled && styles.disabledButton]}
      >
        <Text style={styles.primaryLabel}>{primaryLabel}</Text>
        <Feather
          accessibilityElementsHidden
          color={mobileColors.white}
          importantForAccessibility='no'
          name={primaryIcon}
          size={16}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.45
  },
  footer: {
    backgroundColor: mobileColors.background,
    borderTopColor: mobileColors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: mobileColors.primary,
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14
  },
  primaryLabel: {
    color: mobileColors.white,
    fontSize: 13,
    fontWeight: '700'
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: mobileColors.border,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 92,
    paddingHorizontal: 14
  },
  secondaryLabel: {
    color: mobileColors.foreground,
    fontSize: 13,
    fontWeight: '600'
  }
})
