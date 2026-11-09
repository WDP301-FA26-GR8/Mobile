import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import type { ManagerApproval } from '../model/manager-approvals'

interface ManagerApprovalCardProps {
  onPress: (request: ManagerApproval) => void
  request: ManagerApproval
}

export function ManagerApprovalCard({ onPress, request }: ManagerApprovalCardProps) {
  const { t } = useTranslation()
  const slaCopy =
    request.slaHoursRemaining === undefined
      ? t('manager.slaUnavailable')
      : request.slaHoursRemaining >= 24
        ? t('manager.slaRemainingDays', {
            days: Math.floor(request.slaHoursRemaining / 24),
            hours: request.slaHoursRemaining % 24
          })
        : t('manager.slaRemainingHours', { hours: request.slaHoursRemaining })

  return (
    <Pressable
      accessibilityLabel={t('manager.openRequest', { id: request.id, software: request.softwareName })}
      accessibilityRole='button'
      onPress={() => onPress(request)}
      style={styles.card}
    >
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {request.requesterName
              .split(' ')
              .slice(-2)
              .map((part) => part[0])
              .join('')}
          </Text>
        </View>
        <View style={styles.identity}>
          <Text style={styles.requester}>{request.requesterName}</Text>
          <Text style={styles.requesterRole}>{request.requesterRole}</Text>
        </View>
        <Feather
          accessibilityElementsHidden
          color={mobileColors.muted}
          importantForAccessibility='no'
          name='chevron-right'
          size={18}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.softwareRow}>
        <View style={styles.softwareIcon}>
          <Text style={styles.softwareInitial}>{request.softwareName[0]}</Text>
        </View>
        <View style={styles.softwareInfo}>
          <Text style={styles.softwareName}>{request.softwareName}</Text>
          <Text style={styles.requestId}>{request.id}</Text>
        </View>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, request.isStandard === false ? styles.warningBadge : styles.standardBadge]}>
          <Text style={[styles.badgeText, request.isStandard === false ? styles.warningText : styles.standardText]}>
            {t(
              request.isStandard === undefined
                ? 'manager.standardUnknown'
                : request.isStandard
                  ? 'manager.standardTool'
                  : 'manager.outsideStandard'
            )}
          </Text>
        </View>
        {request.durationMonths > 12 ? (
          <View style={[styles.badge, styles.longTermBadge]}>
            <Text style={[styles.badgeText, styles.longTermText]}>{t('manager.longTermFlag')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.duration}>{t('manager.duration', { months: request.durationMonths })}</Text>
        <Text style={styles.sla}>{slaCopy}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  avatarText: {
    color: mobileColors.primaryInk,
    fontSize: 12,
    fontWeight: '700'
  },
  badge: {
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  badgeText: {
    color: mobileColors.muted,
    fontSize: 10,
    fontWeight: '600'
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  card: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 17,
    borderWidth: 1,
    gap: 12,
    padding: 14,
    boxShadow: '0px 3px 7px rgba(93, 59, 32, 0.035)'
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  divider: {
    backgroundColor: mobileColors.border,
    height: 1
  },
  duration: {
    color: mobileColors.foreground,
    fontSize: 11,
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  identity: {
    flex: 1,
    gap: 2
  },
  longTermBadge: {
    backgroundColor: '#fff0e3'
  },
  longTermText: {
    color: mobileColors.primaryInk
  },
  requestId: {
    color: mobileColors.muted,
    fontSize: 11,
    marginTop: 2
  },
  requester: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  requesterRole: {
    color: mobileColors.muted,
    fontSize: 11
  },
  sla: {
    backgroundColor: mobileColors.warningBackground,
    borderRadius: 9,
    color: mobileColors.warning,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  softwareIcon: {
    alignItems: 'center',
    backgroundColor: mobileColors.primarySoft,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38
  },
  softwareInfo: {
    flex: 1
  },
  softwareInitial: {
    color: mobileColors.primaryInk,
    fontSize: 14,
    fontWeight: '700'
  },
  softwareName: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  softwareRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  warningBadge: {
    backgroundColor: mobileColors.warningBackground
  },
  warningText: {
    color: mobileColors.warning
  },
  standardBadge: {
    backgroundColor: '#e5f7ed'
  },
  standardText: {
    color: mobileColors.success
  }
})
