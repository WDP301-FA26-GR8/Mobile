import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

interface EmployeeProfileHeaderProps {
  initials: string
  meta: string
  name: string
  onOpenInbox?: () => void
}

export function EmployeeProfileHeader({ initials, meta, name, onOpenInbox }: EmployeeProfileHeaderProps) {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      {onOpenInbox ? (
        <Pressable
          accessibilityLabel={t('navigation.openTab', { tab: t('navigation.inbox') })}
          accessibilityRole='button'
          onPress={onOpenInbox}
          style={styles.bell}
        >
          <Feather
            accessibilityElementsHidden
            color={mobileColors.foreground}
            importantForAccessibility='no'
            name='bell'
            size={18}
          />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  bell: {
    alignItems: 'center',
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    minHeight: 54
  },
  copy: {
    flex: 1
  },
  initials: {
    color: mobileColors.primaryInk,
    fontSize: 14,
    fontWeight: '700'
  },
  meta: {
    color: mobileColors.muted,
    fontSize: 11,
    marginTop: 3
  },
  name: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  }
})
