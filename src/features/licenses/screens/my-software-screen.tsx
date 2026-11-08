import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { SoftwareCard } from '../components/software-card'
import { mySoftwareItems, type SoftwareCategoryFilter } from '../model/my-software'

const categoryFilters: SoftwareCategoryFilter[] = ['all', 'development', 'design', 'productivity']

export function MySoftwareScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<SoftwareCategoryFilter>('all')
  const activeCount = mySoftwareItems.filter((software) => software.status.type === 'active').length
  const expiringCount = mySoftwareItems.filter((software) => software.status.type === 'expiring').length
  const visibleSoftware = mySoftwareItems.filter(
    (software) => selectedCategory === 'all' || software.category === selectedCategory
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <View style={styles.avatar} />
          <View style={styles.profileCopy}>
            <Text style={styles.employeeName}>{t('licenses.employeeName')}</Text>
            <Text style={styles.employeeRole}>
              {t('licenses.employeeDepartment')} · {t('licenses.employeeRole')}
            </Text>
          </View>
        </View>

        <Text accessibilityRole='header' style={styles.title}>
          {t('licenses.screenTitle')}
        </Text>
        <Text style={styles.subtitle}>{t('licenses.screenSubtitle')}</Text>
        <Text style={styles.demoNote}>{t('licenses.demoData')}</Text>

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

        <View style={styles.filters}>
          {categoryFilters.map((category) => (
            <Pressable
              accessibilityRole='button'
              accessibilityState={{ selected: selectedCategory === category }}
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.filter, selectedCategory === category && styles.filterSelected]}
            >
              <Text style={[styles.filterLabel, selectedCategory === category && styles.filterLabelSelected]}>
                {t(`licenses.categories.${category}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.list}>
          {visibleSoftware.length ? (
            visibleSoftware.map((software) => (
              <SoftwareCard
                key={software.id}
                onPress={(softwareId) => router.push({ pathname: '/my-software/[softwareId]', params: { softwareId } })}
                software={software}
              />
            ))
          ) : (
            <Text style={styles.empty}>{t('licenses.empty')}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#fdf3e7',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  content: {
    gap: 14,
    padding: 20
  },
  employeeName: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '700'
  },
  employeeRole: {
    color: '#7c7068',
    fontSize: 11,
    marginTop: 3
  },
  demoNote: {
    color: '#a33700',
    fontSize: 12,
    fontWeight: '600'
  },
  empty: {
    color: '#7c7068',
    fontSize: 14,
    paddingVertical: 20,
    textAlign: 'center'
  },
  filter: {
    borderColor: '#efe3d7',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 13
  },
  filterLabel: {
    color: '#7c7068',
    fontSize: 12,
    fontWeight: '600'
  },
  filterLabelSelected: {
    color: '#ffffff'
  },
  filterSelected: {
    backgroundColor: '#ff7020',
    borderColor: '#ff7020'
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  list: {
    gap: 10
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4
  },
  profileCopy: {
    flex: 1
  },
  safeArea: {
    backgroundColor: '#fef7ef',
    flex: 1
  },
  subtitle: {
    color: '#7c7068',
    fontSize: 13
  },
  summary: {
    flexDirection: 'row',
    gap: 10
  },
  summaryCard: {
    backgroundColor: '#fefbf6',
    borderColor: '#efe3d7',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 12
  },
  summaryLabel: {
    color: '#7c7068',
    fontSize: 11
  },
  summaryValue: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '700'
  },
  title: {
    color: '#241c18',
    fontSize: 24,
    fontWeight: '700'
  }
})
