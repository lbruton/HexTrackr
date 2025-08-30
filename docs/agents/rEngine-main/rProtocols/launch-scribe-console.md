# Protocol: Launch Scribe Console

**Version: 1.0.0**
**Date: 2025-08-18**
## Status: Active

## Purpose

This protocol defines the steps for launching the Split Scribe Console for real-time monitoring of StackTrackr sessions.

## Steps

1. Ensure all existing scribe processes are stopped to avoid conflicts.
2. Launch the Split Scribe Console using the provided script:

```bash
bash /Volumes/DATA/GitHub/rEngine/rEngine/auto-launch-split-scribe.sh
```

## Prompt for Copilot

Whenever you need to launch the Split Scribe Console, prompt Copilot with:

> Please launch the Split Scribe Console by running the auto-launch-split-scribe.sh script.

---

## Notes

- The console will open in an external Terminal window and provide split monitoring of changes and logs.
- If the script fails, follow the manual instructions printed in the terminal output.
