import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'

import { MyRequestsPageResponseDtoDataItemsItemState } from '@/shared/api/generated/contracts/me'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

export function LiveRequestStatus({ state }: { state: string }) {
  const { colors: mobileColors } = useMobileTheme()
  const styles = createStyles(mobileColors)
  const { t } = useTranslation()
  const known = Object.values(MyRequestsPageResponseDtoDataItemsItemState).find((value) => value === state)
  const tone =
    state === 'COMPLETED'
      ? styles.success
      : ['REJECTED', 'IT_REJECTED', 'FAILED'].includes(state)
        ? styles.danger
        : state === 'EXECUTING'
          ? styles.info
          : !known || ['WITHDRAWN', 'CANCELLED'].includes(state)
            ? styles.neutral
            : styles.warning
  return (
    <Text style={[styles.status, tone]}>
      {known ? t(`requests.live.states.${known}`) : t('requests.live.unknownState', { state })}
    </Text>
  )
}

const createStyles = (mobileColors: MobileColors) =>
  StyleSheet.create({
    status: {
      alignSelf: 'flex-start',
      overflow: 'hidden',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontSize: 12,
      fontWeight: '700'
    },
    success: { color: mobileColors.success, backgroundColor: mobileColors.successBackground },
    danger: { color: mobileColors.danger, backgroundColor: mobileColors.background },
    info: { color: mobileColors.primaryInk, backgroundColor: mobileColors.primarySoft },
    neutral: { color: mobileColors.foreground, backgroundColor: mobileColors.surfaceSubtle },
    warning: { color: mobileColors.warning, backgroundColor: mobileColors.warningBackground }
  })
