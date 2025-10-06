# Claude Code Hook Configuration

This hook prevents accidental execution of `npm run init-db` which wipes all database data.

## Installation

Add this configuration to your Claude Code settings file:

**Location**: `~/.claude/settings.json` (macOS/Linux) or `%USERPROFILE%\.claude\settings.json` (Windows)

```json
{
  "hooks": {
    "bash-pre-hook": {
      "command": "bash",
      "args": [
        "-c",
        "if echo \"$BASH_COMMAND\" | grep -qE 'npm run init-db|npm.*init-db'; then echo '❌ BLOCK: Use \"npm run migrate\" for schema changes. init-db only for fresh installs (wipes all data).'; exit 1; fi"
      ]
    }
  }
}
```

## What It Does

- **Intercepts**: All bash commands before execution
- **Pattern Match**: Detects any variation of `npm run init-db`
- **Blocks**: Returns exit code 1 to prevent execution
- **Notifies**: Shows clear error message explaining the alternative

## How to Override (When Needed)

If you genuinely need to run `init-db` on a fresh database:

1. **Temporarily disable hook**: Comment out the hook in `settings.json`
2. **Run init-db**: `npm run init-db`
3. **Re-enable hook**: Uncomment the hook configuration
4. **Restart Claude Code**: Reload settings

## Safe Alternative Commands

```bash
npm run migrate      # Apply schema changes to existing database
npm run init-db      # BLOCKED - Only for fresh installs
```

## Testing the Hook

Try running this command (it should be blocked):

```bash
npm run init-db
```

Expected output:
```
❌ BLOCK: Use "npm run migrate" for schema changes. init-db only for fresh installs (wipes all data).
```

## Troubleshooting

**Hook not working?**
1. Verify `settings.json` syntax is valid JSON
2. Restart Claude Code after making changes
3. Check Claude Code version supports hooks (v0.3.0+)

**Need to bypass for legitimate fresh install?**
- Run the command directly in your terminal (outside Claude Code)
- Or temporarily disable the hook as described above

## Related Documentation

- `/CLAUDE.md` - Database Schema Changes section
- `/app/public/scripts/migrations/` - Migration files location
- `/docs/WORKFLOWS.md` - Development workflow patterns
