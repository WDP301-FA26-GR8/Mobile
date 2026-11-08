import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import type { CatalogSoftware } from '../model/employee-requests'

interface RequestCatalogCardProps {
  onPress: (software: CatalogSoftware) => void
  selected: boolean
  software: CatalogSoftware
}

export function RequestCatalogCard({ onPress, selected, software }: RequestCatalogCardProps) {
  const { t } = useTranslation()

  return (
    <Pressable
      accessibilityLabel={t('requests.chooseTool', { name: software.name })}
      accessibilityRole='button'
      accessibilityState={{ selected }}
      onPress={() => onPress(software)}
      style={[styles.card, selected && styles.selectedCard]}
    >
      <View style={styles.icon}>
        <Text style={styles.iconLabel}>{software.name.slice(0, 1)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{software.name}</Text>
          <View style={[styles.badge, !software.isStandard && styles.outsideBadge]}>
            <Text style={[styles.badgeText, !software.isStandard && styles.outsideBadgeText]}>
              {t(software.isStandard ? 'requests.standardTool' : 'requests.outOfStandard')}
            </Text>
          </View>
        </View>
        <Text style={styles.category}>{t(`requests.categories.${software.category}`)}</Text>
        <Text style={styles.description}>{t(software.descriptionKey)}</Text>
      </View>
      <View style={[styles.selection, selected && styles.selectionSelected]}>
        {selected ? (
          <Feather
            accessibilityElementsHidden
            color={mobileColors.white}
            importantForAccessibility='no'
            name='check'
            size={15}
          />
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4
  },
  badgeText: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '600'
  },
  card: {
    alignItems: 'center',
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 92,
    padding: 14
  },
  category: {
    color: mobileColors.muted,
    fontSize: 11,
    marginTop: 2
  },
  content: {
    flex: 1,
    gap: 2
  },
  description: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5
  },
  icon: {
    alignItems: 'center',
    backgroundColor: mobileColors.surfaceSubtle,
    borderColor: mobileColors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  iconLabel: {
    color: mobileColors.primaryInk,
    fontSize: 18,
    fontWeight: '700'
  },
  name: {
    color: mobileColors.foreground,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700'
  },
  outsideBadge: {
    backgroundColor: '#fff2d6'
  },
  outsideBadgeText: {
    color: mobileColors.warning
  },
  selectedCard: {
    backgroundColor: '#fff8f1',
    borderColor: mobileColors.primary
  },
  selection: {
    alignItems: 'center',
    borderColor: mobileColors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24
  },
  selectionSelected: {
    backgroundColor: mobileColors.primary,
    borderColor: mobileColors.primary
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'space-between'
  }
})
