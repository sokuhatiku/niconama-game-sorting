import stylistic from "@stylistic/eslint-plugin";
import typescript from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["src/_bootstrap.ts", "src/parameterObject.ts"],
    languageOptions: {
      parser: tsparser,
      sourceType: "module",
      ecmaVersion: 2015,
    },
    plugins: {
      "@typescript-eslint": typescript,
      "@stylistic": stylistic,
    },
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "no-console": "off",
      "no-unused-vars": ["warn"],
      "no-restricted-syntax": [
        "error",
        {
          "selector": "OptionalChainingExpression",
          "message": "Optional chaining is not supported in ES2015.",
        },
      ],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "never"],
      "@stylistic/indent": ["error", 2],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
    },
  },
];