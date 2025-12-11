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







