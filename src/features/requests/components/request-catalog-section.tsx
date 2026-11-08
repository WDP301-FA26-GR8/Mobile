import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import { RequestCatalogCard } from './request-catalog-card'
import type { CatalogSoftware } from '../model/employee-requests'

export type RequestCatalogFilter = 'all' | 'standard' | 'outside'

interface RequestCatalogSectionProps {
  filter: RequestCatalogFilter
  onFilterChange: (filter: RequestCatalogFilter) => void
  onSearchChange: (search: string) => void
  onSelectTool: (software: CatalogSoftware) => void
  search: string
  selectedToolId?: string
  software: CatalogSoftware[]
  totalCount: number
}

export function RequestCatalogSection({
  filter,
  onFilterChange,
  onSearchChange,
  onSelectTool,
  search,
  selectedToolId,
  software,
  totalCount
}: RequestCatalogSectionProps) {
  const { t } = useTranslation()
  const filters: { id: RequestCatalogFilter; label: string }[] = [
    { id: 'all', label: t('requests.filters.all') },
    { id: 'standard', label: t('requests.filters.standard') },
    { id: 'outside', label: t('requests.filters.outside') }
  ]

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>{t('requests.chooseCatalogTool')}</Text>
          <Text style={styles.sectionHint}>{t('requests.catalogHint')}</Text>
        </View>
        <Text numberOfLines={1} style={styles.itemCount}>
          {t('requests.catalogCount', { count: totalCount })}
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Feather
          accessibilityElementsHidden
          color={mobileColors.muted}
          importantForAccessibility='no'
          name='search'
          size={17}
        />
        <TextInput
          accessibilityLabel={t('requests.searchCatalog')}
          onChangeText={onSearchChange}
          placeholder={t('requests.searchCatalog')}
          placeholderTextColor={mobileColors.muted}
          returnKeyType='search'
          style={styles.searchInput}
          value={search}
        />
      </View>

      <View accessibilityLabel={t('requests.catalogFilters')} style={styles.filters}>
        {filters.map((item) => {
          const selected = filter === item.id

          return (
            <Pressable
              accessibilityRole='button'
              accessibilityState={{ selected }}
              key={item.id}
              onPress={() => onFilterChange(item.id)}
              style={[styles.filterButton, selected && styles.selectedFilter]}
            >
              <Text style={[styles.filterLabel, selected && styles.selectedFilterLabel]}>{item.label}</Text>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.catalogList}>
        {software.map((item) => (
          <RequestCatalogCard
            key={item.id}
            onPress={onSelectTool}
            selected={selectedToolId === item.id}
            software={item}
          />
        ))}
        {software.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('requests.catalogEmptyTitle')}</Text>
            <Text style={styles.emptyDescription}>{t('requests.catalogEmptyDescription')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.scopeNote}>
        <Text style={styles.scopeNoteText}>{t('requests.personalOnly')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  catalogList: {
    gap: 10
  },
  emptyDescription: {
    color: mobileColors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    textAlign: 'center'
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 10,
    padding: 18
  },
  emptyTitle: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '600'
  },
  filterButton: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12
  },
  filterLabel: {
    color: mobileColors.muted,
    fontSize: 12,
    fontWeight: '500'
  },
  filters: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 3,
    padding: 4
  },
  heading: {
    flex: 1
  },
  itemCount: {
    color: mobileColors.muted,
    flexShrink: 0,
    fontSize: 11,
    textAlign: 'right'
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    minHeight: 46,
    paddingHorizontal: 12
  },
  searchInput: {
    color: mobileColors.foreground,
    flex: 1,
    fontSize: 16,
    minHeight: 44,
    paddingVertical: 0
  },
  scopeNote: {
    borderLeftColor: mobileColors.primary,
    borderLeftWidth: 2,
    paddingLeft: 10
  },
  scopeNoteText: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  section: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
    padding: 15
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between'
  },
  sectionHint: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  },
  sectionTitle: {
    color: mobileColors.foreground,
    fontSize: 15,
    fontWeight: '700'
  },
  selectedFilter: {
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border
  },
  selectedFilterLabel: {
    color: mobileColors.foreground,
    fontWeight: '700'
  }
})
