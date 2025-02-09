import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [
      'frontend/.next/**',
      'frontend/node_modules/**',
      'frontend/build/**',
      'frontend/dist/**',
      'frontend/coverage/**'
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { 
      globals: {
        ...globals.browser,
        React: true,
        JSX: true
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 2024,
      }
    },
    plugins: {
      react: pluginReact,
      "react-hooks": reactHooksPlugin
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...tseslint.configs.recommended,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
    settings: {
      react: {
        version: "19.0"
      }
    }
  }
];