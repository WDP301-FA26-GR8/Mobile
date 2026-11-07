import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text } from 'react-native'

import { requestsForFilter, type RequestStatus } from '@/entities/access-request'
import { formatDate } from '@/shared/lib/format'
import { AppButton } from '@/shared/ui/app-button'
import { FilterChip } from '@/shared/ui/filter-chip'
import { Screen } from '@/shared/ui/screen'
import { ScreenHeader } from '@/shared/ui/screen-header'
import { StatusBadge } from '@/shared/ui/status-badge'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'
import { RequirePersona, useSession } from '@/features/session'

const filters: RequestStatus[] = ['pending', 'approved', 'rejected', 'completed', 'withdrawn']

export function RequestListScreen() {
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const { requests, signOut } = useSession()
  const [filter, setFilter] = useState<RequestStatus>('pending')
  const visible = requestsForFilter(requests, filter)

  function leave() {
    signOut()
    router.replace('/sign-in')
  }

  return (
    <RequirePersona personaId='employee'>
      <Screen footer={<AppButton fullWidth label={t('requests.new')} onPress={() => router.push('/requests/new')} />}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader onSignOut={leave} signOutLabel={t('common.signOut')} title={t('requests.title')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {filters.map((item) => (
              <FilterChip
                key={item}
                label={t(`requests.filters.${item}`)}
                onPress={() => setFilter(item)}
                selected={filter === item}
              />
            ))}
          </ScrollView>
          {visible.length === 0 ? (
            <Surface>
              <Text style={styles.empty}>{t('requests.empty')}</Text>
            </Surface>
          ) : (
            visible.map((request) => (
              <Surface key={request.id}>
                <Text style={styles.name}>{request.softwareName}</Text>
                <StatusBadge status={request.status} />
                <Text style={styles.meta}>{formatDate(request.submittedAt, i18n.language)}</Text>
                <AppButton
                  label={t('requests.open')}
                  onPress={() => router.push({ pathname: '/requests/[id]', params: { id: request.id } })}
                  variant='ghost'
                />
              </Surface>
            ))
          )}
        </ScrollView>
      </Screen>
    </RequirePersona>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  filters: {
    gap: theme.spacing.sm
  },
  name: {
    color: theme.colors.foreground,
    fontSize: 18,
    fontWeight: '700'
  },
  meta: {
    color: theme.colors.mutedForeground,
    fontSize: 14
  },
  empty: {
    color: theme.colors.mutedForeground,
    fontSize: 15
  }
})
