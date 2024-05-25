import pluginJs from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import perfectionist from './perfectionist.mjs'

export default {
  configs: {
    recommended: [
      {
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
      },
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
      ...perfectionist.configs.recommended,
    ],
  },
}
