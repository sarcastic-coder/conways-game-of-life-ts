import js from "@eslint/js";
import react from "eslint-plugin-react";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import { config, configs } from "typescript-eslint";

export default config([
  configs.recommended,
  globalIgnores([
    'dist/**/*',
    "coverage/**/*",
  ]),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: [
      react.configs.flat['jsx-runtime'],
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
