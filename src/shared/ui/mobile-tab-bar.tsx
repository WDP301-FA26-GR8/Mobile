import { Feather } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

type FeatherIconName = keyof typeof Feather.glyphMap

export interface MobileTab {
  accessibilityLabel: string
  icon: FeatherIconName
  id: string
  label: string
  onPress?: () => void
  selected: boolean
  disabled?: boolean
  accessibilityHint?: string
}

interface MobileTabBarProps {
  accessibilityLabel: string
  tabs: MobileTab[]
}

export function MobileTabBar({ accessibilityLabel, tabs }: MobileTabBarProps) {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole='tablist' style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          accessibilityLabel={tab.accessibilityLabel}
          accessibilityHint={tab.accessibilityHint}
          accessibilityRole='tab'
          accessibilityState={{ selected: tab.selected, disabled: tab.disabled }}
          disabled={tab.disabled}
          key={tab.id}
          onPress={tab.onPress}
          style={({ pressed }) => [styles.tab, pressed && styles.tabPressed, tab.disabled && styles.tabDisabled]}
        >
          <View style={[styles.iconContainer, tab.selected && styles.iconContainerSelected]}>
            <Feather
              accessibilityElementsHidden
              color={tab.selected ? mobileColors.primaryInk : mobileColors.muted}
              importantForAccessibility='no'
              name={tab.icon}
              size={20}
            />
          </View>
          <Text style={[styles.label, tab.selected && styles.labelSelected]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const createStyles = (mobileColors: MobileColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: mobileColors.sidebar,
      borderTopColor: mobileColors.border,
      borderTopWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingBottom: 7,
      paddingHorizontal: 10,
      paddingTop: 6
    },
    iconContainer: {
      alignItems: 'center',
      borderRadius: 16,
      height: 32,
      justifyContent: 'center',
      width: 44
    },
    iconContainerSelected: {
      backgroundColor: mobileColors.primarySoft
    },
    label: {
      color: mobileColors.muted,
      fontSize: 12,
      fontWeight: '500',
      marginTop: 1,
      textAlign: 'center'
    },
    labelSelected: {
      color: mobileColors.primaryInk,
      fontWeight: '700'
    },
    tab: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      minHeight: 56
    },
    tabPressed: {
      opacity: 0.65
    },
    tabDisabled: {
      opacity: 0.5
    }
  })
