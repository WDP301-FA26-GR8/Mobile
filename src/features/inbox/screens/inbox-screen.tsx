import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useRequests, type InboxNotification } from '@/entities/demo-requests'
import { EmployeeProfileHeader } from '@/shared/ui/employee-profile-header'
import { MobileTabBar } from '@/shared/ui/mobile-tab-bar'

type ApproverInboxProps = {
  onSelectTab: (tab: 'queue' | 'secondary') => void
  role: 'manager' | 'spending'
}

export function InboxScreen(props: ApproverInboxProps | { role?: 'employee' } = {}) {
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const role = props.role ?? 'employee'
  const { notifications: allNotifications, markNotificationRead } = useRequests()
  const notifications = allNotifications.filter((notification) => (notification.role ?? 'employee') === role)
  const unreadNotifications = notifications.filter((notification) => !notification.isRead)
  const readNotifications = notifications.filter((notification) => notification.isRead)
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US'

  function openNotification(notification: InboxNotification) {
    markNotificationRead(notification.id)
    if (role === 'employee' && notification.requestId) {
      router.push({ pathname: '/my-requests/[requestId]', params: { requestId: notification.requestId } })
    } else if ('onSelectTab' in props) {
      props.onSelectTab(
        notification.kind === 'otherNeedApproved' || notification.kind === 'otherRejected' ? 'secondary' : 'queue'
      )
    }
  }

  function renderNotification(notification: InboxNotification) {
    const body =
      notification.kind === 'rejected' || notification.kind === 'otherRejected'
        ? (notification.reason ??
          (notification.requestId === 'BM01-2041'
            ? t('requests.rejectionReasons.adobeBudgetOptimized')
            : t('inbox.reasonUnavailable')))
        : t(`inbox.items.${notification.kind}.body`, {
            requestId: notification.requestId,
            software: notification.softwareName
          })

    return (
      <Pressable
        accessibilityLabel={t('inbox.openNotification', { software: notification.softwareName })}
        accessibilityRole='button'
        key={notification.id}
        onPress={() => openNotification(notification)}
        style={[styles.notification, notification.isRead ? styles.readNotification : styles.unreadNotification]}
      >
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{t(`inbox.items.${notification.kind}.title`)}</Text>
          <Text style={styles.notificationDate}>
            {new Intl.DateTimeFormat(locale, {
              day: '2-digit',
              month: 'short',
              timeZone: 'Asia/Ho_Chi_Minh',
              year: 'numeric'
            }).format(new Date(notification.occurredAt))}
          </Text>
        </View>
        <Text style={styles.softwareName}>{notification.softwareName}</Text>
        <Text style={styles.body}>{body}</Text>
        {notification.requestId ? <Text style={styles.requestId}>{notification.requestId}</Text> : null}
      </Pressable>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <EmployeeProfileHeader
            initials={
              role === 'manager' ? t('manager.initials') : role === 'spending' ? t('spending.approverInitials') : 'VA'
            }
            meta={
              role === 'manager'
                ? t('manager.managerMeta')
                : role === 'spending'
                  ? t('spending.approverHeaderMeta')
                  : `${t('licenses.employeeDepartment')} · ${t('common.demo')}`
            }
            name={
              role === 'manager'
                ? t('manager.managerName')
                : role === 'spending'
                  ? t('spending.approverName')
                  : t('licenses.employeeName')
            }
            onOpenInbox={role === 'employee' ? () => router.replace('/inbox') : undefined}
          />
          <Text accessibilityRole='header' style={styles.title}>
            {t('inbox.title')}
          </Text>
          <Text style={styles.demoNote}>{t('inbox.demoNote')}</Text>

          {role !== 'employee' && notifications.length === 0 ? (
            <Text style={styles.demoNote}>{t('inbox.approverEmpty')}</Text>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('inbox.unread', { count: unreadNotifications.length })}</Text>
            {unreadNotifications.map(renderNotification)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('inbox.read')}</Text>
            {readNotifications.map(renderNotification)}
          </View>
        </ScrollView>

        <MobileTabBar
          accessibilityLabel={t('navigation.tabs')}
          tabs={
            role === 'employee'
              ? [
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
                    onPress: () => router.push('/my-requests'),
                    selected: false
                  },
                  {
                    accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
                    icon: 'bell',
                    id: 'inbox',
                    label: t('navigation.inbox'),
                    onPress: () => router.replace('/inbox'),
                    selected: true
                  }
                ]
              : [
                  {
                    accessibilityLabel: t('navigation.openTab', {
                      tab: t(role === 'manager' ? 'manager.tabs.queue' : 'spending.tabs.queue')
                    }),
                    icon: 'check-square',
                    id: 'queue',
                    label: t(role === 'manager' ? 'manager.tabs.queue' : 'spending.tabs.queue'),
                    onPress: () => {
                      if ('onSelectTab' in props) props.onSelectTab('queue')
                    },
                    selected: false
                  },
                  {
                    accessibilityLabel: t('navigation.openTab', {
                      tab: t(role === 'manager' ? 'manager.tabs.department' : 'spending.tabs.history')
                    }),
                    icon: role === 'manager' ? 'users' : 'clock',
                    id: 'secondary',
                    label: t(role === 'manager' ? 'manager.tabs.department' : 'spending.tabs.history'),
                    onPress: () => {
                      if ('onSelectTab' in props) props.onSelectTab('secondary')
                    },
                    selected: false
                  },
                  {
                    accessibilityLabel: t('navigation.openTab', { tab: t('navigation.inbox') }),
                    icon: 'bell',
                    id: 'inbox',
                    label: t('navigation.inbox'),
                    onPress: () => {},
                    selected: true
                  }
                ]
          }
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  body: {
    color: '#65584f',
    fontSize: 13,
    lineHeight: 19
  },
  content: {
    gap: 16,
    padding: 18
  },
  demoNote: {
    color: '#7c7068',
    fontSize: 12,
    lineHeight: 18
  },
  notification: {
    backgroundColor: '#ffffff',
    borderColor: '#f0e2d5',
    borderRadius: 15,
    borderWidth: 1,
    gap: 7,
    padding: 14
  },
  notificationDate: {
    color: '#8a786a',
    fontSize: 11
  },
  notificationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between'
  },
  notificationTitle: {
    color: '#a33700',
    flex: 1,
    fontSize: 14,
    fontWeight: '700'
  },
  readNotification: {
    backgroundColor: '#ffffff',
    opacity: 0.8
  },
  requestId: {
    color: '#8a786a',
    fontSize: 11,
    fontWeight: '600'
  },
  safeArea: {
    backgroundColor: '#fef7ef',
    flex: 1
  },
  screen: {
    flex: 1
  },
  section: {
    gap: 10
  },
  sectionTitle: {
    color: '#241c18',
    fontSize: 16,
    fontWeight: '700'
  },
  softwareName: {
    color: '#241c18',
    fontSize: 14,
    fontWeight: '600'
  },
  title: {
    color: '#241c18',
    fontSize: 24,
    fontWeight: '700'
  },
  unreadNotification: {
    borderColor: '#f3a372',
    backgroundColor: '#fffaf4'
  }
})
