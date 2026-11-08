import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { demoActors, type PersonaId } from '@/entities/actors'
import { homeHref, useSession } from '@/features/session'
import { AppButton } from '@/shared/ui/app-button'
import { LanguageSwitch } from '@/shared/ui/language-switch'
import { Screen } from '@/shared/ui/screen'
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
        <View style={styles.hero}>
          <View style={styles.mark}>
            <Text style={styles.markText}>{t('auth.mark')}</Text>
          </View>
          <Text accessibilityRole='header' style={styles.title}>
            {t('auth.title')}
          </Text>
          <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('auth.emailLabel')}</Text>
          <Text style={styles.fieldValue}>{selected.email}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('auth.passwordLabel')}</Text>
          <Text style={styles.fieldValue}>{t('auth.passwordMask')}</Text>
        </View>
        <Text style={styles.note}>{t('auth.scopeNote')}</Text>
        <LanguageSwitch />
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
                style={[styles.persona, selectedPersona && styles.personaSelected]}
              >
                <Text style={styles.personaName}>{actor.name}</Text>
                <Text style={styles.personaMeta}>{roleLabel(personaId)}</Text>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 24
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12
  },
  mark: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: 56
  },
  markText: {
    color: theme.colors.primaryForeground,
    fontSize: 18,
    fontWeight: '700'
  },
  title: {
    color: theme.colors.foreground,
    fontSize: 22,
    fontWeight: '700'
  },
  subtitle: {
    color: theme.colors.mutedForeground,
    fontSize: 13,
    textAlign: 'center'
  },
  field: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 14
  },
  fieldLabel: {
    color: theme.colors.mutedForeground,
    fontSize: 11
  },
  fieldValue: {
    color: theme.colors.foreground,
    fontSize: 14,
    fontWeight: '500'
  },
  note: {
    color: theme.colors.mutedForeground,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center'
  },
  personas: {
    flexDirection: 'row',
    gap: 8
  },
  persona: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    flex: 1,
    gap: 2,
    padding: 10
  },
  personaSelected: {
    backgroundColor: theme.colors.primarySoft
  },
  personaName: {
    color: theme.colors.foreground,
    fontSize: 12,
    fontWeight: '700'
  },
  personaMeta: {
    color: theme.colors.mutedForeground,
    fontSize: 10
  }
})
