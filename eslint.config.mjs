import stylistic from "@stylistic/eslint-plugin";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["src/_bootstrap.ts"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2015,
    },
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "no-console": "off",
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/indent": ["error", 2],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
    },
  },
];