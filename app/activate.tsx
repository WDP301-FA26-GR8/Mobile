import { useLinkingURL } from 'expo-linking'

import { SetPasswordScreen } from '@/features/auth'
import { tokenFromUrl } from '@/shared/lib/link-token'

export default function ActivateRoute() {
  return <SetPasswordScreen purpose='invitation' token={tokenFromUrl(useLinkingURL())} />
}
