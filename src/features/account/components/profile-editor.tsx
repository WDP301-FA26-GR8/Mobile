import { Image } from 'expo-image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { apiErrorInfo } from '@/shared/api/api-error'
import { pickAvatar } from '@/shared/native/avatar-picker'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { ErrorReference } from '@/shared/ui/error-reference'

import { profileErrorKey, useProfileEdit } from '../hooks/use-profile-edit'

type Props = {
  initials: string
  avatarUrl: string | null | undefined
  workPhone: string | null | undefined
}

export function ProfileEditor({ initials, avatarUrl, workPhone }: Props) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const { workPhone: phoneMutation, putAvatar, removeAvatar } = useProfileEdit()
  const [phone, setPhone] = useState<string>()
  const [pickError, setPickError] = useState<'avatarTooLarge' | 'general'>()
  const busyAvatar = putAvatar.isPending || removeAvatar.isPending
  const value = phone ?? workPhone ?? ''
  const dirty = phone !== undefined && phone.trim() !== (workPhone ?? '')

  async function changePhoto() {
    if (busyAvatar) return
    setPickError(undefined)
    putAvatar.reset()
    removeAvatar.reset()
    try {
      const picked = await pickAvatar()
      if (picked === 'cancelled') return
      if (picked === 'too-large') {
        setPickError('avatarTooLarge')
        return
      }
      putAvatar.mutate(picked)
    } catch {
      setPickError('general')
    }
  }

  const avatarError = putAvatar.isError ? putAvatar.error : removeAvatar.isError ? removeAvatar.error : undefined
  const avatarErrorKey =
    pickError ?? (avatarError ? profileErrorKey('avatar', apiErrorInfo(avatarError).code) : undefined)

  return (
    <View style={styles.card}>
      <Text accessibilityRole='header' style={styles.title}>
        {t('account.edit.title')}
      </Text>
      <View style={styles.photoRow}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image
              accessibilityLabel={t('account.edit.photoAlt')}
              source={{ uri: avatarUrl }}
              style={styles.image}
              contentFit='cover'
            />
          ) : (
            <Text style={styles.initials}>{initials}</Text>
          )}
        </View>
        <View style={styles.photoActions}>
          <Pressable
            accessibilityRole='button'
            accessibilityState={{ disabled: busyAvatar, busy: busyAvatar }}
            disabled={busyAvatar}
            onPress={() => void changePhoto()}
            style={styles.action}
          >
            <Text style={styles.actionText}>{t('account.edit.changePhoto')}</Text>
          </Pressable>
          {avatarUrl ? (
            <Pressable
              accessibilityRole='button'
              accessibilityState={{ disabled: busyAvatar }}
              disabled={busyAvatar}
              onPress={() => {
                setPickError(undefined)
                putAvatar.reset()
                removeAvatar.mutate()
              }}
              style={styles.action}
            >
              <Text style={styles.dangerText}>{t('account.edit.removePhoto')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <Text style={styles.hint}>{t('account.edit.photoHint')}</Text>
      {avatarErrorKey ? (
        <>
          <Text accessibilityRole='alert' style={styles.error}>
            {t(`account.edit.errors.${avatarErrorKey}`)}
          </Text>
          <ErrorReference error={avatarError} />
        </>
      ) : null}
      <Text style={styles.label}>{t('account.edit.workPhone')}</Text>
      <TextInput
        accessibilityLabel={t('account.edit.workPhone')}
        autoComplete='tel'
        keyboardType='phone-pad'
        maxLength={40}
        onChangeText={(next) => {
          setPhone(next)
          phoneMutation.reset()
        }}
        placeholder={t('account.edit.workPhonePlaceholder')}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={value}
      />
      <Text style={styles.hint}>{t('account.edit.workPhoneHint')}</Text>
      {phoneMutation.isError ? (
        <>
          <Text accessibilityRole='alert' style={styles.error}>
            {t(`account.edit.errors.${profileErrorKey('phone', apiErrorInfo(phoneMutation.error).code)}`)}
          </Text>
          <ErrorReference error={phoneMutation.error} />
        </>
      ) : null}
      {phoneMutation.isSuccess && !dirty ? (
        <Text accessibilityRole='summary' style={styles.success}>
          {t('account.edit.saved')}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole='button'
        accessibilityState={{ disabled: !dirty || phoneMutation.isPending, busy: phoneMutation.isPending }}
        disabled={!dirty || phoneMutation.isPending}
        onPress={() =>
          phoneMutation.mutate(phone?.trim() ? phone.trim() : null, { onSuccess: () => setPhone(undefined) })
        }
        style={[styles.save, (!dirty || phoneMutation.isPending) && styles.disabled]}
      >
        <Text style={styles.saveText}>{t('account.edit.save')}</Text>
      </Pressable>
    </View>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 20,
      gap: 10
    },
    title: { color: colors.foreground, fontSize: 16, fontWeight: '700' },
    photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    image: { width: 72, height: 72 },
    initials: { color: colors.primaryInk, fontSize: 26, fontWeight: '700' },
    photoActions: { flex: 1, gap: 2 },
    action: { minHeight: 44, justifyContent: 'center' },
    actionText: { color: colors.primaryInk, fontWeight: '700' },
    dangerText: { color: colors.danger, fontWeight: '700' },
    label: { color: colors.muted, fontSize: 13, marginTop: 6 },
    hint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
    input: {
      minHeight: 48,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      color: colors.foreground,
      backgroundColor: colors.background
    },
    error: { color: colors.danger, fontSize: 13, lineHeight: 19 },
    success: { color: colors.success, fontSize: 13 },
    save: {
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4
    },
    saveText: { color: colors.onPrimary, fontWeight: '700' },
    disabled: { opacity: 0.5 }
  })
