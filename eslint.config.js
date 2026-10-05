const query = require('@tanstack/eslint-plugin-query')
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const globals = require('globals')
const noHardcodedUiText = require('./eslint-rules/no-hardcoded-ui-text.cjs')

module.exports = defineConfig([
  expoConfig,
  ...query.configs['flat/recommended'],
  prettierRecommended,
  {
    ignores: ['dist/*', '.expo/*', 'coverage/*', 'node_modules/*', 'src/shared/api/generated/**']
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      project: {
        rules: {
          'no-hardcoded-ui-text': noHardcodedUiText
        }
      }
    },
    rules: {
      'project/no-hardcoded-ui-text': 'error'
    }
  },
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: globals.jest
    }
  }
])
