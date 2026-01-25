<!-- README-headers.md -->
# Header Fixer Scripts

## Conservative Fixer (`fixFilenameCases.ts`)
```bash
pnpm run fix:headers:conservative
pnpm run fix:headers:conservative:dry-run

Safe shebang additions (CLI scripts only)

Fixes filename comments (exact matches only)

Removes duplicate headers

NEVER renames files

Aggressive Fixer (fix-all-headers.ts)
bash
pnpm run fix:headers
pnpm run fix:headers:dry-run
All conservative fixes PLUS

Removes bare filename lines (without "//")

Ensures consistent formatting

Recommended Workflow
pnpm run fix:headers:conservative:dry-run - Preview safe changes

pnpm run fix:headers:conservative - Apply safe fixes

pnpm run fix:headers:dry-run - Preview additional fixes

pnpm run fix:headers - Complete cleanup

Or use the combined command:

bash
pnpm run fix:headers:all
text

This way:
- Each script explains its own role
- Users know when to use which one
- The help text guides them through the workflow
- You maintain both scripts for different use cases