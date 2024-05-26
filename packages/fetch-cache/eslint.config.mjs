import eslint from '@fetch-cache/eslint/base'

console.log('====>', eslint)

export default [
  ...eslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
