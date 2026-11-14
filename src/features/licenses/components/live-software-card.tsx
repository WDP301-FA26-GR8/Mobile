import { Feather, FontAwesome6 } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import type { MySoftwarePageResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/me'
import { MySoftwarePageResponseDtoDataItemsItemStatus } from '@/shared/api/generated/contracts/me'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

import { getSoftwareBrand } from '../model/software-brand'

export function LiveSoftwareCard({ item }: { item: MySoftwarePageResponseDtoDataItemsItem }) {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t, i18n } = useTranslation()
  const brand = getSoftwareBrand(item.application.name)
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
        <View
          style={[styles.icon, { backgroundColor: brand?.background ?? mobileColors.primarySoft }]}
          accessibilityElementsHidden
          importantForAccessibility='no'
        >
          {brand?.icon ? (
            <FontAwesome6 name={brand.icon} brand size={24} color={brand.foreground} />
          ) : brand ? (
            <Text style={[styles.initial, { color: brand.foreground }]}>
              {item.application.name.trim().slice(0, 1).toLocaleUpperCase()}
            </Text>
          ) : (
            <Feather name='box' size={23} color={mobileColors.primaryInk} />
          )}
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{item.application.name}</Text>
          <Text style={styles.secondary}>{t('licenses.live.plan', { plan: item.plan.name })}</Text>
        </View>
      </View>
      <View style={[styles.badge, item.status !== 'ACTIVE' && styles.badgeNeutral]}>
        {item.status === 'ACTIVE' ? (
          <View accessibilityElementsHidden importantForAccessibility='no' style={styles.dot} />
        ) : null}
        <Text style={[styles.badgeText, item.status !== 'ACTIVE' && styles.neutralText]}>{status}</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Feather
            accessibilityElementsHidden
            importantForAccessibility='no'
            name='key'
            size={15}
            color={mobileColors.primaryInk}
          />
          <Text style={styles.detailText}>{t('licenses.live.provisioning', { type: item.provisioningType })}</Text>
        </View>
        <View style={styles.detailRow}>
          <Feather
            accessibilityElementsHidden
            importantForAccessibility='no'
            name='calendar'
            size={15}
            color={mobileColors.primaryInk}
          />
          <Text style={styles.detailText}>{t('licenses.live.start', { date: formatDate(item.effectiveFrom) })}</Text>
        </View>
        {item.expectedEndDate ? (
          <View style={styles.detailRow}>
            <Feather
              accessibilityElementsHidden
              importantForAccessibility='no'
              name='clock'
              size={15}
              color={mobileColors.warning}
            />
            <Text style={styles.detailText}>{t('licenses.live.end', { date: formatDate(item.expectedEndDate) })}</Text>
          </View>
        ) : null}
        {item.expiringSoon ? (
          <View style={styles.warning}>
            <Feather
              accessibilityElementsHidden
              importantForAccessibility='no'
              name='alert-circle'
              size={15}
              color={mobileColors.warning}
            />
            <Text style={styles.warningText}>{t('licenses.live.expiringSoon')}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

const createStyles = (mobileColors: MobileColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: mobileColors.surface,
      borderColor: mobileColors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 18,
      gap: 12
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    icon: {
      borderRadius: 16,
      width: 52,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center'
    },
    initial: { fontSize: 22, fontWeight: '700' },
    copy: { flex: 1, minWidth: 0 },
    name: { color: mobileColors.foreground, fontSize: 16, fontWeight: '700' },
    secondary: { color: mobileColors.muted, fontSize: 13, lineHeight: 20 },
    badge: {
      alignSelf: 'flex-start',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
      backgroundColor: mobileColors.successBackground,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6
    },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: mobileColors.successDot },
    badgeNeutral: { backgroundColor: mobileColors.surfaceSubtle },
    badgeText: { color: mobileColors.success, fontSize: 12, fontWeight: '700' },
    neutralText: { color: mobileColors.muted },
    warningText: { color: mobileColors.warning, fontSize: 12, fontWeight: '600', flexShrink: 1 },
    details: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: mobileColors.border },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    detailText: { color: mobileColors.muted, fontSize: 13, lineHeight: 20, flexShrink: 1 },
    warning: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: mobileColors.warningBackground,
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 7
    }
  })
