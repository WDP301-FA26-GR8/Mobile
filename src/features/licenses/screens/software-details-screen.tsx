import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { goBackOr } from '@/shared/lib/go-back-or'

import type { MySoftwareItem } from '../model/my-software'

interface SoftwareDetailsScreenProps {
  software: MySoftwareItem
}

export function SoftwareDetailsScreen({ software }: SoftwareDetailsScreenProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const accessType = t(
    software.accessType === 'workspaceSeat' ? 'licenses.accessTypes.workspaceSeat' : 'licenses.accessTypes.licenseKey'
  )
  const status =
    software.status.type === 'active'
      ? t('licenses.status.active')
      : t('licenses.status.expiring', { days: software.status.daysRemaining })

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole='button'
          onPress={() => goBackOr(router, '/my-software')}
          style={styles.backButton}
        >
          <Text style={styles.backLabel}>{t('licenses.back')}</Text>
        </Pressable>

        <View style={styles.heading}>
          <View style={[styles.icon, { backgroundColor: software.iconBackground }]}>
            <Text style={styles.iconLabel}>{software.shortName}</Text>
          </View>
          <Text accessibilityRole='header' style={styles.title}>
            {software.name}
          </Text>
          <Text style={styles.accessType}>{accessType}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>{t('licenses.detail.account')}</Text>
          <Text style={styles.fieldLabel}>{t('licenses.detail.status')}</Text>
          <Text style={styles.fieldValue}>{status}</Text>

          {software.accessType === 'workspaceSeat' ? (
            <>
              <Text style={styles.fieldLabel}>{t('licenses.detail.email')}</Text>
              <Text style={styles.fieldValue}>{software.corporateEmail}</Text>
              <Text style={styles.fieldLabel}>{t('licenses.detail.workspace')}</Text>
              <Text style={styles.fieldValue}>{software.workspaceName}</Text>
              <Text style={styles.note}>{t('licenses.detail.noPassword')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>{t('licenses.detail.key')}</Text>
              <Text accessibilityLabel={t('licenses.detail.keyMasked')} style={styles.maskedKey}>
                {software.maskedKey}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  accessType: {
    color: '#7c7068',
    fontSize: 13,
    marginTop: 5
  },
  backButton: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 44
  },
  backLabel: {
    color: '#a33700',
    fontSize: 14,
    fontWeight: '600'
  },
  content: {
    gap: 20,
    padding: 20
  },
  detailCard: {
    backgroundColor: '#fefbf6',
    borderColor: '#efe3d7',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 16
  },
  fieldLabel: {
    color: '#7c7068',
    fontSize: 12,
    marginTop: 5
  },
  fieldValue: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '600'
  },
  heading: {
    alignItems: 'center',
    paddingVertical: 8
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#fdf3e7',
    borderRadius: 18,
    height: 56,
    justifyContent: 'center',
    marginBottom: 12,
    width: 56
  },
  iconLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  maskedKey: {
    backgroundColor: '#fdf3e7',
    borderRadius: 12,
    color: '#241c18',
    fontSize: 16,
    fontWeight: '700',
    overflow: 'hidden',
    padding: 14
  },
  note: {
    color: '#7c7068',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  },
  safeArea: {
    backgroundColor: '#fef7ef',
    flex: 1
  },
  sectionTitle: {
    color: '#241c18',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2
  },
  title: {
    color: '#241c18',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center'
  }
})
