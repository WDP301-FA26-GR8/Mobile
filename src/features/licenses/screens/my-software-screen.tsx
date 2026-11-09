import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { mobileColors } from '@/shared/theme/colors'
import { EmployeeProfileHeader } from '@/shared/ui/employee-profile-header'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { SoftwareCard } from '../components/software-card'
import { mySoftwareItems } from '../model/my-software'

export function MySoftwareScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'expiring'>('all')
  const activeCount = mySoftwareItems.length
  const expiringCount = mySoftwareItems.filter((software) => software.status.type === 'expiring').length
  const visibleSoftware = mySoftwareItems.filter((software) => filter === 'all' || software.status.type === 'expiring')

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <EmployeeProfileHeader
            initials='VA'
            meta={`${t('licenses.employeeDepartment')} · ${t('common.demo')}`}
            name={t('licenses.employeeName')}
            onOpenInbox={() => router.push('/inbox')}
          />

          <View style={styles.heading}>
            <Text style={styles.kicker}>{t('licenses.kicker')}</Text>
            <Text accessibilityRole='header' style={styles.title}>
              {t('licenses.screenTitle')}
            </Text>
            <Text style={styles.subtitle}>{t('licenses.screenSubtitle')}</Text>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, styles.summaryIconPrimary]}>
                <Feather
                  accessibilityElementsHidden
                  color={mobileColors.primaryInk}
                  importantForAccessibility='no'
                  name='grid'
                  size={16}
                />
              </View>
              <Text style={styles.summaryValue}>{t('licenses.activeCount', { count: activeCount })}</Text>
              <Text style={styles.summaryLabel}>{t('licenses.summary.active')}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, styles.summaryIconWarning]}>
                <Feather
                  accessibilityElementsHidden
                  color={mobileColors.warning}
                  importantForAccessibility='no'
                  name='clock'
                  size={16}
                />
              </View>
              <Text style={styles.summaryValue}>{t('licenses.expiringCount', { count: expiringCount })}</Text>
              <Text style={styles.summaryLabel}>{t('licenses.summary.expiring')}</Text>
            </View>
          </View>

          <Text style={styles.demoNote}>{t('licenses.demoData')}</Text>

          <View style={styles.sectionHeading}>
            <Text accessibilityRole='header' style={styles.sectionTitle}>
              {t('licenses.listTitle')}
            </Text>
            <Text style={styles.countBadge}>{visibleSoftware.length}</Text>
          </View>

          <View accessibilityLabel={t('licenses.filterLabel')} style={styles.filters}>
            {(['all', 'expiring'] as const).map((item) => (
              <Pressable
                accessibilityRole='button'
                accessibilityState={{ selected: filter === item }}
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.filterButton, filter === item && styles.filterSelected]}
              >
                <Text style={[styles.filterText, filter === item && styles.filterTextSelected]}>
                  {t(`licenses.listFilters.${item}`)}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.list}>
            {visibleSoftware.map((software) => (
              <SoftwareCard
                key={software.id}
                onPress={(softwareId) => router.push({ pathname: '/my-software/[softwareId]', params: { softwareId } })}
                software={software}
              />
            ))}
            {visibleSoftware.length === 0 ? <Text style={styles.empty}>{t('licenses.noExpiring')}</Text> : null}
          </View>
          <Text style={styles.securityNote}>{t('licenses.securityNote')}</Text>
        </ScrollView>
        <MobileTabBar
          accessibilityLabel={t('navigation.tabs')}
          tabs={[
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.software') }),
              icon: 'grid',
              id: 'software',
              label: t('navigation.software'),
              onPress: () => router.replace('/my-software'),
              selected: true
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.createRequest') }),
              icon: 'plus-circle',
              id: 'create',
              label: t('navigation.createRequest'),
              onPress: () => router.push('/my-requests/new'),
              selected: false
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.requests') }),
              icon: 'clock',
              id: 'requests',
              label: t('navigation.requests'),
              onPress: () => router.push('/my-requests'),
              selected: false
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
              icon: 'bell',
              id: 'inbox',
              label: t('navigation.inbox'),
              onPress: () => router.push('/inbox'),
              selected: false
            }
          ]}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 15,
    padding: 16,
    paddingBottom: 24
  },
  countBadge: {
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 9,
    color: mobileColors.primaryInk,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  demoNote: {
    color: mobileColors.muted,
    fontSize: 11,
    lineHeight: 16
  },
  empty: {
    color: mobileColors.muted,
    fontSize: 13,
    lineHeight: 19,
    padding: 16,
    textAlign: 'center'
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 15
  },
  filterSelected: {
    backgroundColor: mobileColors.primary
  },
  filterText: {
    color: mobileColors.muted,
    fontSize: 12,
    fontWeight: '600'
  },
  filterTextSelected: {
    color: mobileColors.white
  },
  filters: {
    alignSelf: 'flex-start',
    backgroundColor: '#f6eee6',
    borderRadius: 14,
    flexDirection: 'row',
    padding: 4
  },
  heading: {
    gap: 5,
    paddingHorizontal: 2
  },
  kicker: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  list: {
    gap: 9
  },
  safeArea: {
    backgroundColor: mobileColors.background,
    flex: 1
  },
  screen: {
    flex: 1
  },
  securityNote: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 2
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    color: mobileColors.foreground,
    fontSize: 16,
    fontWeight: '700'
  },
  subtitle: {
    color: mobileColors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  summary: {
    flexDirection: 'row',
    gap: 9
  },
  summaryCard: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    padding: 13,
    boxShadow: '0px 3px 8px rgba(93, 59, 32, 0.04)'
  },
  summaryIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 30,
    justifyContent: 'center',
    marginBottom: 2,
    width: 34
  },
  summaryIconPrimary: {
    backgroundColor: mobileColors.primarySoft
  },
  summaryIconWarning: {
    backgroundColor: mobileColors.warningBackground
  },
  summaryLabel: {
    color: mobileColors.muted,
    fontSize: 10,
    fontWeight: '500'
  },
  summaryValue: {
    color: mobileColors.foreground,
    fontSize: 17,
    fontWeight: '700'
  },
  title: {
    color: mobileColors.foreground,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.5
  }
})
