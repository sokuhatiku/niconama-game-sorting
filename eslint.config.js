const eslintConfig = require("@akashic/eslint-config");

module.exports = [
  ...eslintConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.jest.json"]
      }
    }
  }
];
