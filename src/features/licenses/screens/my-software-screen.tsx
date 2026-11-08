import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EmployeeProfileHeader } from '@/shared/ui/employee-profile-header'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { SoftwareCard } from '../components/software-card'
import { mySoftwareItems } from '../model/my-software'

export function MySoftwareScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const activeCount = mySoftwareItems.length
  const expiringCount = mySoftwareItems.filter((software) => software.status.type === 'expiring').length

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <EmployeeProfileHeader
            initials='VA'
            meta={`${t('licenses.employeeDepartment')} · ${t('common.demo')}`}
            name={t('licenses.employeeName')}
          />

          <View style={styles.summary}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{t('licenses.summary.active')}</Text>
              <Text style={styles.summaryValue}>{t('licenses.activeCount', { count: activeCount })}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{t('licenses.summary.expiring')}</Text>
              <Text style={styles.summaryValue}>{t('licenses.expiringCount', { count: expiringCount })}</Text>
            </View>
          </View>

          <Text style={styles.securityNote}>{t('licenses.securityNote')}</Text>

          <View style={styles.list}>
            {mySoftwareItems.map((software) => (
              <SoftwareCard
                key={software.id}
                onPress={(softwareId) => router.push({ pathname: '/my-software/[softwareId]', params: { softwareId } })}
                software={software}
              />
            ))}
          </View>
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
              onPress: () => router.push('/my-requests/index'),
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
    gap: 16,
    padding: 18
  },
  list: {
    gap: 9
  },
  safeArea: {
    backgroundColor: '#fef7ef',
    flex: 1
  },
  screen: {
    flex: 1
  },
  securityNote: {
    backgroundColor: '#fffaf4',
    borderColor: '#f1e4d8',
    borderRadius: 12,
    borderWidth: 1,
    color: '#7c7068',
    fontSize: 12,
    lineHeight: 18,
    padding: 12
  },
  summary: {
    flexDirection: 'row',
    gap: 9
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderColor: '#f0e2d5',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: 13
  },
  summaryLabel: {
    color: '#8a786a',
    fontSize: 11,
    fontWeight: '500'
  },
  summaryValue: {
    color: '#241c18',
    fontSize: 15,
    fontWeight: '700'
  }
})
