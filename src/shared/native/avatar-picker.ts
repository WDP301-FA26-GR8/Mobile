import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'

export const AVATAR_MAX_BYTES = 1024 * 1024

export type PickedAvatar = { uri: string; name: string; type: 'image/jpeg' }

// Each attempt is smaller than the last; redrawing as JPEG also removes EXIF and GPS metadata.
const attempts = [
  { width: 512, compress: 0.8 },
  { width: 384, compress: 0.6 },
  { width: 256, compress: 0.5 }
]

export async function pickAvatar(): Promise<PickedAvatar | 'cancelled' | 'too-large'> {
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    allowsMultipleSelection: false,
    exif: false,
    quality: 1
  })
  const asset = picked.canceled ? undefined : picked.assets[0]
  if (!asset) return 'cancelled'

  for (const attempt of attempts) {
    const result = await ImageManipulator.manipulateAsync(
      asset.uri,
      asset.width > attempt.width ? [{ resize: { width: attempt.width } }] : [],
      { compress: attempt.compress, format: ImageManipulator.SaveFormat.JPEG }
    )
    const blob = await (await fetch(result.uri)).blob()
    if (blob.size > 0 && blob.size <= AVATAR_MAX_BYTES) {
      return { uri: result.uri, name: 'avatar.jpg', type: 'image/jpeg' }
    }
  }
  return 'too-large'
}
