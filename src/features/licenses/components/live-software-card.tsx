import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import type { MySoftwarePageResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/me'
import { MySoftwarePageResponseDtoDataItemsItemStatus } from '@/shared/api/generated/contracts/me'
import { mobileColors } from '@/shared/theme/colors'

export function LiveSoftwareCard({ item }: { item: MySoftwarePageResponseDtoDataItemsItem }) {
  const { t, i18n } = useTranslation()
  const status = Object.values(MySoftwarePageResponseDtoDataItemsItemStatus).includes(item.status)
    ? t(`licenses.live.status.${item.status}`)
    : t('licenses.live.unknownStatus', { status: item.status })
  const formatDate = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`)
    return Number.isNaN(date.getTime())
      ? t('licenses.live.dateUnavailable')
      : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Feather
            accessibilityElementsHidden
            importantForAccessibility='no'
            name='box'
            size={20}
            color={mobileColors.white}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{item.application.name}</Text>
          <Text style={styles.secondary}>{t('licenses.live.plan', { plan: item.plan.name })}</Text>
        </View>
        <View
          style={[
            styles.badge,
            item.status !== 'ACTIVE' && styles.badgeNeutral,
            item.expiringSoon && styles.badgeWarning
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.status !== 'ACTIVE' && styles.neutralText,
              item.expiringSoon && styles.warningText
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.secondary}>{t('licenses.live.provisioning', { type: item.provisioningType })}</Text>
        <Text style={styles.secondary}>{t('licenses.live.start', { date: formatDate(item.effectiveFrom) })}</Text>
        {item.expectedEndDate ? (
          <Text style={styles.secondary}>{t('licenses.live.end', { date: formatDate(item.expectedEndDate) })}</Text>
        ) : null}
        {item.expiringSoon ? <Text style={styles.warningText}>{t('licenses.live.expiringSoon')}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: {
    backgroundColor: mobileColors.primary,
    borderRadius: 14,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  copy: { flex: 1, minWidth: 0 },
  name: { color: mobileColors.foreground, fontSize: 14, fontWeight: '700' },
  secondary: { color: mobileColors.muted, fontSize: 12, lineHeight: 18 },
  badge: { backgroundColor: '#e5f7ef', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, maxWidth: '36%' },
  badgeWarning: { backgroundColor: mobileColors.warningBackground },
  badgeNeutral: { backgroundColor: mobileColors.border },
  badgeText: { color: mobileColors.success, fontSize: 10, fontWeight: '600' },
  neutralText: { color: mobileColors.muted },
  warningText: { color: mobileColors.warning, fontSize: 12 },
  details: { gap: 2, paddingLeft: 54 }
})
