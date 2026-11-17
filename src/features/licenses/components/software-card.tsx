import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import type { MySoftwareItem } from '../model/my-software'

interface SoftwareCardProps {
  onPress: (softwareId: string) => void
  software: MySoftwareItem
}

export function SoftwareCard({ onPress, software }: SoftwareCardProps) {
  const { t } = useTranslation()
  const accessType = t(
    software.accessType === 'workspaceSeat' ? 'licenses.accessTypes.workspaceSeat' : 'licenses.accessTypes.licenseKey'
  )
  const status =
    software.status.type === 'active'
      ? t('licenses.status.active')
      : t('licenses.status.expiring', { days: software.status.daysRemaining })

  return (
    <Pressable
      accessibilityLabel={t('licenses.openSoftware', { name: software.name })}
      accessibilityRole='button'
      onPress={() => onPress(software.id)}
      style={styles.card}
    >
      <View style={[styles.icon, { backgroundColor: software.iconBackground }]}>
        <Text style={styles.iconLabel}>{software.shortName}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{software.name}</Text>
        <Text style={styles.accessType}>{accessType}</Text>
      </View>
      <View style={[styles.status, software.status.type === 'expiring' && styles.statusWarning]}>
        <Text style={[styles.statusLabel, software.status.type === 'expiring' && styles.statusWarningLabel]}>
          {status}
        </Text>
      </View>
      <Feather
        accessibilityElementsHidden
        color={mobileColors.muted}
        importantForAccessibility='no'
        name='chevron-right'
        size={16}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  accessType: {
    color: '#7c7068',
    fontSize: 12,
    marginTop: 4
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fefbf6',
    borderColor: '#efe3d7',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 76,
    padding: 12
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#fdf3e7',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  iconLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  name: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '700'
  },
  status: {
    backgroundColor: '#e5f7ef',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  statusLabel: {
    color: '#146b4a',
    fontSize: 10,
    fontWeight: '600'
  },
  statusWarning: {
    backgroundColor: '#fff2d6'
  },
  statusWarningLabel: {
    color: '#7a4500'
  }
})
