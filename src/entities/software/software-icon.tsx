import { Feather, FontAwesome6 } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useMobileTheme } from '@/shared/theme/theme-provider'

import { getSoftwareBrand } from './software-brand'

const tints = [
  ['#e8f0ff', '#2a4fa8'],
  ['#e6f6ee', '#1d6b49'],
  ['#fff1dd', '#8a4b00'],
  ['#f3e8ff', '#6b2fa3'],
  ['#ffe6e6', '#a12b2b'],
  ['#e3f4f7', '#17606e']
] as const

function tintFor(name: string) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return tints[hash % tints.length] ?? tints[0]
}

type Props = { name: string; logoUrl?: string | null; size?: number }

// Order: the logo the administrator supplied, a known brand mark, then a coloured initial.
export function SoftwareIcon({ name, logoUrl, size = 52 }: Props) {
  const { colors } = useMobileTheme()
  const [failedUrl, setFailedUrl] = useState<string>()
  const brand = getSoftwareBrand(name)
  const showLogo = !!logoUrl && failedUrl !== logoUrl
  const [tintBackground, tintForeground] = tintFor(name)
  const box = { width: size, height: size, borderRadius: size * 0.3 }

  return (
    <View
      style={[
        styles.icon,
        box,
        { backgroundColor: showLogo ? colors.white : (brand?.background ?? tintBackground), borderColor: colors.border }
      ]}
      accessibilityElementsHidden
      importantForAccessibility='no'
    >
      {showLogo ? (
        <Image
          contentFit='contain'
          onError={() => setFailedUrl(logoUrl)}
          source={{ uri: logoUrl }}
          style={{ width: size * 0.66, height: size * 0.66 }}
        />
      ) : brand?.icon ? (
        <FontAwesome6 name={brand.icon} brand size={size * 0.46} color={brand.foreground} />
      ) : name.trim() ? (
        <Text style={[styles.initial, { color: brand?.foreground ?? tintForeground, fontSize: size * 0.42 }]}>
          {name.trim().slice(0, 1).toLocaleUpperCase()}
        </Text>
      ) : (
        <Feather name='box' size={size * 0.44} color={colors.primaryInk} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  initial: { fontWeight: '700' }
})
