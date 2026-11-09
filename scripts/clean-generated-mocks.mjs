import { rm } from 'node:fs/promises'

const mocksDirectory = new URL('../src/shared/api/generated/mocks/', import.meta.url)

await rm(mocksDirectory, { recursive: true, force: true })
