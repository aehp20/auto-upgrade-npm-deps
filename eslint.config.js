import pluginJs from "@eslint/js";
import globals from "globals";

export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
        "no-console": "warn",
        "eqeqeq": "error",
        "capitalized-comments": "error"
    }
  }
];