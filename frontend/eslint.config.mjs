import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextConfig = compat.config({
  extends: ["next/core-web-vitals",
    "next/typescript",
    "plugin:react-hooks/recommended"],
  settings: {
    next: {
      rootDir: __dirname
    }
  },
  rules: {
    "@next/next/no-html-link-for-pages": ["error", "src/app"]
  }
});

export default [
  ...nextConfig,
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off"
    }
  },
  eslintConfigPrettier
];