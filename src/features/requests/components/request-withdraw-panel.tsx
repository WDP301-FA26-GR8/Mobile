import { usePreventRemove } from '@react-navigation/native'
import { useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import { apiErrorInfo } from '@/shared/api/api-error'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { ErrorReference } from '@/shared/ui/error-reference'

import { useLiveWithdraw } from '../hooks/use-live-withdraw'
import { LiveRequestStatus } from './live-request-status'

export function RequestWithdrawPanel({ requestId }: { requestId: string }) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const withdrawal = useLiveWithdraw()
  const [confirming, setConfirming] = useState(false)
  const sent = useRef(false)
  const inFlight = withdrawal.isPending || sent.current

  usePreventRemove(inFlight, () => undefined)
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => inFlight || sent.current)
      return () => subscription.remove()
    }, [inFlight])
  )

  function withdraw() {
    if (sent.current) return
    sent.current = true
    withdrawal.mutate(requestId, {
      onSettled: () => {
        sent.current = false
        setConfirming(false)
      }
    })
  }

  return (
    <View style={styles.card}>
      {withdrawal.isError ? (
        <>
          <Text accessibilityRole='alert' style={styles.error}>
            {t(
              apiErrorInfo(withdrawal.error).code === 'ACCESS_REQUEST.WITHDRAWAL_AFTER_DECISION'
                ? 'requests.createLive.withdrawAfterDecision'
                : 'requests.createLive.withdrawError'
            )}
          </Text>
          <ErrorReference error={withdrawal.error} />
        </>
      ) : null}
      {withdrawal.isSuccess ? (
        <View accessibilityRole='summary' style={styles.result}>
          <Text style={styles.muted}>{t('requests.createLive.withdrawSuccess')}</Text>
          <Text style={styles.muted}>{t('requests.createLive.withdrawResultState')}</Text>
          <LiveRequestStatus state={withdrawal.data.state} />
        </View>
      ) : null}
      {confirming ? (
        <>
          <Text style={styles.title}>{t('requests.createLive.confirmWithdraw')}</Text>
          <Text style={styles.muted}>{t('requests.createLive.withdrawNote')}</Text>
          <Pressable
            accessibilityRole='button'
            accessibilityState={{ disabled: inFlight }}
            disabled={inFlight}
            onPress={() => setConfirming(false)}
            style={styles.action}
          >
            <Text style={styles.actionText}>{t('requests.cancel')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole='button'
            accessibilityState={{ disabled: inFlight, busy: inFlight }}
            disabled={inFlight}
            onPress={withdraw}
            style={styles.action}
          >
            <Text style={styles.danger}>{t('requests.createLive.withdrawAction')}</Text>
          </Pressable>
        </>
      ) : !withdrawal.isSuccess ? (
        <Pressable
          accessibilityRole='button'
          accessibilityState={{ disabled: inFlight }}
          disabled={inFlight}
          onPress={() => setConfirming(true)}
          style={styles.action}
        >
          <Text style={styles.danger}>{t('requests.createLive.withdraw')}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 18,
      gap: 8
    },
    title: { color: colors.foreground, fontSize: 16, fontWeight: '700' },
    result: { gap: 6 },
    muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    error: { color: colors.danger, fontSize: 13 },
    action: { minHeight: 44, justifyContent: 'center' },
    actionText: { color: colors.primaryInk, fontWeight: '700' },
    danger: { color: colors.danger, fontWeight: '700' }
  })
