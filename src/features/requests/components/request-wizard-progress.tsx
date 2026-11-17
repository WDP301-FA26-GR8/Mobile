import { StyleSheet, Text, View } from 'react-native'

import { mobileColors } from '@/shared/theme/colors'

interface RequestWizardProgressProps {
  accessibilityLabel: string
  currentStep: 1 | 2 | 3
  labels: readonly [string, string, string]
}

export function RequestWizardProgress({ accessibilityLabel, currentStep, labels }: RequestWizardProgressProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole='progressbar'
      accessibilityValue={{ max: 3, min: 1, now: currentStep }}
      style={styles.container}
    >
      {labels.map((label, index) => {
        const step = index + 1
        const isCurrent = step === currentStep
        const isComplete = step < currentStep

        return (
          <View key={label} style={styles.step}>
            <View style={styles.stepLine}>
              <View style={[styles.number, isCurrent && styles.currentNumber, isComplete && styles.completeNumber]}>
                {isComplete ? (
                  <Text style={styles.completeMark}>✓</Text>
                ) : (
                  <Text style={[styles.numberLabel, isCurrent && styles.currentNumberLabel]}>{step}</Text>
                )}
              </View>
              {index < labels.length - 1 ? (
                <View style={[styles.connector, step < currentStep && styles.connectorComplete]} />
              ) : null}
            </View>
            <Text style={[styles.label, isCurrent && styles.currentLabel]}>{label}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  completeMark: {
    color: mobileColors.white,
    fontSize: 13,
    fontWeight: '700'
  },
  completeNumber: {
    backgroundColor: '#40b880',
    borderColor: '#40b880'
  },
  connector: {
    backgroundColor: mobileColors.border,
    flex: 1,
    height: 1,
    marginHorizontal: 8
  },
  connectorComplete: {
    backgroundColor: '#40b880'
  },
  container: {
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 13
  },
  currentLabel: {
    color: mobileColors.foreground,
    fontWeight: '600'
  },
  currentNumber: {
    backgroundColor: mobileColors.primary,
    borderColor: mobileColors.primary
  },
  currentNumberLabel: {
    color: mobileColors.white
  },
  label: {
    color: mobileColors.muted,
    fontSize: 10,
    marginTop: 7,
    textAlign: 'center'
  },
  number: {
    alignItems: 'center',
    backgroundColor: mobileColors.surface,
    borderColor: mobileColors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 25,
    justifyContent: 'center',
    width: 25
  },
  numberLabel: {
    color: mobileColors.muted,
    fontSize: 11,
    fontWeight: '600'
  },
  step: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0
  },
  stepLine: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%'
  }
})
