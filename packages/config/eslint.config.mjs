import prettier from "eslint-plugin-prettier/recommended";
import tsParser from "@typescript-eslint/parser";
import eslintJs from "@eslint/js";
import eslintTs from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

const tsFiles = ["**/*.ts", "**/*.tsx"];

const languageOptions = {
  ecmaVersion: 2023,
  sourceType: "module",
};

const customTypescriptConfig = {
  files: tsFiles,
  plugins: {
    import: importPlugin,
    "import/parsers": tsParser,
  },
  languageOptions: {
    ...languageOptions,
    parser: tsParser,
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
  },
  rules: {
    ...importPlugin.configs.typescript.rules,
    "import/order": [
      "warn",
      {
        alphabetize: {
          order: "asc",
        },
        groups: [
          "builtin",
          "external",
          "internal",
          ["sibling", "index"],
          "parent",
          "type",
        ],
        "newlines-between": "never",
      },
    ],
    "sort-imports": [
      "error",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        args: "none",
      },
    ],
    "@typescript-eslint/prefer-optional-chain": 2,
    "@typescript-eslint/consistent-type-assertions": [
      2,
      {
        assertionStyle: "as",
        objectLiteralTypeAssertions: "never",
      },
    ],
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-import-type-side-effects": "error",
    "@typescript-eslint/no-restricted-imports": "error",
  },
};

const recommendedTypeScriptConfigs = [
  ...eslintTs.configs.recommended.map((config) => ({
    ...config,
    files: tsFiles,
  })),
  ...eslintTs.configs.stylistic.map((config) => ({
    ...config,
    files: tsFiles,
  })),
];

export default [
  {
    ignores: ["dist/*", "vite.config.ts.timestamp*"],
  },
  eslintJs.configs.recommended,
  ...recommendedTypeScriptConfigs,
  customTypescriptConfig,
  prettier,
];
