import { Feather, FontAwesome6 } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import { useMobileTheme } from '@/shared/theme/theme-provider'

import { getSoftwareBrand } from './software-brand'

export function SoftwareIcon({ name }: { name: string }) {
  const { colors } = useMobileTheme()
  const brand = getSoftwareBrand(name)
  return (
    <View
      style={[styles.icon, { backgroundColor: brand?.background ?? colors.primarySoft }]}
      accessibilityElementsHidden
      importantForAccessibility='no'
    >
      {brand?.icon ? (
        <FontAwesome6 name={brand.icon} brand size={24} color={brand.foreground} />
      ) : brand ? (
        <Text style={[styles.initial, { color: brand.foreground }]}>{name.trim().slice(0, 1).toLocaleUpperCase()}</Text>
      ) : (
        <Feather name='box' size={23} color={colors.primaryInk} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  icon: { borderRadius: 16, width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 22, fontWeight: '700' }
})
