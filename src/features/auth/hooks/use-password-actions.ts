import { useMutation } from '@tanstack/react-query'

import { authRedeemInvitation, authRequestPasswordReset, authResetPassword } from '@/shared/api/generated/api/auth/auth'
import { meChangePassword } from '@/shared/api/generated/api/me/me'
import { apiErrorInfo } from '@/shared/api/api-error'
import { useSession } from '@/shared/api/session-context'

export const PASSWORD_MIN = 12
export const PASSWORD_MAX = 128

export type PasswordErrorKey = 'linkInvalid' | 'policy' | 'currentInvalid' | 'rateLimit' | 'general'

export function passwordErrorKey(error: unknown): PasswordErrorKey {
  const { status, code } = apiErrorInfo(error)
  if (code === 'AUTH.INVITATION_INVALID' || code === 'AUTH.PASSWORD_RESET_INVALID') return 'linkInvalid'
  if (code === 'AUTH.PASSWORD_POLICY_VIOLATION') return 'policy'
  if (code === 'AUTH.CURRENT_PASSWORD_INVALID') return 'currentInvalid'
  if (status === 429 || code === 'AUTH.LOGIN_TEMPORARILY_BLOCKED') return 'rateLimit'
  return 'general'
}

export function validNewPassword(value: string) {
  return value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX
}

export function useRequestPasswordReset() {
  return useMutation({
    retry: false,
    mutationFn: async (email: string) => {
      await authRequestPasswordReset({ email })
    }
  })
}

export function useSetPassword(purpose: 'invitation' | 'reset') {
  return useMutation({
    retry: false,
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      if (purpose === 'invitation') await authRedeemInvitation({ token, password })
      else await authResetPassword({ token, newPassword: password })
    }
  })
}

export function useChangePassword() {
  const session = useSession()
  return useMutation({
    retry: false,
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      session.write(async (token) => {
        await meChangePassword({ currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } })
      }),
    // The server ends every session after a successful change, including this one.
    onSuccess: () => session.endLocally()
  })
}
