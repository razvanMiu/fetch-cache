import perfectionist from "eslint-plugin-perfectionist";

const packages = [
  'fetch-cache',
  '@fetch-cache/astro',
  '@fetch-cache/eslint',
  '@fetch-cache/tsconfig',
]

const config = {
  configs: {
    recommended: [],
  },
};

config.configs.recommended.push({
  plugins: {
    perfectionist,
  },
  rules: {
    "perfectionist/sort-array-includes": "off",
    // 'perfectionist/sort-astro-attributes': 'off',
    // 'perfectionist/sort-classes': 'off',
    // 'perfectionist/sort-enums': 'off',
    // 'perfectionist/sort-exports': 'off',
    "perfectionist/sort-imports": [
      "error",
      {
        type: "natural",
        order: "asc",
        groups: [
          "type",
          ["builtin", "external"],
          "internal-type",
          "internal",
          ["parent-type", "sibling-type", "index-type"],
          ["parent", "sibling", "index"],
          "side-effect",
          "style",
          "object",
          "unknown",
        ],
        "custom-groups": {
          value: {
            "internal": packages.reduce((acc, pkg) => {
              acc.push(`${pkg}`)
              acc.push(`${pkg}/**`)
              return acc
            }, [])
          },
          type: {},
        },
        "newlines-between": "always",
        "internal-pattern": ["@/**", "~/**"],
      },
    ],
    // 'perfectionist/sort-interfaces': 'off',
    "perfectionist/sort-jsx-props": "off",
    "perfectionist/sort-maps": "off",
    // 'perfectionist/sort-named-exports': 'off',
    // 'perfectionist/sort-named-imports': 'off',
    // 'perfectionist/sort-object-types': 'off',
    "perfectionist/sort-objects": "off",
    // 'perfectionist/sort-svelte-attributes': 'off',
    // 'perfectionist/sort-intersection-types': 'off',
    // 'perfectionist/sort-union-types': 'off',
    // 'perfectionist/sort-vue-attributes': 'off',
  },
});

export default config;
