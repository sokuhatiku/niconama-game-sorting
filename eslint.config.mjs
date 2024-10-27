import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        files: [
            "src/**/*.ts",
        ],
        languageOptions: {
            parserOptions: {
                project: ["tsconfig.json", "tsconfig.jest.json"],
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            }
        },
        linterOptions: {
            reportUnusedDisableDirectives: false,
        },
        rules: {
            semi: ["error", "always"],
            quotes: ["error", "double"],
            "@typescript-eslint/explicit-member-accessibility": "error",
        },
    },
);
