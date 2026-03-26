# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Quality Control

This project uses various tools to ensure code quality and consistency.

### ESLint

Enforces clean code practices, security rules, and Vue file structure (`script` → `template` → `style`).

```bash
# Check for errors
pnpm lint

# Automatically fix errors
pnpm lint:fix
```

### Stylelint

Enforces CSS/SCSS standards, including lowercase hex colors.

```bash
# Check for styles
pnpm lint:style

# Automatically fix styles
pnpm lint:style:fix
```

### jscpd

Detects duplicate code that could be optimized or refactored.

```bash
# Check for duplicates
pnpm lint:cpd
```

### Zod

Used for schema validation and better TypeScript type safety. Use it to define and validate data structures.

### Commitlint

Ensures that all commit messages follow the project's standards.

Every commit message must follow the conventional commit format with a **Jira Task ID** as the mandatory scope.

**Example:**
`refactor(EDMSIAIS-29): project refactoring add preiter, linter, and other`

The commit will fail if:

1. The type is missing or invalid (e.g., `feat`, `fix`, `chore`).
2. The Jira ID (scope) is missing or incorrectly formatted.
3. The subject is missing.

### GitHub Actions

A CI workflow is configured to run all linters and duplication checks on every push and pull request to `main`, `master`, and `dev` branches.
