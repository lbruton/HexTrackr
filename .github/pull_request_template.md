## Summary

Explain what this PR changes and why. Keep it concise.

## Linked Issues

Closes #____  Related to #____

## Type of change

- [ ] feat (new feature)
- [ ] fix (bug fix)
- [ ] docs (documentation only)
- [ ] refactor (no functional change)
- [ ] chore/build (tooling, CI, deps)
- [ ] security (vuln mitigation, hardening)

## Screenshots (UI/visual changes)

Before:

After:

## How to test

1. `npm install`
2. `npm run dev` (server on 8080) or `docker-compose up -d` (8989 -> 8080)
3. Steps to validate the change:
   - 
4. Optional: `npx jest --coverage` and/or `npx playwright test`

## Checklist

- [ ] Ran `npm run fix:all` and addressed lints (ESLint, Stylelint, markdownlint)
- [ ] Pre-commit hooks pass (`npm run hooks:install` once if needed)
- [ ] Tests added/updated or not applicable
- [ ] Docs updated (user/dev docs or in-code) if behavior changed
- [ ] Backwards compatible or migration noted below
- [ ] No secrets or large artifacts committed (`data/`, `uploads/`, `.env` ignored)
- [ ] Security considerations reviewed (inputs sanitized, rate limits intact)

## Deployment / Migration notes (if any)

- Env vars: `NODE_ENV`, `HEXTRACKR_VERSION` (and any new ones)
- Database/init script changes (`npm run init-db`) if applicable

