module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "jira-task-id": ({ scope }) => {
          const jiraIdRegex = /^[A-Z]+-\d+$/;
          return [
            jiraIdRegex.test(scope),
            `The scope must be a Jira Task ID (e.g., "feat(IA-25): commit message")`,
          ];
        },
      },
    },
  ],
  rules: {
    "jira-task-id": [2, "always"],
    "scope-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "revert",
      ],
    ],
  },
};
