import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'

import { MyRequestsPageResponseDtoDataItemsItemState } from '@/shared/api/generated/contracts/me'
import { mobileColors } from '@/shared/theme/colors'

export function LiveRequestStatus({ state }: { state: string }) {
  const { t } = useTranslation()
  const known = Object.values(MyRequestsPageResponseDtoDataItemsItemState).find((value) => value === state)
  return (
    <Text style={styles.status}>
      {known ? t(`requests.live.states.${known}`) : t('requests.live.unknownState', { state })}
    </Text>
  )
}

const styles = StyleSheet.create({
  status: {
    alignSelf: 'flex-start',
    color: mobileColors.primaryInk,
    backgroundColor: mobileColors.primarySoft,
    overflow: 'hidden',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700'
  }
})
