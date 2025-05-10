# Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks for enforcing code quality and running tests.

## Available Hooks

### pre-commit

The pre-commit hook runs before each commit to ensure code quality:

- Runs the linter (`pnpm lint`)
- Runs the test suite (`pnpm test`)

If any of these checks fail, the commit will be aborted.

### pre-push

The pre-push hook runs before pushing to the remote repository:

- Runs the test suite (`pnpm test`)

If tests fail, the push will be aborted.

## Skipping Hooks

In some cases, you may need to bypass these hooks (not recommended for normal development):

```bash
# Skip pre-commit hooks
git commit --no-verify -m "Your commit message"

# Skip pre-push hooks
git push --no-verify
```

## Troubleshooting

If you encounter issues with the hooks:

1. Make sure Husky is properly installed: `pnpm prepare`
2. Ensure the hook files are executable: `chmod +x .husky/pre-commit .husky/pre-push`
3. Check that the hooks contain the correct commands (they should run pnpm commands, not npm)