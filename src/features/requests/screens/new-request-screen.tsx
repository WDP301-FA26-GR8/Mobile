import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { goBackOr } from '@/shared/lib/go-back-or'
import { mobileColors } from '@/shared/theme/colors'

import { RequestCatalogSection, type RequestCatalogFilter } from '../components/request-catalog-section'
import { RequestDetailsSection, type RequestFormError } from '../components/request-details-section'
import { RequestReviewSection } from '../components/request-review-section'
import { RequestWizardFooter } from '../components/request-wizard-footer'
import { RequestWizardProgress } from '../components/request-wizard-progress'
import { useRequests } from '../context/requests-context'
import { catalogSoftware, type CatalogSoftware } from '../model/employee-requests'

type FormStep = 'catalog' | 'details' | 'review'

const stepCopy = {
  catalog: {
    subtitle: 'requests.catalogSubtitle',
    title: 'requests.newTitle'
  },
  details: {
    subtitle: 'requests.detailsSubtitle',
    title: 'requests.detailsTitle'
  },
  review: {
    subtitle: 'requests.reviewSubtitle',
    title: 'requests.reviewTitle'
  }
} as const

export function NewRequestScreen() {
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const { createRequest } = useRequests()
  const [selectedTool, setSelectedTool] = useState<CatalogSoftware>()
  const [durationMonths, setDurationMonths] = useState<12 | 18>(12)
  const [reason, setReason] = useState('')
  const [step, setStep] = useState<FormStep>('catalog')
  const [error, setError] = useState<RequestFormError>()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<RequestCatalogFilter>('all')

  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US'
  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale)

    return catalogSoftware.filter((software) => {
      const matchesSearch = !query || software.name.toLocaleLowerCase(locale).includes(query)
      const matchesFilter = filter === 'all' || (filter === 'standard' ? software.isStandard : !software.isStandard)

      return matchesSearch && matchesFilter
    })
  }, [filter, locale, search])

  const currentStep = step === 'catalog' ? 1 : step === 'details' ? 2 : 3
  const progressLabels = [t('requests.steps.catalog'), t('requests.steps.details'), t('requests.steps.review')] as const

  function chooseTool(tool: CatalogSoftware) {
    if (selectedTool?.id !== tool.id) {
      setDurationMonths(tool.defaultDurationMonths)
      setReason('')
    }

    setSelectedTool(tool)
  }

  function goBack() {
    if (step === 'review') {
      setStep('details')
    } else if (step === 'details') {
      setStep('catalog')
    } else {
      goBackOr(router, '/my-requests')
    }
  }

  function continueToDetails() {
    if (selectedTool) setStep('details')
  }

  function continueToReview() {
    if (selectedTool && !selectedTool.isStandard && !reason.trim()) {
      setError('reasonRequired')
      return
    }

    setError(undefined)
    setStep('review')
  }

  function submitRequest() {
    if (!selectedTool) return

    const request = createRequest({
      durationMonths,
      reason: reason.trim(),
      softwareId: selectedTool.id,
      softwareName: selectedTool.name
    })
    router.replace({ pathname: '/my-requests/[requestId]', params: { requestId: request.id } })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
          <View style={styles.header}>
            <Text style={styles.kicker}>{t('requests.kicker')}</Text>
            <Text accessibilityRole='header' style={styles.title}>
              {t(stepCopy[step].title)}
            </Text>
            <Text style={styles.subtitle}>{t(stepCopy[step].subtitle)}</Text>
            <Text style={styles.demoNote}>{t('requests.demoData')}</Text>
          </View>

          <RequestWizardProgress
            accessibilityLabel={t('requests.progress', { current: currentStep, total: progressLabels.length })}
            currentStep={currentStep}
            labels={progressLabels}
          />

          {step === 'catalog' ? (
            <RequestCatalogSection
              filter={filter}
              onFilterChange={setFilter}
              onSearchChange={setSearch}
              onSelectTool={chooseTool}
              search={search}
              selectedToolId={selectedTool?.id}
              software={filteredCatalog}
              totalCount={catalogSoftware.length}
            />
          ) : null}

          {step === 'details' && selectedTool ? (
            <RequestDetailsSection
              durationMonths={durationMonths}
              error={error}
              onChangeDuration={(duration) => {
                setDurationMonths(duration)
                setError(undefined)
              }}
              onChangeReason={(value) => {
                setReason(value)
                setError(undefined)
              }}
              onChangeTool={() => setStep('catalog')}
              reason={reason}
              software={selectedTool}
            />
          ) : null}

          {step === 'review' && selectedTool ? (
            <RequestReviewSection durationMonths={durationMonths} reason={reason} software={selectedTool} />
          ) : null}
        </ScrollView>

        <RequestWizardFooter
          backLabel={t('requests.back')}
          onBack={goBack}
          onPrimary={step === 'catalog' ? continueToDetails : step === 'details' ? continueToReview : submitRequest}
          primaryAccessibilityLabel={t(
            step === 'catalog' ? 'requests.continue' : step === 'details' ? 'requests.review' : 'requests.submit'
          )}
          primaryDisabled={step === 'catalog' && !selectedTool}
          primaryIcon={step === 'review' ? 'check' : 'arrow-right'}
          primaryLabel={t(
            step === 'catalog' ? 'requests.continue' : step === 'details' ? 'requests.review' : 'requests.submit'
          )}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 24
  },
  demoNote: {
    color: mobileColors.primaryInk,
    fontSize: 11,
    fontWeight: '500'
  },
  header: {
    gap: 5
  },
  kicker: {
    color: mobileColors.primaryInk,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase'
  },
  screen: {
    flex: 1
  },
  safeArea: {
    backgroundColor: mobileColors.background,
    flex: 1
  },
  subtitle: {
    color: mobileColors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  title: {
    color: mobileColors.foreground,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.5
  }
})
