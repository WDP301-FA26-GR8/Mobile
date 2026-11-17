import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import { canWithdrawRequest, type EmployeeRequest } from '../model/employee-requests'

interface RequestCardProps {
  onOpen: (requestId: string) => void
  onWithdraw: (requestId: string) => void
  request: EmployeeRequest
}

export function RequestCard({ onOpen, onWithdraw, request }: RequestCardProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US'
  const createdAt = request.timeline.find((item) => item.event === 'created')?.at

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityLabel={t('requests.openRequest', { id: request.id, name: request.softwareName })}
        accessibilityRole='button'
        onPress={() => onOpen(request.id)}
        style={styles.main}
      >
        <Text style={styles.requestId}>
          {request.id}
          {createdAt
            ? ` · ${new Intl.DateTimeFormat(locale, {
                day: '2-digit',
                hour: '2-digit',
                hourCycle: 'h23',
                minute: '2-digit',
                month: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
              }).format(new Date(createdAt))}`
            : ''}
        </Text>
        <Text style={[styles.status, request.status === 'withdrawn' && styles.withdrawnStatus]}>
          {t(`requests.status.${request.status}`)}
          {request.durationMonths > 12 ? ` · ${t('requests.duration', { months: request.durationMonths })}` : ''}
        </Text>
        <View style={styles.softwareRow}>
          <Text style={styles.softwareName}>{request.softwareName}</Text>
          <Feather
            accessibilityElementsHidden
            color={mobileColors.muted}
            importantForAccessibility='no'
            name='chevron-right'
            size={18}
          />
        </View>
        {request.costVnd !== undefined ? (
          <Text style={styles.cost}>
            {t(request.costPeriod === 'annual' ? 'requests.annualCost' : 'requests.cost', {
              amount: new Intl.NumberFormat(locale).format(request.costVnd)
            })}
          </Text>
        ) : null}
      </Pressable>
      {canWithdrawRequest(request.status) ? (
        <Pressable
          accessibilityLabel={t('requests.withdrawNamed', { id: request.id })}
          accessibilityRole='button'
          onPress={() => onWithdraw(request.id)}
          style={styles.withdrawButton}
        >
          <Text style={styles.withdrawLabel}>{t('requests.withdraw')}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#f0e2d5',
    borderRadius: 15,
    borderWidth: 1,
    gap: 7,
    padding: 13
  },
  cost: {
    color: '#241c18',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6
  },
  main: {
    gap: 4
  },
  requestId: {
    color: '#8a786a',
    fontSize: 11
  },
  softwareName: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '700'
  },
  status: {
    color: '#a33700',
    fontSize: 12,
    fontWeight: '600'
  },
  withdrawButton: {
    alignSelf: 'flex-start',
    borderColor: '#f0bd9b',
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 11
  },
  withdrawLabel: {
    color: '#a33700',
    fontSize: 13,
    fontWeight: '600'
  },
  withdrawnStatus: {
    color: '#7c7068'
  },
  softwareRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})
