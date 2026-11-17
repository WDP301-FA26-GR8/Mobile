import { StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

interface CapabilityCardProps {
  description: string
  title: string
}

export function CapabilityCard({ description, title }: CapabilityCardProps) {
  return (
    <View style={styles.card}>
      <Text accessibilityRole='header' style={styles.title}>
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 7,
    padding: 18
  },
  description: {
    color: mobileColors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  title: {
    color: mobileColors.foreground,
    fontSize: 17,
    fontWeight: '700'
  }
})
