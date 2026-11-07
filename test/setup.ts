jest.mock('@react-native-async-storage/async-storage', () =>
  // AsyncStorage's official Jest mock is CommonJS-only.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

jest.mock('expo-router', () => ({
  Redirect: () => null,
  useLocalSearchParams: () => ({}),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn()
  })
}))

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(async () => true)
}))
