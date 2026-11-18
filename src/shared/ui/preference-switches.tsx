import { StyleSheet, View } from 'react-native'

import { LanguageSwitch } from './language-switch'
import { ThemeSwitch } from './theme-switch'

export function PreferenceSwitches() {
  return (
    <View style={styles.row}>
      <LanguageSwitch />
      <ThemeSwitch />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 }
})
