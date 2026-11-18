import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { PreviewResponseDtoDataPreview } from '@/shared/api/generated/contracts/access-requests'
import type { MobileColors } from '@/shared/theme/colors'
import { useMobileTheme } from '@/shared/theme/theme-provider'

type Money = { amount: string; currency: string }

export function RequestPreview({
  preview,
  reason,
  isOneTime,
  onOpenAccess,
  onOpenRequest
}: {
  preview: PreviewResponseDtoDataPreview
  reason: string
  isOneTime: boolean
  onOpenAccess: (id: string) => void
  onOpenRequest: (id: string) => void
}) {
  const { t, i18n } = useTranslation()
  const { colors } = useMobileTheme()
  const styles = createStyles(colors)
  const number = (value: number) => new Intl.NumberFormat(i18n.language).format(value)
  const date = (value: string) => {
    const parsed = new Date(`${value}T00:00:00Z`)
    return Number.isNaN(parsed.getTime())
      ? t('licenses.live.dateUnavailable')
      : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeZone: 'UTC' }).format(parsed)
  }
  const money = (value: Money) => {
    const valid = /^\d+(?:\.\d{1,6})?$/.test(value.amount) && /^[A-Z]{3}$/.test(value.currency)
    const digits = value.amount.replace(/[.]/g, '').replace(/^0+/, '')
    const amount = Number(value.amount)
    if (!valid || digits.length > 15 || !Number.isFinite(amount))
      return t('requests.createLive.reviewDetails.amountUnavailable')
    const fraction = value.amount.split('.')[1]?.length ?? 0
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: value.currency,
      maximumFractionDigits: Math.max(2, fraction)
    }).format(amount)
  }
  const validId = (id: string) => /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
  const assignmentId = preview.existingAccess?.assignmentId
  const openRequestId = preview.limits.openRequestId

  return (
    <View style={styles.content}>
      <Text accessibilityRole='header' style={styles.heading}>
        {t('requests.createLive.review')}
      </Text>
      <Text style={styles.text}>
        {t('requests.createLive.selected', { app: preview.plan.applicationName, plan: preview.plan.planName })}
      </Text>
      <Text style={styles.text}>{t('requests.createLive.reviewDetails.reason', { reason })}</Text>
      {!isOneTime ? (
        <Text style={styles.text}>
          {preview.termMonths === null
            ? t('requests.createLive.reviewDetails.longTerm')
            : t('requests.live.months', { months: number(preview.termMonths) })}
        </Text>
      ) : null}
      <Text style={styles.text}>
        {t('requests.createLive.reviewDetails.limit', {
          count: number(preview.limits.openNewCount),
          max: number(preview.limits.openNewMax),
          date: date(preview.limits.resetsOn)
        })}
      </Text>
      <Text accessibilityRole='header' style={styles.heading}>
        {t('requests.createLive.reviewDetails.priceTitle')}
      </Text>
      {preview.priceSource === 'PLAN_REFERENCE' ? (
        <Text accessibilityRole='alert' style={styles.text}>
          {t('requests.createLive.reviewDetails.referencePrice')}
        </Text>
      ) : null}
      {preview.pricing.status === 'MISSING' ? (
        <Text style={styles.text}>{t('requests.createLive.reviewDetails.priceMissing')}</Text>
      ) : null}
      {preview.pricing.status === 'NOT_APPLICABLE' ? (
        <Text style={styles.text}>{t('requests.createLive.reviewDetails.priceNotApplicable')}</Text>
      ) : null}
      {preview.pricing.monthlyPrice && preview.pricing.months !== null ? (
        <Text style={styles.text}>
          {t('requests.createLive.reviewDetails.monthly', {
            amount: money(preview.pricing.monthlyPrice),
            months: number(preview.pricing.months)
          })}
        </Text>
      ) : null}
      {preview.pricing.amount ? (
        <Text style={styles.text}>
          {t('requests.createLive.reviewDetails.price', { amount: money(preview.pricing.amount) })}
        </Text>
      ) : null}
      {preview.cost ? (
        <>
          <Text style={styles.text}>
            {t('requests.createLive.reviewDetails.currentYear', {
              year: number(preview.cost.currentYear.year),
              amount: money(preview.cost.currentYear.amount)
            })}
          </Text>
          {preview.cost.currentYear.months !== null ? (
            <Text style={styles.text}>
              {t('requests.createLive.reviewDetails.costMonths', { months: number(preview.cost.currentYear.months) })}
            </Text>
          ) : null}
          {preview.cost.nextYear ? (
            <>
              <Text style={styles.text}>
                {t('requests.createLive.reviewDetails.nextYear', {
                  date: date(preview.cost.nextYear.from),
                  amount: money(preview.cost.nextYear.amount)
                })}
              </Text>
              {preview.cost.nextYear.months !== null ? (
                <Text style={styles.text}>
                  {t('requests.createLive.reviewDetails.nextCostMonths', {
                    months: number(preview.cost.nextYear.months)
                  })}
                </Text>
              ) : null}
            </>
          ) : null}
          {preview.cost.termCutAt ? (
            <Text style={styles.text}>
              {t('requests.createLive.reviewDetails.termCut', { date: date(preview.cost.termCutAt) })}
            </Text>
          ) : null}
        </>
      ) : null}
      {preview.costEstimate ? (
        <>
          {preview.costEstimate.label === 'ESTIMATE_NO_PROFILE' ? (
            <Text style={styles.text}>{t('requests.createLive.reviewDetails.noTaxProfile')}</Text>
          ) : null}
          <Text style={styles.text}>
            {t('requests.createLive.reviewDetails.totalEstimate', { amount: money(preview.costEstimate.totalPayable) })}
          </Text>
          <Text style={styles.text}>
            {t('requests.createLive.reviewDetails.taxEstimate', {
              amount: money(preview.costEstimate.nonDeductibleTax)
            })}
          </Text>
        </>
      ) : null}
      {preview.annualVendorAmount ? (
        <Text style={styles.text}>
          {t('requests.createLive.reviewDetails.annualVendor', { amount: money(preview.annualVendorAmount) })}
        </Text>
      ) : null}
      <Text accessibilityRole='header' style={styles.heading}>
        {t('requests.createLive.reviewDetails.chainTitle')}
      </Text>
      {preview.chain.map((step) => (
        <View key={step.sequence} style={styles.step}>
          <Text style={styles.text}>{t(`requests.createLive.reviewDetails.kinds.${step.kind}`)}</Text>
          <Text style={styles.text}>{t(`requests.createLive.reviewDetails.roles.${step.role}`)}</Text>
          {step.assignee ? (
            <Text style={styles.text}>
              {t('requests.createLive.reviewDetails.assignee', { name: step.assignee.fullName })}
            </Text>
          ) : null}
          <Text style={styles.text}>
            {t('requests.createLive.expectedDays', { days: number(step.expectedWorkingDays) })}
          </Text>
          {step.explanation ? (
            <Text style={styles.text}>{t(`requests.createLive.reviewDetails.explanations.${step.explanation}`)}</Text>
          ) : null}
          {step.waitingReason ? (
            <Text style={styles.text}>{t(`requests.createLive.reviewDetails.waiting.${step.waitingReason}`)}</Text>
          ) : null}
        </View>
      ))}
      <Text style={styles.text}>
        {t('requests.createLive.expectedDays', { days: number(preview.totalExpectedWorkingDays) })}
      </Text>
      {assignmentId && validId(assignmentId) ? (
        <Pressable accessibilityRole='button' onPress={() => onOpenAccess(assignmentId)} style={styles.action}>
          <Text style={styles.link}>{t('requests.createLive.reviewDetails.openAccess')}</Text>
        </Pressable>
      ) : null}
      {preview.limits.refusal === 'HAS_OPEN_REQUEST' && openRequestId && validId(openRequestId) ? (
        <Pressable accessibilityRole='button' onPress={() => onOpenRequest(openRequestId)} style={styles.action}>
          <Text style={styles.link}>{t('requests.createLive.reviewDetails.openRequest')}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const createStyles = (colors: MobileColors) =>
  StyleSheet.create({
    content: { gap: 8 },
    heading: { color: colors.foreground, fontSize: 15, fontWeight: '700', marginTop: 6 },
    text: { color: colors.foreground, fontSize: 13, lineHeight: 20 },
    step: { borderLeftWidth: 2, borderLeftColor: colors.primary, paddingLeft: 12, gap: 3 },
    action: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    link: { color: colors.primaryInk, fontWeight: '700' }
  })
