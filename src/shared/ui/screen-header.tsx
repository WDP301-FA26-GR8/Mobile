import { Pressable, StyleSheet, Text, View } from 'react-native'

import { theme } from './theme'

interface ScreenHeaderProps {
  backLabel?: string
  onBack?: () => void
  onSignOut?: () => void
  signOutLabel?: string
  title: string
}

export function ScreenHeader({ backLabel, onBack, onSignOut, signOutLabel, title }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        {onBack && backLabel ? (
          <Pressable accessibilityRole='button' onPress={onBack}>
            <Text style={styles.back}>{backLabel}</Text>
          </Pressable>
        ) : null}
        <Text accessibilityRole='header' style={styles.title}>
          {title}
        </Text>
      </View>
      {onSignOut && signOutLabel ? (
        <Pressable accessibilityRole='button' onPress={onSignOut}>
          <Text style={styles.signOut}>{signOutLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between'
  },
  titleBlock: {
    flex: 1,
    gap: theme.spacing.xs
  },
  title: {
    color: theme.colors.foreground,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34
  },
  back: {
    color: theme.colors.primaryInk,
    fontSize: 14,
    fontWeight: '700'
  },
  signOut: {
    color: theme.colors.primaryInk,
    fontSize: 14,
    fontWeight: '700'
  }
})
