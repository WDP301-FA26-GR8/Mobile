import { Tabs } from 'expo-router'

import { RoleTabBar } from '@/shared/ui/role-tab-bar'

export default function TabsLayout() {
  return (
    <Tabs
      backBehavior='initialRoute'
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <RoleTabBar {...props} />}
    >
      <Tabs.Screen name='home' />
      <Tabs.Screen name='my-software' />
      <Tabs.Screen name='live-need-approvals' />
      <Tabs.Screen name='spending-approvals' />
      <Tabs.Screen name='live-requests' />
      <Tabs.Screen name='live-inbox' />
      <Tabs.Screen name='profile' />
    </Tabs>
  )
}
