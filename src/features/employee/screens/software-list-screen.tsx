import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

import { demoSoftware, filterSoftware, softwareSummary, type SoftwareFilter } from '@/entities/software'
import { formatDate } from '@/shared/lib/format'
import { FilterChip } from '@/shared/ui/filter-chip'
import { Screen } from '@/shared/ui/screen'
import { ScreenHeader } from '@/shared/ui/screen-header'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'
import { RequirePersona, useSession } from '@/features/session'

import { SoftwareCard } from '../components/software-card'
import { categoryLabel } from '../model/labels'

const filters: SoftwareFilter[] = ['all', 'development', 'design']

export function SoftwareListScreen() {
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const { signOut } = useSession()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SoftwareFilter>('all')
  const summary = softwareSummary(demoSoftware)
  const visible = filterSoftware(demoSoftware, { category, query })

  function leave() {
    signOut()
    router.replace('/sign-in')
  }

  return (
    <RequirePersona personaId='employee'>
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader onSignOut={leave} signOutLabel={t('common.signOut')} title={t('software.title')} />
          <TextInput
            accessibilityLabel={t('software.searchLabel')}
            onChangeText={setQuery}
            placeholder={t('software.searchPlaceholder')}
            placeholderTextColor={theme.colors.mutedForeground}
            style={styles.search}
            value={query}
          />
          <View style={styles.filters}>
            {filters.map((item) => (
              <FilterChip
                key={item}
                label={t(`software.filters.${item}`)}
                onPress={() => setCategory(item)}
                selected={category === item}
              />
            ))}
          </View>
          <View style={styles.summary}>
            <Surface>
              <Text style={styles.summaryText}>{t('software.summary.active', { count: summary.active })}</Text>
            </Surface>
            <Surface>
              <Text style={styles.summaryText}>{t('software.summary.expiring', { count: summary.expiring })}</Text>
            </Surface>
          </View>
          {visible.length === 0 ? (
            <Surface>
              <Text style={styles.emptyTitle}>{t('software.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('software.emptyBody')}</Text>
            </Surface>
          ) : (
            visible.map((software) => (
              <SoftwareCard
                categoryLabel={categoryLabel(software.category, t)}
                expiresLabel={t('software.expires', { date: formatDate(software.expiresOn, i18n.language) })}
                key={software.id}
                onPress={() => router.push({ pathname: '/software/[id]', params: { id: software.id } })}
                software={software}
                usageLabel={t('software.usage', { percent: software.usagePercent })}
              />
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
  search: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  summary: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  summaryText: {
    color: theme.colors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  emptyTitle: {
    color: theme.colors.foreground,
    fontSize: 18,
    fontWeight: '700'
  },
  emptyBody: {
    color: theme.colors.mutedForeground,
    fontSize: 14
  }
})
