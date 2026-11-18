import { Image } from 'expo-image'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useMobileTheme } from '@/shared/theme/theme-provider'

type Props = {
  name: string
  url?: string | null
  size?: number
  onImageError?: () => void
}

// Shows the picture when there is one and the initial otherwise, including when the link has expired.
export function Avatar({ name, url, size = 42, onImageError }: Props) {
  const { colors } = useMobileTheme()
  const [failedUrl, setFailedUrl] = useState<string>()
  const showImage = !!url && failedUrl !== url
  const radius = size * 0.34

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility='no'
      style={[styles.box, { width: size, height: size, borderRadius: radius, backgroundColor: colors.primarySoft }]}
    >
      {showImage ? (
        <Image
          contentFit='cover'
          onError={() => {
            setFailedUrl(url)
            onImageError?.()
          }}
          source={{ uri: url }}
          style={{ width: size, height: size }}
        />
      ) : (
        <Text style={{ color: colors.primaryInk, fontSize: size * 0.4, fontWeight: '700' }}>
          {name.trim().slice(0, 1).toLocaleUpperCase()}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({ box: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } })
