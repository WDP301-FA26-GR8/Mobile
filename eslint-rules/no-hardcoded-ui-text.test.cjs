const { RuleTester } = require('eslint')
const rule = require('./no-hardcoded-ui-text.cjs')

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module'
  }
})

tester.run('no-hardcoded-ui-text', rule, {
  valid: [
    { code: "const view = <Text>{t('home.title')}</Text>" },
    { code: "const view = <Pressable accessibilityLabel={t('actions.save')} />" },
    { code: "const view = <Stack.Screen name='index' />" }
  ],
  invalid: [
    {
      code: 'const view = <Text>Hello world</Text>',
      errors: [{ messageId: 'hardcodedText' }]
    },
    {
      code: "const view = <Pressable accessibilityLabel='Save' />",
      errors: [{ messageId: 'hardcodedAttribute' }]
    }
  ]
})
