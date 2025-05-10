# Git Hooks

This directory contains Git hooks used in the project.

## Pre-Commit Hook

The pre-commit hook runs the following checks before allowing a commit:

1. ESLint - Ensures code style consistency
2. TypeScript - Checks for type errors

### Installation

To install the hook, run the following commands from the project root:

```bash
mkdir -p .git/hooks
cp .github/hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

### Skipping Hooks

In rare cases when you need to bypass the hooks, you can use:

```bash
git commit --no-verify
```

But please use this sparingly and make sure to run the checks manually afterward.