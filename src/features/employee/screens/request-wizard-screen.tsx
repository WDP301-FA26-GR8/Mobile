import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native'

import { catalogForWizard, type CatalogItem } from '@/entities/software'
import { demoActors } from '@/entities/actors'
import type { TermMonths } from '@/entities/access-request'
import { formatVnd } from '@/shared/lib/format'
import { AppButton } from '@/shared/ui/app-button'
import { FilterChip } from '@/shared/ui/filter-chip'
import { Screen } from '@/shared/ui/screen'
import { ScreenHeader } from '@/shared/ui/screen-header'
import { Surface } from '@/shared/ui/surface'
import { theme } from '@/shared/ui/theme'
import { RequirePersona, useSession } from '@/features/session'

import { CatalogCard } from '../components/catalog-card'

const terms: TermMonths[] = [3, 6, 12]

type WizardStep = 'catalog' | 'details' | 'review' | 'blocked'

export function RequestWizardScreen() {
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const { submitRequest } = useSession()
  const [step, setStep] = useState<WizardStep>('catalog')
  const [selected, setSelected] = useState<CatalogItem | null>(null)
  const [termMonths, setTermMonths] = useState<TermMonths>(12)
  const [reason, setReason] = useState('')

  function choose(item: CatalogItem) {
    setSelected(item)
    setStep(item.ownedSoftwareId ? 'blocked' : 'details')
  }

  function submit() {
    if (!selected) return
    const created = submitRequest({
      catalogId: selected.id,
      costVnd: selected.estimatedCostVnd,
      reasonText: reason.trim(),
      softwareName: selected.name,
      termMonths
    })
    router.replace({ pathname: '/requests/[id]', params: { id: created.id } })
  }

  const stepNumber = step === 'details' ? 2 : step === 'review' ? 3 : 1
  const title =
    step === 'details'
      ? t('requests.wizard.detailsTitle')
      : step === 'review'
        ? t('requests.wizard.reviewTitle')
        : step === 'blocked'
          ? t('requests.wizard.blockedTitle')
          : t('requests.wizard.catalogTitle')

  return (
    <RequirePersona personaId='employee'>
      <Screen
        footer={
          step === 'details' ? (
            <AppButton
              disabled={reason.trim().length === 0}
              fullWidth
              label={t('common.continue')}
              onPress={() => setStep('review')}
            />
          ) : step === 'review' ? (
            <AppButton fullWidth label={t('requests.wizard.submit')} onPress={submit} />
          ) : step === 'blocked' && selected?.ownedSoftwareId ? (
            <AppButton
              fullWidth
              label={t('requests.wizard.viewSoftware')}
              onPress={() =>
                router.push({ pathname: '/software/[id]', params: { id: selected.ownedSoftwareId ?? '' } })
              }
            />
          ) : null
        }
      >
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            backLabel={t('common.back')}
            onBack={() => {
              if (step === 'catalog') router.back()
              else if (step === 'details') setStep('catalog')
              else setStep(step === 'review' ? 'details' : 'catalog')
            }}
            title={title}
          />
          <Text style={styles.step}>{t('requests.wizard.step', { current: stepNumber, total: 3 })}</Text>
          {step === 'catalog'
            ? catalogForWizard().map((item) => (
                <CatalogCard
                  accessibilityLabel={t('requests.wizard.chooseSoftware', { name: item.name })}
                  availabilityLabel={t(item.availability === 'in-stock' ? 'status.inStock' : 'status.purchase')}
                  costLabel={
                    item.estimatedCostVnd === 0
                      ? t('requests.costFree')
                      : t('requests.cost', { amount: formatVnd(item.estimatedCostVnd, i18n.language) })
                  }
                  item={item}
                  key={item.id}
                  onPress={() => choose(item)}
                  standardLabel={t('requests.wizard.standardBadge')}
                />
              ))
            : null}
          {step === 'blocked' && selected ? (
            <Surface>
              <Text style={styles.body}>{t('requests.wizard.blockedBody', { name: selected.name })}</Text>
            </Surface>
          ) : null}
          {step === 'details' && selected ? (
            <>
              <Surface>
                <Text style={styles.name}>{selected.name}</Text>
                {!selected.standardToolset ? (
                  <Text style={styles.warning}>{t('requests.wizard.outsideStandard')}</Text>
                ) : null}
              </Surface>
              <Text style={styles.label}>{t('requests.wizard.termLabel')}</Text>
              <ScrollView horizontal contentContainerStyle={styles.terms} showsHorizontalScrollIndicator={false}>
                {terms.map((term) => (
                  <FilterChip
                    key={term}
                    label={t('requests.wizard.termMonths', { count: term })}
                    onPress={() => setTermMonths(term)}
                    selected={termMonths === term}
                  />
                ))}
              </ScrollView>
              <Text style={styles.label}>{t('requests.wizard.reasonLabel')}</Text>
              <TextInput
                accessibilityLabel={t('requests.wizard.reasonLabel')}
                multiline
                onChangeText={setReason}
                placeholder={t('requests.wizard.reasonPlaceholder')}
                placeholderTextColor={theme.colors.mutedForeground}
                style={styles.input}
                value={reason}
              />
            </>
          ) : null}
          {step === 'review' && selected ? (
            <Surface>
              <Text style={styles.name}>{selected.name}</Text>
              <Text style={styles.body}>{t('requests.wizard.termMonths', { count: termMonths })}</Text>
              <Text style={styles.body}>{reason.trim()}</Text>
              <Text style={styles.body}>
                {selected.estimatedCostVnd === 0
                  ? t('requests.costFree')
                  : t('requests.cost', { amount: formatVnd(selected.estimatedCostVnd, i18n.language) })}
              </Text>
              <Text style={styles.body}>
                {selected.estimatedCostVnd > 0
                  ? t('requests.wizard.routeWithSpend', {
                      approver: demoActors.approver.name,
                      manager: demoActors.manager.name
                    })
                  : t('requests.wizard.routeWithoutSpend', { manager: demoActors.manager.name })}
              </Text>
              <Text style={styles.body}>{t('requests.wizard.sla')}</Text>
            </Surface>
          ) : null}
        </ScrollView>
      </Screen>
    </RequirePersona>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  step: {
    color: theme.colors.mutedForeground,
    fontSize: 13,
    fontWeight: '700'
  },
  name: {
    color: theme.colors.foreground,
    fontSize: 18,
    fontWeight: '700'
  },
  label: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
    fontWeight: '700'
  },
  body: {
    color: theme.colors.foreground,
    fontSize: 16,
    lineHeight: 22
  },
  warning: {
    color: theme.colors.warningInk,
    fontSize: 14,
    lineHeight: 20
  },
  terms: {
    gap: theme.spacing.sm
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 16,
    minHeight: 96,
    padding: theme.spacing.md,
    textAlignVertical: 'top'
  }
})
