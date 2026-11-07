import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { demoActors } from '@/entities/actors'
import { timelineFor, type AccessRequest, type TimelineStep } from '@/entities/access-request'
import { formatDate } from '@/shared/lib/format'
import { theme } from '@/shared/ui/theme'

interface RequestTimelineProps {
  request: AccessRequest
}

export function RequestTimeline({ request }: RequestTimelineProps) {
  const { i18n, t } = useTranslation()
  const steps = timelineFor(request)

  return (
    <View style={styles.list}>
      {steps.map((step) => (
        <View key={step.id} style={styles.row}>
          <View style={[styles.marker, markerStyle(step.state)]} />
          <Text style={[styles.label, labelStyle(step.state)]}>{stepLabel(step, request, t, i18n.language)}</Text>
        </View>
      ))}
    </View>
  )
}

function stepLabel(
  step: TimelineStep,
  request: AccessRequest,
  t: ReturnType<typeof useTranslation>['t'],
  language: string
) {
  const manager = demoActors.manager.name
  const approver = demoActors.approver.name

  switch (step.id) {
    case 'submitted':
      return t('requests.timeline.submitted', { date: formatDate(request.submittedAt, language) })
    case 'need':
      if (step.state === 'rejected') return t('requests.timeline.needRejected', { name: manager })
      if (step.state === 'done') return t('requests.timeline.needDone', { name: manager })
      if (step.state === 'current') return t('requests.timeline.needCurrent', { name: manager })
      return t('requests.timeline.upcoming')
    case 'spend':
      if (step.state === 'rejected') return t('requests.timeline.spendRejected', { name: approver })
      if (step.state === 'current') return t('requests.timeline.spendCurrent', { name: approver })
      if (step.state === 'done') return t('requests.timeline.needDone', { name: approver })
      return t('requests.timeline.spendUpcoming', { name: approver })
    case 'provision':
      return t('requests.timeline.provision')
    case 'ready':
      return t('requests.timeline.ready')
  }
}

function markerStyle(state: TimelineStep['state']) {
  switch (state) {
    case 'done':
      return styles.markerDone
    case 'current':
      return styles.markerCurrent
    case 'rejected':
      return styles.markerRejected
    case 'upcoming':
      return styles.markerUpcoming
  }
}

function labelStyle(state: TimelineStep['state']) {
  switch (state) {
    case 'done':
      return styles.labelDone
    case 'current':
      return styles.labelCurrent
    case 'rejected':
      return styles.labelRejected
    case 'upcoming':
      return styles.labelUpcoming
  }
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.md
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  marker: {
    borderRadius: theme.radii.pill,
    height: 12,
    marginTop: 4,
    width: 12
  },
  markerDone: {
    backgroundColor: theme.colors.success
  },
  markerCurrent: {
    backgroundColor: theme.colors.primary
  },
  markerRejected: {
    backgroundColor: theme.colors.danger
  },
  markerUpcoming: {
    backgroundColor: theme.colors.border
  },
  label: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21
  },
  labelDone: {
    color: theme.colors.successInk
  },
  labelCurrent: {
    color: theme.colors.primaryInk
  },
  labelRejected: {
    color: theme.colors.dangerInk
  },
  labelUpcoming: {
    color: theme.colors.mutedForeground
  }
})
