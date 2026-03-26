module.exports = {
  extends: ["stylelint-config-standard-scss", "stylelint-config-recess-order"],
  ignoreFiles: ["node_modules/**/*", ".nuxt/**/*", ".output/**/*"],
  overrides: [
    {
      customSyntax: "postcss-html",
      files: ["**/*.vue"],
      rules: {
        "selector-pseudo-class-no-unknown": [
          true,
          {
            ignorePseudoClasses: ["deep", "global", "slotted"],
          },
        ],
      },
    },
  ],
  rules: {
    "at-rule-no-unknown": null,
    "no-descending-specificity": null,
    "no-empty-source": null,
    "scss/at-rule-no-unknown": null,
    "scss/operator-no-unspaced": null,
    "selector-class-pattern": null,
    "selector-id-pattern": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["deep", "global", "slotted"],
      },
    ],
  },
};
