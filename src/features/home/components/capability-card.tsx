import { StyleSheet, Text, View } from 'react-native'

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
    backgroundColor: '#ffffff',
    borderColor: '#d8e2e8',
    borderRadius: 16,
    borderWidth: 1,
    gap: 7,
    padding: 18
  },
  description: {
    color: '#52677a',
    fontSize: 14,
    lineHeight: 21
  },
  title: {
    color: '#17324d',
    fontSize: 17,
    fontWeight: '700'
  }
})
