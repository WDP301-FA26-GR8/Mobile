import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text } from 'react-native'

import { findRequest } from '@/entities/access-request'
import { demoActors } from '@/entities/actors'
import { AppButton } from '@/shared/ui/app-button'
import { Screen } from '@/shared/ui/screen'
import { ScreenHeader } from '@/shared/ui/screen-header'
import { StatusBadge } from '@/shared/ui/status-badge'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'
import { RequirePersona, useSession } from '@/features/session'

import { RequestTimeline } from '../components/request-timeline'
import { rejectionReason, requestReason } from '../model/labels'

interface RequestDetailScreenProps {
  requestId: string | null
}

export function RequestDetailScreen({ requestId }: RequestDetailScreenProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { requests, withdrawRequest } = useSession()
  const request = findRequest(requests, requestId)

  return (
    <RequirePersona personaId='employee'>
      <Screen
        footer={
          request?.status === 'pending' ? (
            <AppButton
              fullWidth
              label={t('requests.withdraw')}
              onPress={() => withdrawRequest(request.id)}
              variant='danger'
            />
          ) : request?.status === 'rejected' ? (
            <AppButton fullWidth label={t('requests.createAnother')} onPress={() => router.push('/requests/new')} />
          ) : null
        }
      >
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            backLabel={t('common.back')}
            onBack={() => router.back()}
            title={request?.softwareName ?? t('requests.title')}
          />
          {!request ? (
            <Surface>
              <Text style={styles.body}>{t('requests.missing')}</Text>
            </Surface>
          ) : (
            <>
              <Surface>
                <StatusBadge status={request.status} />
                <Text style={styles.label}>{t('requests.reasonLabel')}</Text>
                <Text style={styles.body}>{requestReason(request, t)}</Text>
                <RequestTimeline request={request} />
              </Surface>
              {request.status === 'rejected' ? (
                <Surface>
                  <Text style={styles.dangerTitle}>{t('requests.rejectionTitle')}</Text>
                  <Text style={styles.body}>
                    {request.rejectedBy === 'approver'
                      ? t('requests.rejectedByApprover', { name: demoActors.approver.name })
                      : t('requests.rejectedByManager', { name: demoActors.manager.name })}
                  </Text>
                  <Text style={styles.body}>{rejectionReason(request, t)}</Text>
                </Surface>
              ) : null}
              {request.status === 'withdrawn' ? (
                <Surface>
                  <Text style={styles.body}>{t('requests.withdrawnNote')}</Text>
                </Surface>
              ) : null}
            </>
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
  dangerTitle: {
    color: theme.colors.dangerInk,
    fontSize: 18,
    fontWeight: '700'
  }
})
