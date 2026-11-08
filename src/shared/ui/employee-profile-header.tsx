import { StyleSheet, Text, View } from 'react-native'

interface EmployeeProfileHeaderProps {
  initials: string
  meta: string
  name: string
}

export function EmployeeProfileHeader({ initials, meta, name }: EmployeeProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <Text accessibilityElementsHidden importantForAccessibility='no' style={styles.bell}>
        🔔
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#fbe5d2',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  bell: {
    color: '#514239',
    fontSize: 19,
    marginLeft: 12
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    marginBottom: 16
  },
  copy: {
    flex: 1
  },
  initials: {
    color: '#a33700',
    fontSize: 14,
    fontWeight: '700'
  },
  meta: {
    color: '#8a786a',
    fontSize: 11,
    marginTop: 3
  },
  name: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '700'
  }
})
