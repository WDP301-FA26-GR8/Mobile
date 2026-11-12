import { Feather } from '@expo/vector-icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import type { MobileColors } from '@/shared/theme/colors'
import { type ThemePreference, useMobileTheme } from '@/shared/theme/theme-provider'

const preferences: ThemePreference[] = ['system', 'light', 'dark']

export function ThemeSwitch() {
  const { t } = useTranslation()
  const { colors, dark, preference, setPreference, storageError } = useMobileTheme()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const styles = createStyles(colors)

  return (
    <>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t('common.theme.open')}
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <Feather
          accessibilityElementsHidden
          importantForAccessibility='no'
          name={dark ? 'moon' : 'sun'}
          size={19}
          color={colors.primaryInk}
        />
      </Pressable>
      <Modal transparent animationType='fade' visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View accessibilityViewIsModal style={styles.sheet}>
            <Text accessibilityRole='header' style={styles.title}>
              {t('common.theme.title')}
            </Text>
            {preferences.map((value) => (
              <Pressable
                key={value}
                accessibilityRole='radio'
                accessibilityLabel={t(`common.theme.${value}`)}
                accessibilityState={{ checked: preference === value, disabled: saving }}
                disabled={saving}
                onPress={() => {
                  setSaving(true)
                  void setPreference(value)
                    .catch(() => {
                      // The provider exposes the persistence failure in this sheet.
                    })
                    .finally(() => setSaving(false))
                }}
                style={[styles.option, preference === value && styles.selected]}
              >
                <Text style={styles.label}>{t(`common.theme.${value}`)}</Text>
                {preference === value ? (
                  <Feather
                    name='check'
                    size={20}
                    color={colors.primaryInk}
                    accessibilityElementsHidden
                    importantForAccessibility='no'
                  />
                ) : null}
              </Pressable>
            ))}
            {storageError ? (
              <Text accessibilityRole='alert' style={styles.error}>
                {t('common.theme.storageError')}
              </Text>
            ) : null}
            <Pressable accessibilityRole='button' onPress={() => setOpen(false)} style={styles.close}>
              <Text style={styles.closeText}>{t('common.theme.close')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    trigger: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface
    },
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.55)' },
    sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 8 },
    title: { color: colors.foreground, fontSize: 20, fontWeight: '700', marginBottom: 8 },
    option: {
      minHeight: 52,
      borderRadius: 14,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    selected: { backgroundColor: colors.primarySoft },
    label: { color: colors.foreground, fontSize: 15, fontWeight: '600' },
    error: { color: colors.danger, fontSize: 13 },
    close: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
    closeText: { color: colors.primaryInk, fontWeight: '700' }
  })
