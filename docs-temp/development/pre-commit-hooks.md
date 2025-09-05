# Pre-commit Hooks

This project uses pre-commit hooks to enforce code quality and consistency before any code is committed. The hooks are managed by a custom script and configured to run automatically.

## How It Works

When you run `git commit`, the pre-commit hook (`.githooks/pre-commit`) is executed. This script performs the following actions:

1. **Runs ESLint**: Checks all staged JavaScript files for linting errors.
2. **Runs Stylelint**: Checks all staged CSS files for style errors.
3. **Runs Markdownlint**: Checks all staged Markdown files for formatting issues.

If any of these checks fail, the commit is aborted. You must fix the reported issues before you can successfully commit your changes.

## Installation

To enable the pre-commit hooks, run the following command from the project root:

```bash
npm run hooks:install
```

This command configures Git to use the `.githooks` directory for hooks.

## Bypassing Hooks

In rare cases, you may need to bypass the pre-commit hooks. You can do this using the `--no-verify` flag with your commit command:

```bash
git commit -m "Your commit message" --no-verify
```

**Use this with caution**, as it bypasses all automated quality checks.
