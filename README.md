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

Here is a **clean, complete, ready-to-submit `README.md` section ONLY for Environment Variables**, fully in Markdown format.

Just copy → paste it into your README.

---

```md
# 🌱 Environment Variable Management

This project uses environment variables to securely manage sensitive configuration such as API keys, database URLs, and authentication secrets. Proper environment handling ensures the application remains secure, portable, and easy for anyone on the team to set up.

---

## 📁 Required Environment Files

Two environment files must exist at the **project root**:

### **1. `.env.local`** (NOT committed)
Contains real secrets used during development.

Example:

```

# Server-side variables (not exposed to the browser)

DATABASE_URL=postgres://username:password@localhost:5432/dbname
JWT_SECRET=super_secret_key_here

# Client-side variables (exposed to browser)

NEXT_PUBLIC_API_BASE_URL=[https://api.example.com](https://api.example.com)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_example

```

### **2. `.env.example`** (Committed)
A template file that shows all required environment variables without exposing real secrets.

Example:


# Server-side variables

DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=your_jwt_secret_here

# Client-side variables (must start with NEXT_PUBLIC_)

NEXT_PUBLIC_API_BASE_URL=[https://api.placeholder.com](https://api.placeholder.com)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_placeholder

````

Team members can create their own `.env.local` by running:

```bash
cp .env.example .env.local
````

---

## 🔒 Protecting Secrets with `.gitignore`

To ensure secrets are not pushed to GitHub, `.gitignore` contains:

```
# Ignore all env files
.env*
# Allow example file
!.env.example
```

* `.env.local` → stays private
* `.env.example` → shared publicly

---

## 🧩 Using Environment Variables in Code

### **Server-side usage (API routes, getServerSideProps, lib files):**

```ts
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is missing");
}
```

### **Client-side usage (React components):**

```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
```

⚠️ **Important:**
Only variables starting with `NEXT_PUBLIC_` are exposed in the browser.

---

## 📝 Common Pitfalls Avoided

* ❌ Accidentally exposing server secrets to the client
* ❌ Forgetting to use `NEXT_PUBLIC_` for browser variables
* ❌ Committing `.env.local` to Git
* ❌ Missing environment variables causing runtime errors

This setup ensures the app is secure, predictable, and easy for new team members to configure.







