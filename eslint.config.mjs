import js from "@eslint/js";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier/recommended";
import security from "eslint-plugin-security";
import vue from "eslint-plugin-vue";
import globals from "globals";
import ts from "typescript-eslint";

import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  ts.config(
    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
    },
    {
      ignores: [
        ".nuxt/**",
        ".output/**",
        "dist/**",
        "node_modules/**",
        "report/**",
        ".github/**",
        ".git/**",
      ],
    },
    js.configs.recommended,
    ...ts.configs.recommended,
    ...vue.configs["flat/recommended"],
    security.configs.recommended,
    perfectionist.configs["recommended-alphabetical"],
    prettier,
    {
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "no-undef": "off",
        "security/detect-object-injection": "off", // Often noisy in frontend code
        "vue/block-order": [
          "error",
          {
            order: ["script", "template", "style"],
          },
        ],

        "vue/multi-word-component-names": "off",
      },
    }
  )
);
