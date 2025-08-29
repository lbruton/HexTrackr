# Memory-first Search

Goal: Query project memory for the current topic and summarize relevant context before planning.

Inputs:

- topic: string

Steps:

1. Call `memory.search` with tags including `project:${workspaceFolderBasename}` and the topic.
2. Summarize findings (bulleted, with dates/links where possible).
3. Propose a short plan (3–5 bullets) grounded in the memory results.
4. Note gaps and follow-ups.
