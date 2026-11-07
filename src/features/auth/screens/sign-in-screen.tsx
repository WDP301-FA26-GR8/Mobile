import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { demoActors, type PersonaId } from '@/entities/actors'
import { homeHref, useSession } from '@/features/session'
import { LanguageSwitch } from '@/shared/ui/language-switch'
import { AppButton } from '@/shared/ui/app-button'
import { Screen } from '@/shared/ui/screen'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'

const personaIds: PersonaId[] = ['employee', 'manager', 'approver']

export function SignInScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { signIn } = useSession()
  const [selectedId, setSelectedId] = useState<PersonaId>('employee')
  const selected = demoActors[selectedId]

  function roleLabel(personaId: PersonaId) {
    switch (personaId) {
      case 'approver':
        return t('auth.roles.approver')
      case 'employee':
        return t('auth.roles.employee')
      case 'manager':
        return t('auth.roles.manager')
    }
  }

  return (
    <Screen
      footer={
        <AppButton
          fullWidth
          label={t('auth.submit')}
          onPress={() => {
            signIn(selectedId)
            router.replace(homeHref(selectedId))
          }}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        <LanguageSwitch />
        <Text style={styles.brand}>{t('common.brand')}</Text>
        <Text accessibilityRole='header' style={styles.title}>
          {t('auth.title')}
        </Text>
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
        <View style={styles.personas}>
          {personaIds.map((personaId) => {
            const actor = demoActors[personaId]
            const selectedPersona = personaId === selectedId
            return (
              <Pressable
                accessibilityRole='button'
                accessibilityState={{ selected: selectedPersona }}
                key={personaId}
                onPress={() => setSelectedId(personaId)}
              >
                <Surface>
                  <Text style={styles.name}>{actor.name}</Text>
                  <Text style={styles.meta}>{roleLabel(personaId)}</Text>
                  <Text style={styles.meta}>{actor.department}</Text>
                </Surface>
              </Pressable>
            )
          })}
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('auth.emailLabel')}</Text>
          <Text style={styles.fieldValue}>{selected.email}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('auth.passwordLabel')}</Text>
          <Text style={styles.fieldValue}>{t('auth.passwordMask')}</Text>
        </View>
        <Text style={styles.note}>{t('auth.forgotPassword')}</Text>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  brand: {
    color: theme.colors.primaryInk,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1
  },
  title: {
    color: theme.colors.foreground,
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    color: theme.colors.mutedForeground,
    fontSize: 16
  },
  personas: {
    gap: theme.spacing.sm
  },
  name: {
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: '700'
  },
  meta: {
    color: theme.colors.mutedForeground,
    fontSize: 14
  },
  field: {
    gap: theme.spacing.xs
  },
  fieldLabel: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
    fontWeight: '700'
  },
  fieldValue: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 16,
    padding: theme.spacing.md
  },
  note: {
    color: theme.colors.mutedForeground,
    fontSize: 13,
    lineHeight: 18
  }
})
