import stylistic from "@stylistic/eslint-plugin"
import typescript from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"

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
            "prefer-const": ["warn", {
                "destructuring": "all",
                "ignoreReadBeforeAssign": true,
            }],
            "no-console": "off",
            "no-unused-vars": ["warn", { args: "none" }],
            "no-restricted-syntax": [
                "error",
                {
                    "selector": "OptionalChainingExpression",
                    "message": "Optional chaining is not supported in ES2015.",
                },
            ],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "never"],
            "@stylistic/indent": ["error", 4],
            "@stylistic/comma-dangle": ["error", "always-multiline"],
            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/comma-spacing": ["error", { "before": false, "after": true }],
            "@stylistic/key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
        },
    },
]
