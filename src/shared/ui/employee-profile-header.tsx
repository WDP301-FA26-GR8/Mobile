import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

interface EmployeeProfileHeaderProps {
  initials: string
  meta: string
  name: string
  onOpenInbox?: () => void
  onOpenProfile?: () => void
}

export function EmployeeProfileHeader({
  initials,
  meta,
  name,
  onOpenInbox,
  onOpenProfile
}: EmployeeProfileHeaderProps) {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={onOpenProfile ? t('account.openProfile', { name }) : undefined}
        accessibilityRole={onOpenProfile ? 'button' : undefined}
        disabled={!onOpenProfile}
        onPress={onOpenProfile}
        style={styles.identity}
      >
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {meta}
          </Text>
        </View>
        {onOpenProfile ? (
          <Feather
            accessibilityElementsHidden
            importantForAccessibility='no'
            name='chevron-right'
            color={mobileColors.muted}
            size={16}
          />
        ) : null}
      </Pressable>
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

const createStyles = (mobileColors: MobileColors) =>
  StyleSheet.create({
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
      flex: 1,
      minWidth: 0
    },
    identity: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 11, minHeight: 44, minWidth: 0 },
    initials: {
      color: mobileColors.primaryInk,
      fontSize: 14,
      fontWeight: '700'
    },
    meta: {
      color: mobileColors.muted,
      fontSize: 13,
      marginTop: 3
    },
    name: {
      color: mobileColors.foreground,
      fontSize: 15,
      fontWeight: '700'
    }
  })
