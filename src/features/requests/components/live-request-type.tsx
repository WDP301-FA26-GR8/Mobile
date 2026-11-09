import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'

import { MyRequestsPageResponseDtoDataItemsItemType } from '@/shared/api/generated/contracts/me'
import { mobileColors } from '@/shared/theme/colors'

export function LiveRequestType({ type }: { type: string }) {
  const { t } = useTranslation()
  const known = Object.values(MyRequestsPageResponseDtoDataItemsItemType).find((value) => value === type)
  return (
    <Text style={styles.type}>
      {known ? t(`requests.live.types.${known}`) : t('requests.live.unknownType', { type })}
    </Text>
  )
}

const styles = StyleSheet.create({ type: { color: mobileColors.muted, fontSize: 13, lineHeight: 19 } })
