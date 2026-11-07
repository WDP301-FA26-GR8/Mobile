import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text } from 'react-native'

import { findSoftware } from '@/entities/software'
import { formatDate } from '@/shared/lib/format'
import { AppButton } from '@/shared/ui/app-button'
import { Screen } from '@/shared/ui/screen'
import { ScreenHeader } from '@/shared/ui/screen-header'
import { StatusBadge } from '@/shared/ui/status-badge'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'
import { RequirePersona } from '@/features/session'

import { categoryLabel } from '../model/labels'

interface SoftwareDetailScreenProps {
  softwareId: string | null
}

export function SoftwareDetailScreen({ softwareId }: SoftwareDetailScreenProps) {
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const software = findSoftware(softwareId)
  const [revealed, setRevealed] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function copyKey() {
    if (!software?.fullKey) return
    await Clipboard.setStringAsync(software.fullKey)
    setNotice(t('software.copied'))
  }

  return (
    <RequirePersona personaId='employee'>
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            backLabel={t('common.back')}
            onBack={() => router.back()}
            title={software?.name ?? t('software.title')}
          />
          {!software ? (
            <Surface>
              <Text style={styles.body}>{t('software.missing')}</Text>
            </Surface>
          ) : (
            <Surface>
              <Text style={styles.meta}>{categoryLabel(software.category, t)}</Text>
              <Text style={styles.plan}>
                {t('software.planLabel')}: {software.plan}
              </Text>
              <StatusBadge status={software.status} />
              <Text style={styles.body}>
                {t('software.granted', { date: formatDate(software.grantedOn, i18n.language) })}
              </Text>
              <Text style={styles.body}>
                {t('software.expires', { date: formatDate(software.expiresOn, i18n.language) })}
              </Text>
              <Text style={styles.body}>{t('software.usage', { percent: software.usagePercent })}</Text>
              {software.kind === 'workspace-seat' ? (
                <>
                  <Text style={styles.label}>{t('software.emailLabel')}</Text>
                  <Text style={styles.body}>{software.email}</Text>
                  <Text style={styles.label}>{t('software.workspaceLabel')}</Text>
                  <Text style={styles.body}>{software.workspace}</Text>
                  <AppButton
                    label={t('software.openSso')}
                    onPress={() => setNotice(t('software.ssoUnavailable'))}
                    variant='primary'
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>{t('software.keyLabel')}</Text>
                  <Text style={styles.key}>{revealed ? software.fullKey : software.maskedKey}</Text>
                  <AppButton
                    label={revealed ? t('software.hideKey') : t('software.revealKey')}
                    onPress={() => setRevealed((current) => !current)}
                    variant='ghost'
                  />
                  <AppButton label={t('software.copyKey')} onPress={() => void copyKey()} variant='primary' />
                  {software.deviceName ? (
                    <Text style={styles.meta}>{t('software.deviceNote', { device: software.deviceName })}</Text>
                  ) : null}
                </>
              )}
              {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            </Surface>
          )}
        </ScrollView>
      </Screen>
    </RequirePersona>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  plan: {
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: '700'
  },
  label: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
    fontWeight: '700'
  },
  body: {
    color: theme.colors.foreground,
    fontSize: 16,
    lineHeight: 22
  },
  meta: {
    color: theme.colors.mutedForeground,
    fontSize: 14,
    lineHeight: 20
  },
  key: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radii.md,
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: '700',
    padding: theme.spacing.md
  },
  notice: {
    color: theme.colors.primaryInk,
    fontSize: 14,
    fontWeight: '700'
  }
})
