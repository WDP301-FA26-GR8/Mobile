import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import type { DepartmentVisibleRequest } from '../model/manager-approvals'

interface DepartmentVisibleCardProps {
  request: DepartmentVisibleRequest
}

export function DepartmentVisibleCard({ request }: DepartmentVisibleCardProps) {
  const { t } = useTranslation()

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.copy}>
          <Text style={styles.software}>{request.softwareName}</Text>
          <Text style={styles.requestId}>{request.id}</Text>
        </View>
        <Text style={styles.badge}>{t(`manager.visibility.${request.kind}.label`)}</Text>
      </View>
      <Text style={styles.note}>{t(`manager.visibility.${request.kind}.note`)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 7,
    color: mobileColors.muted,
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '600',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    textAlign: 'center'
  },
  card: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 13,
    borderWidth: 1,
    gap: 8,
    padding: 13
  },
  copy: {
    flex: 1,
    gap: 2
  },
  heading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between'
  },
  note: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  requestId: {
    color: mobileColors.muted,
    fontSize: 10
  },
  software: {
    color: mobileColors.foreground,
    fontSize: 13,
    fontWeight: '700'
  }
})
