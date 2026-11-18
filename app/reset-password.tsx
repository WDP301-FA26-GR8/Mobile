import { useLinkingURL } from 'expo-linking'

import { SetPasswordScreen } from '@/features/auth'
import { tokenFromUrl } from '@/shared/lib/link-token'

export default function ResetPasswordRoute() {
  return <SetPasswordScreen purpose='reset' token={tokenFromUrl(useLinkingURL())} />
}
