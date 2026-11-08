import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

import type { CatalogSoftware } from '../model/employee-requests'

export type RequestFormError = 'reasonRequired' | undefined

interface RequestDetailsSectionProps {
  durationMonths: 12 | 18
  error?: RequestFormError
  onChangeDuration: (duration: 12 | 18) => void
  onChangeReason: (reason: string) => void
  onChangeTool: () => void
  reason: string
  software: CatalogSoftware
}

const durationOptions = [12, 18] as const

export function RequestDetailsSection({
  durationMonths,
  error,
  onChangeDuration,
  onChangeReason,
  onChangeTool,
  reason,
  software
}: RequestDetailsSectionProps) {
  const { t } = useTranslation()

  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.sectionTitle}>{t('requests.detailsTitle')}</Text>
        <Text style={styles.sectionHint}>{t('requests.detailsSubtitle')}</Text>
      </View>

      <View style={styles.selectedTool}>
        <View style={styles.selectedToolIcon}>
          <Text style={styles.selectedToolInitial}>{software.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.selectedToolCopy}>
          <Text style={styles.fieldLabel}>{t('requests.selectedTool')}</Text>
          <Text style={styles.selectedToolName}>{software.name}</Text>
          <Text style={styles.selectedToolCategory}>{t(`requests.categories.${software.category}`)}</Text>
        </View>
        <Pressable accessibilityRole='button' onPress={onChangeTool} style={styles.changeButton}>
          <Text style={styles.changeLabel}>{t('requests.changeTool')}</Text>
        </Pressable>
      </View>

      <View style={styles.fieldGroup}>
        <View>
          <Text style={styles.fieldLabel}>{t('requests.durationLabel')}</Text>
          <Text style={styles.fieldHint}>{t('requests.durationHint')}</Text>
        </View>
        <View style={styles.durationOptions}>
          {durationOptions.map((duration) => {
            const selected = durationMonths === duration

            return (
              <Pressable
                accessibilityLabel={t('requests.duration', { months: duration })}
                accessibilityRole='button'
                accessibilityState={{ selected }}
                key={duration}
                onPress={() => onChangeDuration(duration)}
                style={[styles.durationOption, selected && styles.durationSelected]}
              >
                <Text style={[styles.durationLabel, selected && styles.durationLabelSelected]}>
                  {t('requests.duration', { months: duration })}
                </Text>
                <Text style={[styles.durationHint, selected && styles.durationHintSelected]}>
                  {t(duration === 12 ? 'requests.durationDefault' : 'requests.durationExtended')}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      {durationMonths > 12 ? (
        <View accessibilityRole='summary' style={styles.warning}>
          <Feather
            accessibilityElementsHidden
            color={mobileColors.warning}
            importantForAccessibility='no'
            name='alert-triangle'
            size={16}
          />
          <Text style={styles.warningText}>{t('requests.longTermWarning')}</Text>
        </View>
      ) : null}

      <View style={styles.fieldGroup}>
        <View>
          <Text style={styles.fieldLabel}>{t('requests.reasonLabel')}</Text>
          <Text style={styles.fieldHint}>
            {t(software.isStandard ? 'requests.reasonOptional' : 'requests.outOfStandardReason')}
          </Text>
        </View>
        <TextInput
          accessibilityLabel={t('requests.reasonLabel')}
          multiline
          onChangeText={onChangeReason}
          placeholder={t('requests.reasonPlaceholder')}
          placeholderTextColor={mobileColors.muted}
          style={[styles.reasonInput, error && styles.reasonInputError]}
          textAlignVertical='top'
          value={reason}
        />
        {error ? (
          <Text accessibilityRole='alert' style={styles.error}>
            {t(`requests.errors.${error}`)}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  changeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 4
  },
  changeLabel: {
    color: mobileColors.primaryInk,
    fontSize: 12,
    fontWeight: '600'
  },
  durationHint: {
    color: mobileColors.muted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center'
  },
  durationHintSelected: {
    color: mobileColors.primaryInk
  },
  durationLabel: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center'
  },
  durationLabelSelected: {
    color: mobileColors.primaryInk
  },
  durationOption: {
    alignItems: 'center',
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 66,
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 10
  },
  durationSelected: {
    backgroundColor: '#fff3e8',
    borderColor: mobileColors.primary
  },
  error: {
    color: mobileColors.danger,
    fontSize: 12,
    lineHeight: 18
  },
  fieldGroup: {
    gap: 10
  },
  fieldHint: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  fieldLabel: {
    color: mobileColors.foreground,
    fontSize: 13,
    fontWeight: '600'
  },
  reasonInput: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: mobileColors.foreground,
    fontSize: 16,
    lineHeight: 20,
    minHeight: 110,
    padding: 12
  },
  reasonInputError: {
    borderColor: mobileColors.danger
  },
  section: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 18,
    padding: 15
  },
  sectionHint: {
    color: mobileColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  },
  sectionTitle: {
    color: mobileColors.foreground,
    fontSize: 15,
    fontWeight: '700'
  },
  selectedTool: {
    alignItems: 'center',
    backgroundColor: mobileColors.surfaceSubtle,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 11,
    padding: 12
  },
  selectedToolCategory: {
    color: mobileColors.muted,
    fontSize: 11,
    marginTop: 2
  },
  selectedToolCopy: {
    flex: 1,
    gap: 2
  },
  selectedToolIcon: {
    alignItems: 'center',
    backgroundColor: mobileColors.white,
    borderColor: mobileColors.border,
    borderRadius: 9,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  selectedToolInitial: {
    color: mobileColors.primaryInk,
    fontSize: 16,
    fontWeight: '700'
  },
  selectedToolName: {
    color: mobileColors.foreground,
    fontSize: 14,
    fontWeight: '700'
  },
  warning: {
    alignItems: 'flex-start',
    backgroundColor: mobileColors.warningBackground,
    borderColor: '#f3d9a7',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    padding: 12
  },
  warningText: {
    color: mobileColors.warning,
    flex: 1,
    fontSize: 12,
    lineHeight: 18
  }
})
