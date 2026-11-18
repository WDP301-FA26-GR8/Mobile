import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { apiErrorInfo } from '@/shared/api/api-error'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'
import { ErrorReference } from '@/shared/ui/error-reference'

import { useGroupNeedDecision, useGroupNeedLines } from '../hooks/use-group-need-decision'
import { groupNeedBody, pendingNeedLines, type LineChoice } from '../model/group-need-decision.model'

type Checklist = { policyVersionId: string; step: { checklist: { code: string; text: string; check: string }[] } }

type Props = {
  requestId: string
  checklist: Checklist | undefined
  checklistLoading: boolean
  checklistError: boolean
  onReloadChecklist: () => void
  onBusyChange?: (busy: boolean) => void
  onDone?: () => void
}

export function ManagerGroupDecision({
  requestId,
  checklist,
  checklistLoading,
  checklistError,
  onReloadChecklist,
  onBusyChange,
  onDone
}: Props) {
  const { t } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const lines = useGroupNeedLines(requestId, true)
  const decision = useGroupNeedDecision()
  const [choices, setChoices] = useState<Record<string, LineChoice>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [returnAll, setReturnAll] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [answers, setAnswers] = useState<{ version: string; values: Record<string, 'YES' | 'NO'> }>()
  const [validation, setValidation] = useState(false)
  const sent = useRef(false)

  const pending = pendingNeedLines(lines.data ?? [])
  const values = answers && answers.version === checklist?.policyVersionId ? answers.values : {}
  const items = checklist?.step.checklist ?? []
  const complete = items.length > 0 && items.every((item) => item.check === 'SYSTEM' || !!values[item.code])
  const hasNo = items.some((item) => item.check === 'PERSON' && values[item.code] === 'NO')
  const locked = decision.isPending || decision.isSuccess || (sent.current && !decision.isError)
  const ready = !lines.isPending && !lines.isFetching && !lines.isError && pending.length > 0

  const built = checklist
    ? groupNeedBody({
        pending,
        choices,
        reasons,
        returnAll,
        returnReason,
        policyVersionId: checklist.policyVersionId,
        checklist: items.map((item) => ({
          code: item.code,
          answer: item.check === 'SYSTEM' ? 'YES' : values[item.code]
        }))
      })
    : undefined
  const approving = !returnAll && pending.some((line) => choices[line.employee.employeeId] === 'APPROVE')
  const blocked = !ready || !complete || !built || built.status === 'incomplete' || (approving && hasNo)

  function submit() {
    if (!checklist || !built || locked || sent.current) return
    if (built.status === 'reason') {
      setValidation(true)
      return
    }
    if (blocked) return
    if (built.status !== 'ok') return
    setValidation(false)
    sent.current = true
    onBusyChange?.(true)
    decision.mutate(
      { id: requestId, body: built.body },
      {
        onSuccess: () => {
          onBusyChange?.(false)
          onDone?.()
        },
        onError: () => {
          sent.current = false
          onBusyChange?.(false)
        }
      }
    )
  }

  const errorInfo = decision.isError ? apiErrorInfo(decision.error) : undefined

  if (decision.isSuccess) {
    return (
      <View style={styles.box}>
        <Text accessibilityRole='summary' style={styles.success}>
          {t('manager.live.group.saved')}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.box}>
      <Text accessibilityRole='header' style={styles.title}>
        {t('manager.live.group.title')}
      </Text>
      <Text style={styles.muted}>{t('manager.live.group.note')}</Text>
      {lines.isPending || lines.isFetching ? (
        <Text accessibilityRole='progressbar' style={styles.muted}>
          {t('manager.live.group.loading')}
        </Text>
      ) : null}
      {lines.isError ? (
        <>
          <Text accessibilityRole='alert' style={styles.error}>
            {t('manager.live.group.error')}
          </Text>
          <Pressable accessibilityRole='button' onPress={() => void lines.refetch()} style={styles.action}>
            <Text style={styles.link}>{t('licenses.live.retry')}</Text>
          </Pressable>
        </>
      ) : null}
      {!lines.isPending && !lines.isFetching && !lines.isError && pending.length === 0 ? (
        <Text accessibilityRole='alert' style={styles.error}>
          {t('manager.live.group.noPending')}
        </Text>
      ) : null}
      {ready
        ? pending.map((line) => {
            const id = line.employee.employeeId
            const choice = choices[id]
            return (
              <View key={id} style={styles.line}>
                <Text style={styles.name}>{line.employee.fullName}</Text>
                <Text style={styles.muted}>{line.employee.employeeCode}</Text>
                {!returnAll ? (
                  <View style={styles.row}>
                    {(['APPROVE', 'REJECT'] as const).map((value) => (
                      <Pressable
                        key={value}
                        accessibilityRole='radio'
                        accessibilityLabel={t(`manager.live.group.${value}Named`, { name: line.employee.fullName })}
                        accessibilityState={{ checked: choice === value, disabled: locked }}
                        disabled={locked}
                        onPress={() => setChoices({ ...choices, [id]: value })}
                        style={choice === value ? styles.primary : styles.outline}
                      >
                        <Text style={choice === value ? styles.primaryText : styles.link}>
                          {t(value === 'APPROVE' ? 'manager.live.approve' : 'manager.live.reject')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                {!returnAll && choice === 'REJECT' ? (
                  <TextInput
                    accessibilityLabel={t('manager.live.group.reasonNamed', { name: line.employee.fullName })}
                    editable={!locked}
                    maxLength={1000}
                    multiline
                    onChangeText={(text) => setReasons({ ...reasons, [id]: text })}
                    placeholder={t('manager.live.rejectReason')}
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={reasons[id] ?? ''}
                  />
                ) : null}
              </View>
            )
          })
        : null}
      {ready ? (
        <Pressable
          accessibilityRole='switch'
          accessibilityState={{ checked: returnAll, disabled: locked }}
          disabled={locked}
          onPress={() => setReturnAll(!returnAll)}
          style={returnAll ? styles.primary : styles.outline}
        >
          <Text style={returnAll ? styles.primaryText : styles.link}>{t('manager.live.group.returnAll')}</Text>
        </Pressable>
      ) : null}
      {returnAll ? (
        <>
          <Text style={styles.muted}>{t('manager.live.group.returnAllNote')}</Text>
          <TextInput
            accessibilityLabel={t('manager.live.rejectReason')}
            editable={!locked}
            maxLength={1000}
            multiline
            onChangeText={setReturnReason}
            placeholder={t('manager.live.rejectReason')}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={returnReason}
          />
        </>
      ) : null}
      {ready && checklistLoading ? (
        <Text accessibilityRole='progressbar' style={styles.muted}>
          {t('manager.live.checklistLoading')}
        </Text>
      ) : null}
      {ready && checklistError ? (
        <Pressable accessibilityRole='button' onPress={onReloadChecklist} style={styles.action}>
          <Text accessibilityRole='alert' style={styles.error}>
            {t('manager.live.checklistError')}
          </Text>
          <Text style={styles.link}>{t('licenses.live.retry')}</Text>
        </Pressable>
      ) : null}
      {ready
        ? items.map((item) => (
            <View key={item.code} style={styles.question}>
              <Text style={styles.label}>{item.text}</Text>
              {item.check === 'SYSTEM' ? (
                <Text style={styles.muted}>{t('manager.live.systemYes')}</Text>
              ) : (
                <View style={styles.row}>
                  {(['YES', 'NO'] as const).map((answer) => (
                    <Pressable
                      key={answer}
                      accessibilityRole='radio'
                      accessibilityState={{ checked: values[item.code] === answer, disabled: locked }}
                      disabled={locked}
                      onPress={() =>
                        checklist &&
                        setAnswers({
                          version: checklist.policyVersionId,
                          values: { ...values, [item.code]: answer }
                        })
                      }
                      style={values[item.code] === answer ? styles.primary : styles.outline}
                    >
                      <Text style={values[item.code] === answer ? styles.primaryText : styles.link}>
                        {t(answer === 'YES' ? 'manager.live.yes' : 'manager.live.no')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))
        : null}
      {approving && hasNo ? <Text style={styles.error}>{t('manager.live.noBlocksApproval')}</Text> : null}
      {validation ? (
        <Text accessibilityRole='alert' style={styles.error}>
          {t('manager.live.reasonRequired')}
        </Text>
      ) : null}
      {decision.isError ? (
        <>
          <Text accessibilityRole='alert' style={styles.error}>
            {errorInfo?.code === 'POLICY.VERSION_CHANGED'
              ? t('manager.live.policyChanged')
              : errorInfo?.status === 409 && errorInfo.code === 'ACCESS_REQUEST.STEP_NOT_PENDING'
                ? t('manager.live.stale')
                : errorInfo?.code === 'GROUP_REQUEST.LINES_MISMATCH' ||
                    errorInfo?.code === 'GROUP_REQUEST.LINE_HOLDS_ACCESS'
                  ? t('manager.live.group.mismatch')
                  : t('manager.live.uncertain')}
          </Text>
          <ErrorReference error={decision.error} />
          {errorInfo?.code === 'POLICY.VERSION_CHANGED' ? (
            <Pressable
              accessibilityRole='button'
              onPress={() => {
                setAnswers(undefined)
                onReloadChecklist()
                decision.reset()
              }}
              style={styles.action}
            >
              <Text style={styles.link}>{t('manager.live.reloadChecklist')}</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole='button'
              onPress={() => {
                decision.reset()
                void lines.refetch()
              }}
              style={styles.action}
            >
              <Text style={styles.link}>{t('manager.live.group.reload')}</Text>
            </Pressable>
          )}
        </>
      ) : null}
      <Pressable
        accessibilityRole='button'
        accessibilityState={{ disabled: blocked || locked, busy: decision.isPending }}
        disabled={blocked || locked}
        onPress={submit}
        style={[styles.primary, (blocked || locked) && styles.disabled]}
      >
        <Text style={styles.primaryText}>{t('manager.live.confirm')}</Text>
      </Pressable>
    </View>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    box: { gap: 10 },
    title: { color: colors.foreground, fontSize: 16, fontWeight: '700' },
    muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    name: { color: colors.foreground, fontSize: 15, fontWeight: '700' },
    label: { color: colors.foreground, fontSize: 13, fontWeight: '600' },
    error: { color: colors.danger, fontSize: 13, lineHeight: 19 },
    success: { color: colors.success, fontSize: 14, lineHeight: 20 },
    line: { borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 },
    question: { gap: 6 },
    row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    action: { minHeight: 44, justifyContent: 'center' },
    link: { color: colors.primaryInk, fontWeight: '700' },
    outline: {
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center'
    },
    primary: {
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    primaryText: { color: colors.onPrimary, fontWeight: '700' },
    disabled: { opacity: 0.5 },
    input: {
      minHeight: 64,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 10,
      color: colors.foreground,
      backgroundColor: colors.background,
      textAlignVertical: 'top'
    }
  })
