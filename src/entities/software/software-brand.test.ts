import { getSoftwareBrand } from './software-brand'

test('matches known software names without confusing similar names for a brand', () => {
  expect(getSoftwareBrand(' Figma ')?.icon).toBe('figma')
  expect(getSoftwareBrand('JIRA SOFTWARE')?.icon).toBe('jira')
  expect(getSoftwareBrand('ChatGPT')).toBeDefined()
  expect(getSoftwareBrand('Postman')).toBeDefined()
  expect(getSoftwareBrand('Figma alternative')).toBeUndefined()
  expect(getSoftwareBrand('New internal software')).toBeUndefined()
  expect(getSoftwareBrand('__proto__')).toBeUndefined()
})
