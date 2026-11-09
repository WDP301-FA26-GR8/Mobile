import { Feather } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

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
          style={[styles.tab, tab.disabled && styles.tabDisabled]}
        >
          <View style={[styles.iconContainer, tab.selected && styles.iconContainerSelected]}>
            <Feather
              accessibilityElementsHidden
              color={tab.selected ? mobileColors.primary : mobileColors.muted}
              importantForAccessibility='no'
              name={tab.icon}
              size={17}
            />
          </View>
          <Text style={[styles.label, tab.selected && styles.labelSelected]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: mobileColors.surface,
    borderTopColor: mobileColors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 5,
    paddingHorizontal: 10,
    paddingTop: 6
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 16,
    height: 30,
    justifyContent: 'center',
    width: 44
  },
  iconContainerSelected: {
    backgroundColor: mobileColors.primarySoft
  },
  label: {
    color: mobileColors.muted,
    fontSize: 10,
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
    minHeight: 50
  },
  tabDisabled: {
    opacity: 0.5
  }
})
