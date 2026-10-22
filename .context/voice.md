# HexTrackr voice

This file sets the prose dials for HexTrackr. The base rules are in `.claude/rules/prose-core.md`. Terms are in
`.context/GLOSSARY.md`.

## Audience and register

- Audience: the security team that uses HexTrackr at work, and the developers who maintain it.
- Register: plain and technical. Name the product and the version (Cisco PSIRT, CISA KEV, Node.js 22, SQLite).
- Do not use adjectives of quality ("enterprise", "advanced", "powerful"). State what the feature does.

## Comments and docstrings

- Write JSDoc on exported functions only. Use `@param`, `@returns` and `@throws` where they apply.
- An inline comment states a constraint or a reason. Do not prefix it with `CRITICAL:`, `NOTE:` or an issue ID.
- Do not leave task lists or "remove lines N to M" notes in code. Open a Plane issue (`HXTR-`) instead.

## README

- The README is short: one line on what HexTrackr is, the feature list, install steps, scripts and requirements.
- Each feature bullet says what the feature does. Do not use emoji or bold on bullets.
- Deep material goes in `DocVault/` (developers) or `app/public/docs-source/` (users).

## UI copy

- A confirm dialog names the action and its effect: "Delete the Cisco PSIRT API credentials? You cannot undo
  this."
- An error says what failed and what to do next: "Could not save the template. Check the connection and save
  again."
- A toast states the result: "Ticket saved.", not "Ticket saved successfully!".

## Exemptions

- Changelog files in `app/public/docs-source/changelog/versions/` hold history by design.
- Archived issues under `DocVault/Archive/` keep their original text.
