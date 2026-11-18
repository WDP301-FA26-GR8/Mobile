import { StyleSheet, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

import { apiErrorInfo } from '@/shared/api/api-error'
import { useMobileTheme } from '@/shared/theme/theme-provider'

// Shows the server request id so support can find the failed call in the logs.
export function ErrorReference({ error }: { error: unknown }) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const requestId = apiErrorInfo(error).requestId
  if (!requestId) return null
  return (
    <Text selectable style={[styles.text, { color: colors.muted }]}>
      {t('common.errorReference', { id: requestId })}
    </Text>
  )
}

const styles = StyleSheet.create({ text: { fontSize: 11 } })
