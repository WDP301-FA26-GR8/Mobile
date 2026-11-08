import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { demoSoftware, filterSoftware, softwareSummary } from '@/entities/software'
import { FilterChip } from '@/shared/ui/filter-chip'
import { PersonaHeader } from '@/shared/ui/persona-header'
import { Screen } from '@/shared/ui/screen'
import { theme } from '@/shared/ui/theme'
import { RequirePersona, useSession } from '@/features/session'

import { SoftwareRow } from '../components/software-row'

const filters = ['all', 'development', 'design', 'productivity'] as const

export function SoftwareListScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { persona, signOut } = useSession()
  const [category, setCategory] = useState<(typeof filters)[number]>('all')
  const summary = softwareSummary(demoSoftware)
  const visible = filterSoftware(demoSoftware, { category, query: '' })

  function leave() {
    signOut()
    router.replace('/sign-in')
  }

  return (
    <RequirePersona personaId='employee'>
      <Screen>
        {persona ? (
          <PersonaHeader
            avatarLabel={t('common.signOut')}
            bellLabel={t('nav.inbox')}
            departmentLine={persona.departmentLine}
            initials={persona.initials}
            jobTitle={persona.jobTitle}
            name={persona.name}
            onPressAvatar={leave}
            onPressBell={() => router.push('/inbox')}
          />
        ) : null}
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <View style={styles.statCopy}>
                <Text style={styles.statCaption}>{t('software.summary.activeCaption')}</Text>
                <Text style={styles.statValue}>{t('software.summary.activeValue', { count: summary.active })}</Text>
              </View>
              <View style={styles.statIconActive}>
                <Ionicons color={theme.colors.successInk} name='checkmark' size={16} />
              </View>
            </View>
            <View style={styles.stat}>
              <View style={styles.statCopy}>
                <Text style={styles.statCaption}>{t('software.summary.expiringCaption')}</Text>
                <Text style={styles.statValueWarning}>
                  {t('software.summary.expiringValue', { count: summary.expiring })}
                </Text>
              </View>
              <View style={styles.statIconWarning}>
                <Ionicons color={theme.colors.warningInk} name='time-outline' size={16} />
              </View>
            </View>
          </View>
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
          {visible.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('software.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('software.emptyBody')}</Text>
            </View>
          ) : (
            visible.map((software) => (
              <SoftwareRow
                badgeLabel={software.daysLeft ? t('software.daysLeft', { count: software.daysLeft }) : undefined}
                key={software.id}
                kindLabel={t(
                  software.kind === 'license-key'
                    ? 'software.kinds.licenseKey'
                    : software.kind === 'shared'
                      ? 'software.kinds.shared'
                      : 'software.kinds.ssoSeat'
                )}
                onPress={() => router.push({ pathname: '/software/[id]', params: { id: software.id } })}
                software={software}
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
    gap: 14,
    padding: 16
  },
  stats: {
    flexDirection: 'row',
    gap: 10
  },
  stat: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 64,
    padding: 12
  },
  statCopy: {
    flex: 1,
    gap: 2
  },
  statCaption: {
    color: theme.colors.mutedForeground,
    fontSize: 11
  },
  statValue: {
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: '700'
  },
  statValueWarning: {
    color: theme.colors.warningInk,
    fontSize: 16,
    fontWeight: '700'
  },
  statIconActive: {
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  statIconWarning: {
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  empty: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 16
  },
  emptyTitle: {
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: '700'
  },
  emptyBody: {
    color: theme.colors.mutedForeground,
    fontSize: 14
  }
})
