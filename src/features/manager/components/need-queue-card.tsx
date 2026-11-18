import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { NeedQueueResponseDtoDataItemsItem } from '@/shared/api/generated/contracts/need-decisions'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

function formatDate(value: string, locale: string, fallback: string) {
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

export function NeedQueueCard({
  item,
  onPress
}: {
  item: NeedQueueResponseDtoDataItemsItem
  onPress: (item: NeedQueueResponseDtoDataItemsItem) => void
}) {
  const { t, i18n } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const name = item.plan?.applicationName ?? item.softwareName ?? t('requests.live.unnamed')
  const number = new Intl.NumberFormat(i18n.language)

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={t('manager.live.openNamed', { name, person: item.requester.fullName })}
      onPress={() => onPress(item)}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.requester.fullName.trim().slice(0, 1).toLocaleUpperCase()}</Text>
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.name}>{item.requester.fullName}</Text>
          <Text style={styles.muted}>{item.department.name}</Text>
        </View>
        <Feather
          accessibilityElementsHidden
          importantForAccessibility='no'
          name='chevron-right'
          size={20}
          color={colors.muted}
        />
      </View>
      <View style={styles.divider} />
      <Text style={styles.name}>{name}</Text>
      {item.type !== 'GRANT' ? <Text style={styles.muted}>{t(`requests.live.types.${item.type}`)}</Text> : null}
      {item.type === 'GROUP_GRANT' ? (
        <Text style={styles.muted}>
          {t('requests.live.lineCount', { count: item.lineCount, formattedCount: number.format(item.lineCount) })}
        </Text>
      ) : null}
      {item.plan ? <Text style={styles.muted}>{t('licenses.live.plan', { plan: item.plan.planName })}</Text> : null}
      <Text style={styles.muted}>
        {t('manager.live.due', {
          date: formatDate(item.dueOn, i18n.language, t('licenses.live.dateUnavailable'))
        })}
      </Text>
      <View style={styles.divider} />
      <View style={styles.reviewRow}>
        <Text style={styles.review}>{t('manager.live.review')}</Text>
        <Feather
          accessibilityElementsHidden
          importantForAccessibility='no'
          name='arrow-right'
          size={14}
          color={colors.primary}
        />
      </View>
    </Pressable>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      gap: 9
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center'
    },
    avatarText: { color: colors.primaryInk, fontWeight: '700' },
    headingCopy: { flex: 1, gap: 5 },
    divider: { height: 1, backgroundColor: colors.border },
    name: { color: colors.foreground, fontSize: 16, fontWeight: '700', flexShrink: 1 },
    muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    review: { color: colors.primary, fontWeight: '700', fontSize: 12 },
    reviewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }
  })
