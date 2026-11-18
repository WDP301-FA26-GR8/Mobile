import type { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { PreferenceSwitches } from '@/shared/ui/preference-switches'

type Props = PropsWithChildren<{ title: string; subtitle?: string; onBack?: () => void }>

export function AuthFormLayout({ title, subtitle, onBack, children }: Props) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <View style={styles.top}>
          {onBack ? (
            <Pressable accessibilityRole='button' onPress={onBack} style={styles.back}>
              <Text style={styles.backText}>{t('common.back')}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <PreferenceSwitches />
        </View>
        <Text accessibilityRole='header' style={styles.title}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.form}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  )
}

export function authFormStyles(colors: MobileColors) {
  return StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 14,
      justifyContent: 'center',
      minHeight: 52
    },
    buttonText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
    disabled: { opacity: 0.5 },
    error: { color: colors.danger, fontSize: 13, lineHeight: 19 },
    notice: { color: colors.foreground, fontSize: 14, lineHeight: 21 },
    link: { color: colors.primaryInk, fontSize: 14, fontWeight: '700', minHeight: 44, textAlignVertical: 'center' },
    input: {
      backgroundColor: colors.surfaceSubtle,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      color: colors.foreground,
      fontSize: 15,
      minHeight: 52,
      paddingHorizontal: 15
    },
    label: { color: colors.foreground, fontSize: 13, fontWeight: '600' }
  })
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    safe: { backgroundColor: colors.background, flex: 1 },
    content: { alignSelf: 'center', flexGrow: 1, maxWidth: 480, padding: 24, width: '100%' },
    top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    back: { minHeight: 44, justifyContent: 'center' },
    backText: { color: colors.foreground, fontSize: 14, fontWeight: '600' },
    title: { color: colors.foreground, fontSize: 25, fontWeight: '700', marginTop: 16 },
    subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
    form: {
      backgroundColor: colors.white,
      borderColor: colors.border,
      borderRadius: 22,
      borderWidth: 1,
      gap: 16,
      marginTop: 24,
      padding: 20
    }
  })
