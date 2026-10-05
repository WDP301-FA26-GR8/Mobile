jest.mock('@react-native-async-storage/async-storage', () =>
  // AsyncStorage's official Jest mock is CommonJS-only.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)
