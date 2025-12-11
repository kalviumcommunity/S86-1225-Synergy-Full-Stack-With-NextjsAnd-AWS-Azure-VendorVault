# VendorVault — TypeScript & ESLint Configuration

---

# 🛠️ TypeScript & ESLint Configuration

This project is configured with strict TypeScript settings, ESLint, Prettier, and pre-commit hooks to ensure code quality and consistency across the team.

## Strict TypeScript Configuration

The project uses strict TypeScript settings in `tsconfig.json` to catch potential errors early:

- **`strict: true`** - Enables all strict type-checking options
- **`noImplicitAny: true`** - Raises errors on expressions and declarations with an implied 'any' type
- **`noUnusedLocals: true`** - Reports errors on unused local variables
- **`noUnusedParameters: true`** - Reports errors on unused function parameters
- **`forceConsistentCasingInFileNames: true`** - Ensures consistent file name casing across different operating systems
- **`skipLibCheck: true`** - Skips type checking of declaration files for faster compilation

### Why Strict TypeScript?

Strict TypeScript mode significantly reduces runtime bugs by:

- **Catching type mismatches at compile time** instead of runtime
- **Preventing undefined/null reference errors** through strict null checks
- **Eliminating unused code** that can cause confusion and maintenance issues
- **Ensuring type safety** across the entire codebase
- **Improving IDE autocomplete** and refactoring capabilities

This approach makes the codebase more reliable, easier to refactor, and safer for team collaboration.

---

## ESLint + Prettier Setup

### ESLint Rules (`.eslintrc.json`)

- **`no-console: "warn"`** - Warns about console statements (should use proper logging in production)
- **`semi: ["error", "always"]`** - Enforces semicolons at the end of statements
- **`quotes: ["error", "double"]`** - Enforces double quotes for string literals

### Prettier Configuration (`.prettierrc`)

- **`singleQuote: false`** - Uses double quotes for strings
- **`semi: true`** - Adds semicolons at the end of statements
- **`tabWidth: 2`** - Uses 2 spaces for indentation
- **`trailingComma: "es5"`** - Adds trailing commas where valid in ES5

### What These Rules Enforce

- ✅ **Consistent Code Style** - Everyone on the team writes code that looks the same
- ✅ **Readability** - Double quotes and semicolons improve code clarity
- ✅ **Maintainability** - Consistent formatting makes code reviews faster
- ✅ **Fewer Merge Conflicts** - Automatic formatting reduces formatting-related conflicts
- ✅ **Professional Quality** - Clean, consistent code is easier to debug and extend

---

## Pre-Commit Hooks (Husky + lint-staged)

The project uses **Husky** and **lint-staged** to automatically check and fix code before every commit:

### How It Works

1. When you run `git commit`, Husky triggers the pre-commit hook
2. lint-staged runs ESLint and Prettier only on staged files
3. If there are fixable issues, they're automatically corrected
4. If there are unfixable errors, the commit is blocked until you fix them

### Benefits for Team Consistency

- 🔒 **Prevents Bad Code** - Broken or poorly formatted code never enters the repository
- 👥 **Team Consistency** - All team members follow the same code quality standards
- 🔧 **Automatic Fixes** - Most formatting and simple lint issues are fixed automatically
- ⚡ **Faster Code Reviews** - Reviewers can focus on logic, not style issues
- 🚀 **CI/CD Reliability** - Ensures all committed code passes quality checks

This automation ensures that every commit meets quality standards without manual intervention.

---

## Running Quality Checks Manually

```bash
# Run ESLint to check for code issues
cd vendorvault && npm run lint

# Run Prettier to format all files
cd vendorvault && npx prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}"

# Check if files are formatted correctly
cd vendorvault && npx prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}"
```

---

## Testing & Verification

The configuration has been tested and verified:

- ✅ ESLint runs successfully without errors
- ✅ Prettier formatted all project files
- ✅ Pre-commit hooks are configured and ready
- ✅ lint-staged will check staged files before commit

All quality checks are in place to maintain code consistency and reliability throughout development.


