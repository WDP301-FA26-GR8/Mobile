import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { theme } from './theme'

interface PersonaHeaderProps {
  avatarLabel: string
  bellLabel: string
  departmentLine: string
  initials: string
  jobTitle: string
  name: string
  onPressAvatar: () => void
  onPressBell: () => void
}

export function PersonaHeader({
  avatarLabel,
  bellLabel,
  departmentLine,
  initials,
  jobTitle,
  name,
  onPressAvatar,
  onPressBell
}: PersonaHeaderProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityLabel={avatarLabel}
        accessibilityRole='button'
        onPress={onPressAvatar}
        style={styles.identity}
      >
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.copy}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.jobPill}>
              <Text style={styles.job}>{jobTitle}</Text>
            </View>
          </View>
          <Text style={styles.department}>{departmentLine}</Text>
        </View>
      </Pressable>
      <Pressable accessibilityLabel={bellLabel} accessibilityRole='button' onPress={onPressBell} style={styles.bell}>
        <Ionicons color={theme.colors.foreground} name='notifications-outline' size={16} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  identity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 99,
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  initials: {
    color: theme.colors.primaryInk,
    fontSize: 12,
    fontWeight: '700'
  },
  copy: {
    flex: 1,
    gap: 2
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6
  },
  name: {
    color: theme.colors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  jobPill: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  job: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '600'
  },
  department: {
    color: theme.colors.mutedForeground,
    fontSize: 11
  },
  bell: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 99,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36
  }
})
