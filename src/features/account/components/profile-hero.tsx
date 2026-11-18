import { Feather } from '@expo/vector-icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { apiErrorInfo } from '@/shared/api/api-error'
import { pickAvatar } from '@/shared/native/avatar-picker'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { Avatar } from '@/shared/ui/avatar'
import { ErrorReference } from '@/shared/ui/error-reference'

import { profileErrorKey, useProfileEdit } from '../hooks/use-profile-edit'

type Props = {
  name: string
  jobTitle: string | null | undefined
  avatarUrl: string | null | undefined
  onAvatarError: () => void
}

export function ProfileHero({ name, jobTitle, avatarUrl, onAvatarError }: Props) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const { putAvatar, removeAvatar } = useProfileEdit()
  const [pickError, setPickError] = useState<'avatarTooLarge' | 'general'>()
  const busy = putAvatar.isPending || removeAvatar.isPending
  const mutationError = putAvatar.isError ? putAvatar.error : removeAvatar.isError ? removeAvatar.error : undefined
  const errorKey =
    pickError ?? (mutationError ? profileErrorKey('avatar', apiErrorInfo(mutationError).code) : undefined)

  async function changePhoto() {
    if (busy) return
    setPickError(undefined)
    putAvatar.reset()
    removeAvatar.reset()
    try {
      const picked = await pickAvatar()
      if (picked === 'cancelled') return
      if (picked === 'too-large') return setPickError('avatarTooLarge')
      putAvatar.mutate(picked)
    } catch {
      setPickError('general')
    }
  }

  return (
    <View style={styles.hero}>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t('account.edit.changePhoto')}
        accessibilityState={{ disabled: busy, busy }}
        disabled={busy}
        onPress={() => void changePhoto()}
        style={styles.avatarButton}
      >
        <Avatar name={name} url={avatarUrl} size={96} onImageError={onAvatarError} />
        <View style={styles.camera}>
          <Feather
            accessibilityElementsHidden
            importantForAccessibility='no'
            name='camera'
            size={14}
            color={colors.onPrimary}
          />
        </View>
      </Pressable>
      <Text accessibilityRole='header' style={styles.name}>
        {name}
      </Text>
      <Text style={styles.job}>{jobTitle || t('account.noValue')}</Text>
      {avatarUrl ? (
        <Pressable
          accessibilityRole='button'
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={() => {
            setPickError(undefined)
            putAvatar.reset()
            removeAvatar.mutate()
          }}
          style={styles.remove}
        >
          <Text style={styles.removeText}>{t('account.edit.removePhoto')}</Text>
        </Pressable>
      ) : null}
      <Text style={styles.hint}>{t('account.edit.photoHint')}</Text>
      {errorKey ? (
        <>
          <Text accessibilityRole='alert' style={styles.error}>
            {t(`account.edit.errors.${errorKey}`)}
          </Text>
          <ErrorReference error={mutationError} />
        </>
      ) : null}
    </View>
  )
}

export function WorkPhoneRow({ workPhone }: { workPhone: string | null | undefined }) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const { workPhone: mutation } = useProfileEdit()
  const [draft, setDraft] = useState<string>()
  const dirty = draft !== undefined && draft.trim() !== (workPhone ?? '')

  return (
    <View style={styles.phone}>
      <Text style={styles.label}>{t('account.edit.workPhone')}</Text>
      <TextInput
        accessibilityLabel={t('account.edit.workPhone')}
        autoComplete='tel'
        keyboardType='phone-pad'
        maxLength={40}
        onChangeText={(next) => {
          setDraft(next)
          mutation.reset()
        }}
        placeholder={t('account.edit.workPhonePlaceholder')}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={draft ?? workPhone ?? ''}
      />
      {mutation.isError ? (
        <>
          <Text accessibilityRole='alert' style={styles.error}>
            {t(`account.edit.errors.${profileErrorKey('phone', apiErrorInfo(mutation.error).code)}`)}
          </Text>
          <ErrorReference error={mutation.error} />
        </>
      ) : null}
      {mutation.isSuccess && !dirty ? (
        <Text accessibilityRole='summary' style={styles.success}>
          {t('account.edit.saved')}
        </Text>
      ) : null}
      {dirty ? (
        <Pressable
          accessibilityRole='button'
          accessibilityState={{ disabled: mutation.isPending, busy: mutation.isPending }}
          disabled={mutation.isPending}
          onPress={() => mutation.mutate(draft?.trim() ? draft.trim() : null, { onSuccess: () => setDraft(undefined) })}
          style={[styles.save, mutation.isPending && styles.disabled]}
        >
          <Text style={styles.saveText}>{t('account.edit.save')}</Text>
        </Pressable>
      ) : (
        <Text style={styles.hint}>{t('account.edit.workPhoneHint')}</Text>
      )}
    </View>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    hero: { alignItems: 'center', gap: 6, paddingVertical: 8 },
    avatarButton: { minWidth: 44, minHeight: 44 },
    camera: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center'
    },
    name: { color: colors.foreground, fontSize: 22, fontWeight: '800', marginTop: 6, textAlign: 'center' },
    job: { color: colors.muted, fontSize: 14 },
    remove: { minHeight: 44, justifyContent: 'center' },
    removeText: { color: colors.danger, fontWeight: '700' },
    hint: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
    error: { color: colors.danger, fontSize: 13, lineHeight: 19, textAlign: 'center' },
    success: { color: colors.success, fontSize: 13 },
    phone: { gap: 8, paddingTop: 14 },
    label: { color: colors.muted, fontSize: 13 },
    input: {
      minHeight: 48,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      color: colors.foreground,
      backgroundColor: colors.background
    },
    save: {
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    saveText: { color: colors.onPrimary, fontWeight: '700' },
    disabled: { opacity: 0.5 }
  })
