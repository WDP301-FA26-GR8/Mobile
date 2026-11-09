import { useTranslation } from 'react-i18next'

import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

type ManagerTab = 'queue' | 'team' | 'inbox'

export function ManagerLiveTabs({
  active,
  disabled,
  onSelect
}: {
  active: ManagerTab
  disabled: boolean
  onSelect: (tab: ManagerTab) => void
}) {
  const { t } = useTranslation()
  return (
    <MobileTabBar
      accessibilityLabel={t('navigation.tabs')}
      tabs={[
        {
          id: 'queue',
          label: t('manager.tabs.queue'),
          icon: 'check-square',
          selected: active === 'queue',
          disabled,
          onPress: () => onSelect('queue'),
          accessibilityLabel: t('navigation.openTab', { tab: t('manager.tabs.queue') })
        },
        {
          id: 'team',
          label: t('manager.live.teamTab'),
          icon: 'users',
          selected: active === 'team',
          disabled,
          onPress: () => onSelect('team'),
          accessibilityLabel: t('navigation.openTab', { tab: t('manager.live.teamTab') })
        },
        {
          id: 'inbox',
          label: t('navigation.inbox'),
          icon: 'bell',
          selected: active === 'inbox',
          disabled,
          onPress: () => onSelect('inbox'),
          accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') })
        }
      ]}
    />
  )
}
