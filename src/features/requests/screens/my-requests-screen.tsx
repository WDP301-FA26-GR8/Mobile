import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EmployeeProfileHeader } from '@/shared/ui/employee-profile-header'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

import { RequestCard } from '../components/request-card'
import { useRequests } from '../context/requests-context'

export function MyRequestsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { requests, withdrawRequest } = useRequests()
  const [confirmationId, setConfirmationId] = useState<string>()

  function confirmWithdrawal() {
    if (confirmationId && withdrawRequest(confirmationId)) setConfirmationId(undefined)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <EmployeeProfileHeader
            initials='VA'
            meta={`${t('licenses.employeeDepartment')} · ${t('common.demo')}`}
            name={t('licenses.employeeName')}
          />
          <Text style={styles.policyNote}>{t('requests.withdrawPolicy')}</Text>

          {confirmationId ? (
            <View accessibilityRole='alert' style={styles.confirmation}>
              <Text style={styles.confirmationTitle}>{t('requests.confirmWithdraw', { id: confirmationId })}</Text>
              <Text style={styles.confirmationCopy}>{t('requests.withdrawResult')}</Text>
              <View style={styles.confirmationActions}>
                <Pressable accessibilityRole='button' onPress={() => setConfirmationId(undefined)}>
                  <Text style={styles.secondaryLabel}>{t('requests.cancel')}</Text>
                </Pressable>
                <Pressable accessibilityRole='button' onPress={confirmWithdrawal} style={styles.confirmButton}>
                  <Text style={styles.confirmLabel}>{t('requests.confirm')}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.list}>
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                onOpen={(requestId) => router.push({ pathname: '/my-requests/[requestId]', params: { requestId } })}
                onWithdraw={setConfirmationId}
                request={request}
              />
            ))}
          </View>
        </ScrollView>
        <MobileTabBar
          accessibilityLabel={t('navigation.tabs')}
          tabs={[
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.software') }),
              icon: 'grid',
              id: 'software',
              label: t('navigation.software'),
              onPress: () => router.push('/my-software'),
              selected: false
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.createRequest') }),
              icon: 'plus-circle',
              id: 'create',
              label: t('navigation.createRequest'),
              onPress: () => router.push('/my-requests/new'),
              selected: false
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.requests') }),
              icon: 'clock',
              id: 'requests',
              label: t('navigation.requests'),
              onPress: () => router.replace('/my-requests/index'),
              selected: true
            },
            {
              accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
              icon: 'bell',
              id: 'inbox',
              label: t('navigation.inbox'),
              onPress: () => router.push('/inbox'),
              selected: false
            }
          ]}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  confirmButton: {
    backgroundColor: '#ff7020',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14
  },
  confirmation: {
    backgroundColor: '#fdf3e7',
    borderColor: '#ffb987',
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  confirmationActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'flex-end'
  },
  confirmationCopy: {
    color: '#7c7068',
    fontSize: 13,
    lineHeight: 18
  },
  confirmationTitle: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '700'
  },
  content: {
    gap: 13,
    padding: 18
  },
  confirmLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  list: {
    gap: 9
  },
  safeArea: {
    backgroundColor: '#fef7ef',
    flex: 1
  },
  screen: {
    flex: 1
  },
  policyNote: {
    backgroundColor: '#fffaf4',
    borderColor: '#f1e4d8',
    borderRadius: 12,
    borderWidth: 1,
    color: '#7c7068',
    fontSize: 12,
    lineHeight: 18,
    padding: 12
  },
  secondaryLabel: {
    color: '#a33700',
    fontSize: 13,
    fontWeight: '600'
  }
})
