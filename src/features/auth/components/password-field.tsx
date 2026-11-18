import { Feather } from '@expo/vector-icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

type Props = {
  label: string
  value: string
  onChangeText: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  error?: string
  editable?: boolean
}

export function PasswordField({ label, value, onChangeText, autoComplete, error, editable = true }: Props) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize='none'
          autoComplete={autoComplete}
          autoCorrect={false}
          editable={editable}
          maxLength={128}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          style={[styles.input, !!error && styles.invalid]}
          value={value}
        />
        <Pressable
          accessibilityLabel={t(visible ? 'auth.hidePassword' : 'auth.showPassword')}
          accessibilityRole='button'
          accessibilityState={{ checked: visible }}
          onPress={() => setVisible((current) => !current)}
          style={styles.eye}
        >
          <Feather
            accessibilityElementsHidden
            color={colors.muted}
            importantForAccessibility='no'
            name={visible ? 'eye-off' : 'eye'}
            size={20}
          />
        </Pressable>
      </View>
      {error ? (
        <Text accessibilityRole='alert' style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    field: { gap: 8 },
    label: { color: colors.foreground, fontSize: 13, fontWeight: '600' },
    row: { justifyContent: 'center' },
    input: {
      backgroundColor: colors.surfaceSubtle,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      color: colors.foreground,
      fontSize: 15,
      minHeight: 52,
      paddingHorizontal: 15,
      paddingRight: 52
    },
    invalid: { borderColor: colors.danger },
    eye: { alignItems: 'center', height: 52, justifyContent: 'center', position: 'absolute', right: 0, width: 48 },
    error: { color: colors.danger, fontSize: 13, lineHeight: 19 }
  })
