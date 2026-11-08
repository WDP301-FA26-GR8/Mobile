import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { theme } from './theme'

const tabs = [
  { icon: 'albums-outline', name: 'software' },
  { icon: 'add', name: 'request-new' },
  { icon: 'time-outline', name: 'requests' },
  { icon: 'notifications-outline', name: 'inbox' }
] as const

interface EmployeeTabBarProps extends BottomTabBarProps {
  labels: Record<(typeof tabs)[number]['name'], string>
}

export function EmployeeTabBar({ descriptors, labels, navigation, state }: EmployeeTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const routeIndex = state.routes.findIndex((route) => route.name === tab.name)
        const route = state.routes[routeIndex]
        if (!route) return null
        const focused = state.index === routeIndex
        const color = focused ? theme.colors.primary : theme.colors.mutedForeground
        const options = descriptors[route.key]?.options

        return (
          <Pressable
            accessibilityLabel={labels[tab.name]}
            accessibilityRole='button'
            accessibilityState={{ selected: focused }}
            key={tab.name}
            onPress={() => {
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: 'tabPress'
              })
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params)
            }}
            style={styles.item}
          >
            <Ionicons color={color} name={tab.icon} size={20} />
            <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>
              {options?.title ?? labels[tab.name]}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.sidebar,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: 8
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 4
  },
  label: {
    fontSize: 10
  }
})
