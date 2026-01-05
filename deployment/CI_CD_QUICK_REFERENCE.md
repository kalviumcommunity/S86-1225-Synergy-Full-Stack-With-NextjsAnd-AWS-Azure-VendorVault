# CI/CD Quick Reference Guide

## 🚀 Quick Start

### Running CI Checks Locally
```bash
cd vendorvault

# 1. Lint
npm run lint

# 2. Test
npm test -- --coverage

# 3. Build
npm run build
```

### Manual Workflow Trigger
1. Go to **GitHub** → **Actions** → **CI Pipeline**
2. Click **Run workflow**
3. Select branch → Click **Run workflow**

---

## 📋 Pipeline Stages

| Stage | Command | Purpose | Fail Condition |
|-------|---------|---------|----------------|
| **Lint** | `npm run lint` | Code quality check | ESLint errors |
| **Test** | `npm test --coverage` | Unit tests | Test failures or <80% coverage |
| **Build** | `npm run build` | Production compilation | Build errors |
| **Deploy** | Conditional | Azure deployment | Deployment errors (main only) |

---

## 🔑 Required GitHub Secrets

Navigate to: **Repository → Settings → Secrets and Variables → Actions**

```
DATABASE_URL              # PostgreSQL connection string
NEXTAUTH_SECRET           # Auth encryption key (32 chars)
NEXTAUTH_URL              # App base URL
AZURE_CREDENTIALS         # Service principal JSON
ACR_USERNAME              # Azure Container Registry user
ACR_PASSWORD              # Azure Container Registry password
```

---

## ⚡ Performance Optimizations

### Dependency Caching
- **Without**: ~3m 15s total
- **With**: ~1m 20s total
- **Savings**: 59% faster

### Concurrency Control
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
- Cancels outdated runs on new commits
- Saves GitHub Actions minutes

---

## 🔍 Debugging Failed Workflows

### 1. Lint Failures
**Error**: `'useState' is defined but never used`
**Fix**: Remove unused imports or use the variable

### 2. Test Failures
**Error**: `Expected: 5, Received: 6`
**Fix**: Correct test logic or implementation

### 3. Build Failures
**Error**: `Environment variable DATABASE_URL is not set`
**Fix**: Add missing secret in GitHub settings

### 4. Viewing Logs
1. **Actions** tab → Select workflow run
2. Click on failed step
3. Expand logs to see error details

---

## 📊 Workflow Triggers

```yaml
on:
  push:
    branches: [main, develop]      # Auto-run on push
  pull_request:
    branches: [main, develop]      # Auto-run on PR
  workflow_dispatch:               # Manual trigger
```

---

## 📦 Artifacts Generated

| Artifact | Location | Retention |
|----------|----------|-----------|
| **Coverage Report** | `coverage/` | 7 days |
| **Build Output** | `.next/` | 7 days |

**Download**: Go to workflow run → Scroll to **Artifacts** section

---

## ✅ Success Criteria

A successful CI run shows:
- ✅ All stages pass (green checkmarks)
- ✅ Test coverage ≥ 80%
- ✅ Build completes without errors
- ✅ Artifacts uploaded successfully

---

## 🎯 Branch Protection Rules (Recommended)

Enable in **Settings → Branches → Add rule**:

```
☑️ Require status checks to pass before merging
   ☑️ CI Pipeline
☑️ Require branches to be up to date before merging
☑️ Require pull request reviews before merging (1 reviewer)
```

---

## 📸 Screenshot Checklist

For assignment submission:

- [ ] Successful workflow run (all green)
- [ ] Lint stage expanded
- [ ] Test stage with coverage
- [ ] Build stage completion
- [ ] Artifacts section
- [ ] Secrets configuration page (values hidden)

---

## 🆘 Getting Help

1. **Check Logs**: Actions tab → Expand failed step
2. **Review Documentation**: [`deployment/CI_CD_SETUP.md`](./CI_CD_SETUP.md)
3. **Verify Secrets**: Settings → Secrets → Ensure all are configured
4. **Run Locally**: Test `npm run lint && npm test && npm run build`

---

## 🔗 Related Files

- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) - Main CI workflow
- [`.github/workflows/deploy-azure.yml`](../.github/workflows/deploy-azure.yml) - Deployment workflow
- [`vendorvault/package.json`](../vendorvault/package.json) - NPM scripts
- [`jest.config.js`](../jest.config.js) - Test configuration
- [`eslint.config.mjs`](../vendorvault/eslint.config.mjs) - Lint rules

---

**Updated**: January 5, 2026
