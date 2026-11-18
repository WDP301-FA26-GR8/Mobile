import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { type Href, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useAccountProfile } from '@/shared/api/use-account-profile'
import { useUnreadCount } from '@/shared/api/use-unread-count'
import { type TabName, visibleTabs } from '@/shared/navigation/visible-tabs'
import { MobileTabBar, type MobileTab } from '@/shared/ui/mobile-tab-bar'

const icons: Record<TabName, MobileTab['icon']> = {
  home: 'home',
  'my-software': 'grid',
  'live-need-approvals': 'check-square',
  'spending-approvals': 'credit-card',
  'live-requests': 'file-text',
  'live-inbox': 'bell',
  profile: 'user'
}

export function RoleTabBar({ state }: BottomTabBarProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const profile = useAccountProfile()
  const unread = useUnreadCount()
  const names = visibleTabs(profile.isError ? undefined : profile.data)
  const active = state.routes[state.index]?.name

  const tabs = names.map((name): MobileTab => {
    const label = t(`navigation.tab.${name}`)
    const badge = name === 'live-inbox' && unread.data ? unread.data : undefined
    return {
      id: name,
      icon: icons[name],
      label,
      badge,
      selected: active === name,
      accessibilityLabel: t('navigation.openTab', { tab: label }),
      onPress: () => {
        if (active === name) return
        router.navigate((name === 'home' ? '/home' : `/${name}`) as Href)
      }
    }
  })
  return <MobileTabBar accessibilityLabel={t('navigation.tabs')} tabs={tabs} />
}
