import { useMutation, useQueryClient } from '@tanstack/react-query'

import { meAvatarDelete, meAvatarPut, meProfilePatch } from '@/shared/api/generated/api/profile/profile'
import { useSession } from '@/shared/api/session-context'
import type { PickedAvatar } from '@/shared/native/avatar-picker'

export function useProfileEdit() {
  const session = useSession()
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: ['session', 'me'] })

  const workPhone = useMutation({
    retry: false,
    mutationFn: (value: string | null) =>
      session.write(async (token) => {
        const result = await meProfilePatch({ workPhone: value }, { headers: { Authorization: `Bearer ${token}` } })
        if (!result.data.data) throw new Error('Missing work phone response')
        return result.data.data.workPhone
      }),
    onSettled: refresh
  })
  const putAvatar = useMutation({
    retry: false,
    mutationFn: (avatar: PickedAvatar) =>
      session.write(async (token) => {
        // React Native uploads a { uri, name, type } descriptor as a file part.
        const file = avatar as unknown as Blob
        await meAvatarPut({ file }, { headers: { Authorization: `Bearer ${token}` } })
      }),
    onSettled: refresh
  })
  const removeAvatar = useMutation({
    retry: false,
    mutationFn: () =>
      session.write(async (token) => {
        await meAvatarDelete({ headers: { Authorization: `Bearer ${token}` } })
      }),
    onSettled: refresh
  })
  return { workPhone, putAvatar, removeAvatar }
}

const phoneErrors: Record<string, string> = { 'PROFILE.WORK_PHONE_INVALID': 'invalidPhone' }
const avatarErrors: Record<string, string> = {
  'PROFILE.AVATAR_TOO_LARGE': 'avatarTooLarge',
  HTTP_PAYLOAD_TOO_LARGE: 'avatarTooLarge',
  'PROFILE.AVATAR_TYPE_UNSUPPORTED': 'avatarType'
}

export function profileErrorKey(kind: 'phone' | 'avatar', code: string | undefined) {
  return (kind === 'phone' ? phoneErrors : avatarErrors)[code ?? ''] ?? 'general'
}
