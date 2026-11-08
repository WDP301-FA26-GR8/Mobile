import { Ionicons } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { homeRouteName, useSession } from '@/features/session'
import { EmployeeTabBar } from '@/shared/ui/employee-tab-bar'
import { theme } from '@/shared/ui/theme'

export default function AppLayout() {
  const { t } = useTranslation()
  const { persona } = useSession()

  if (!persona) return <Redirect href='/sign-in' />

  const role = persona.id

  return (
    <Tabs
      initialRouteName={homeRouteName(role)}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.colors.sidebar,
          borderTopColor: theme.colors.border
        }
      }}
      tabBar={
        role === 'employee'
          ? (props) => (
              <EmployeeTabBar
                {...props}
                labels={{
                  inbox: t('nav.inbox'),
                  'request-new': t('nav.newRequest'),
                  requests: t('nav.progress'),
                  software: t('nav.vault')
                }}
              />
            )
          : undefined
      }
    >
      <Tabs.Screen
        name='software'
        options={{
          href: role === 'employee' ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name='grid-outline' size={size} />,
          title: t('nav.vault')
        }}
      />
      <Tabs.Screen
        name='request-new'
        options={{
          href: role === 'employee' ? undefined : null,
          title: t('nav.newRequest')
        }}
      />
      <Tabs.Screen
        name='requests'
        options={{
          href: role === 'employee' ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name='time-outline' size={size} />,
          title: t('nav.progress')
        }}
      />
      <Tabs.Screen
        name='inbox'
        options={{
          href: role === 'employee' ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name='notifications-outline' size={size} />,
          title: t('nav.inbox')
        }}
      />
      <Tabs.Screen
        name='manager-queue'
        options={{
          href: role === 'manager' ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name='people-outline' size={size} />,
          title: t('nav.managerQueue')
        }}
      />
      <Tabs.Screen
        name='spend-queue'
        options={{
          href: role === 'approver' ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name='card-outline' size={size} />,
          title: t('nav.spendQueue')
        }}
      />
    </Tabs>
  )
}
