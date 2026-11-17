import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'

import { MyRequestsPageResponseDtoDataItemsItemType } from '@/shared/api/generated/contracts/me'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

export function LiveRequestType({ type }: { type: string }) {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t } = useTranslation()
  const known = Object.values(MyRequestsPageResponseDtoDataItemsItemType).find((value) => value === type)
  return (
    <Text style={styles.type}>
      {known ? t(`requests.live.types.${known}`) : t('requests.live.unknownType', { type })}
    </Text>
  )
}

const createStyles = (mobileColors: MobileColors) =>
  StyleSheet.create({ type: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 } })
