import type { Href } from 'expo-router'
import { useRouter } from 'expo-router'

export function goBackOr(router: Pick<ReturnType<typeof useRouter>, 'back' | 'canGoBack' | 'replace'>, fallback: Href) {
  if (router.canGoBack()) {
    router.back()
  } else {
    router.replace(fallback)
  }
}
