import { Pressable, StyleSheet, Text, View } from 'react-native'

export interface MobileTab {
  accessibilityLabel: string
  id: string
  label: string
  onPress: () => void
  selected: boolean
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
          accessibilityRole='tab'
          accessibilityState={{ selected: tab.selected }}
          key={tab.id}
          onPress={tab.onPress}
          style={styles.tab}
        >
          <Text style={[styles.indicator, tab.selected && styles.indicatorSelected]}>{tab.selected ? '●' : '○'}</Text>
          <Text style={[styles.label, tab.selected && styles.labelSelected]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopColor: '#efe3d7',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
    paddingHorizontal: 8,
    paddingTop: 9
  },
  indicator: {
    color: '#a89c91',
    fontSize: 15,
    lineHeight: 18
  },
  indicatorSelected: {
    color: '#ff7020'
  },
  label: {
    color: '#8a786a',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center'
  },
  labelSelected: {
    color: '#a33700',
    fontWeight: '700'
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48
  }
})
