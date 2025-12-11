# 🔀 Team Branching & PR Workflow Setup

This project follows a professional GitHub workflow with strict branching conventions, pull request templates, code review checklists, and branch protection rules to ensure smooth collaboration, code quality, and team consistency.

---

## 🌿 Branch Naming Conventions

All team members must follow these branch naming patterns for clarity and traceability:

### Branch Types

| Type | Pattern | Example | Use Case |
|------|---------|---------|----------|
| **Feature** | `feature/<feature-name>` | `feature/login-auth` | New functionality or enhancements |
| **Fix** | `fix/<bug-name>` | `fix/navbar-alignment` | Bug fixes |
| **Chore** | `chore/<task-name>` | `chore/update-dependencies` | Maintenance, refactoring, or dependencies |
| **Docs** | `docs/<update-name>` | `docs/update-readme` | Documentation updates |

### Naming Best Practices

- Use **kebab-case** (lowercase with hyphens)
- Keep names **descriptive but concise**
- Avoid special characters or spaces
- Examples:
  - ✅ `feature/vendor-dashboard`
  - ✅ `fix/qr-code-generation`
  - ❌ `my_branch`
  - ❌ `feature`

---

## 📝 Pull Request (PR) Template

We use a standardized PR template located at `.github/pull_request_template.md` to ensure all PRs contain necessary information.

### PR Template Structure

```markdown
## Summary
Brief explanation of the PR purpose and problem it solves.

## Changes Made
- List key updates, features, or fixes
- Include breaking changes
- Mention dependencies added/removed

## Type of Change
- [ ] Feature (new functionality)
- [ ] Fix (bug fix)
- [ ] Chore (maintenance/refactoring)
- [ ] Docs (documentation update)

## Screenshots / Evidence
(Screenshots, logs, or links if relevant)

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No console errors

## Checklist
- [ ] Code builds successfully
- [ ] ESLint & Prettier checks pass
- [ ] Follows naming conventions
- [ ] Reviewed by at least one teammate
- [ ] Linked to corresponding issue
- [ ] No sensitive data exposed
```

---

## ✅ Code Review Checklist

Every PR must pass this review checklist before merging:

### Code Quality
- [ ] Code follows project naming conventions and folder structure
- [ ] No hardcoded secrets or sensitive data
- [ ] Functions and variables have meaningful names
- [ ] Comments explain complex logic when necessary

### Functionality
- [ ] Functionality verified locally
- [ ] All existing features still work (no regressions)
- [ ] Edge cases considered and handled

### Technical Standards
- [ ] ESLint checks pass with no errors
- [ ] Prettier formatting applied
- [ ] TypeScript strict mode compliance
- [ ] No console errors or warnings in browser/terminal

### Testing & Documentation
- [ ] Code is testable and tested
- [ ] README or docs updated if needed
- [ ] PR description clearly explains changes

### Review Process
- [ ] Linked to corresponding issue (if applicable)
- [ ] At least one team member has reviewed and approved
- [ ] All review comments addressed or discussed

---

## 🛡️ Branch Protection Rules

The `main` branch is protected with the following rules configured in GitHub Settings:

### Protection Rules Enabled

1. **Require pull request reviews before merging**
   - At least 1 approval required
   - Dismisses stale reviews when new commits are pushed

2. **Require status checks to pass**
   - ESLint checks must pass
   - Build must succeed
   - All tests must pass

3. **Disallow direct pushes to main**
   - All changes must go through PRs
   - Prevents accidental direct commits

4. **Require PRs to be up to date before merging**
   - Ensures branch is current with main
   - Prevents merge conflicts

5. **Require linear history** (optional)
   - Ensures clean commit history
   - No merge commits on main

### How to Configure

1. Go to GitHub repository → **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Enter `main` as branch name pattern
4. Enable the rules mentioned above
5. Save changes

---

## 🔄 Standard Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/vendor-dashboard
```

### 2. Make Changes & Commit

```bash
# Stage changes
git add .

# Commit (pre-commit hooks will run automatically)
git commit -m "feat: add vendor dashboard with statistics"

# Push to remote
git push origin feature/vendor-dashboard
```

### 3. Create Pull Request

1. Go to GitHub repository
2. Click **"Compare & pull request"**
3. Fill out the PR template
4. Add reviewers from your team
5. Link related issues (e.g., "Closes #42")
6. Submit PR

### 4. Code Review Process

1. **Reviewer checks the PR** using the code review checklist
2. **Leaves comments** on specific lines or overall feedback
3. **Requests changes** if needed or **Approves** if ready
4. **Author addresses feedback** and pushes new commits
5. **Re-review** if changes were made

### 5. Merge PR

1. Ensure all checks pass (ESLint, tests, build)
2. Ensure at least 1 approval
3. Click **"Squash and merge"** or **"Merge pull request"**
4. Delete the feature branch after merging

---

## 🎯 Why This Workflow?

### Maintains Code Quality
- Every change is reviewed before merging
- Automated checks catch issues early
- Consistent coding standards across the team

### Improves Collaboration
- Clear branch naming shows who's working on what
- PR templates ensure complete information
- Review process facilitates knowledge sharing

### Increases Velocity
- Parallel work on different features without conflicts
- Quick identification of issues through checklists
- Clean history makes debugging easier

### Builds Team Trust
- Transparent review process
- Everyone follows the same standards
- Continuous learning through code reviews

---

## 📊 Workflow Benefits Summary

| Benefit | Impact |
|---------|--------|
| **Code Quality** | Bugs caught in review, not production |
| **Documentation** | PRs serve as change documentation |
| **Knowledge Sharing** | Team learns from each other's code |
| **Safe Releases** | Protected main branch is always deployable |
| **Clear History** | Easy to track what changed and why |

This workflow ensures professional-grade collaboration and maintains high code quality throughout the project lifecycle.







