<!-- phase-backup-and-interface-fix-system.md -->
### Interface Import Auto-Fix & Rollback

This project includes a backup-backed interface import auto-fix system with
restore points, AST diff previews, and git-aware safety checks.

See:
→ docs/phase-backup-and-interface-fix-system.md


# Phase Backup & Interface Import Auto-Fix System

## Overview

This system provides **safe, reversible, and auditable** automation for fixing
TypeScript interface import issues. Every change is protected by restore points
and can be rolled back at file, folder, or project scope.

Key guarantees:
- No destructive changes without backup
- Git-aware short-circuiting
- Restore points by timestamp
- AST-level diff previews
- Parallel fixes with safe rollback

---

## Components

### PhaseBackupSystem

Responsible for:
- Creating backups
- Managing restore points
- Rolling back changes safely
- Retaining historical metadata

**Backups are stored in:**

.phase-backups/
├── phases/
├── entities/
├── milestones/
├── backup-records.json
└── restore-points.json

---

### InterfaceImportFixRunner

Coordinates:
- File scanning
- Backup creation
- AST analysis
- Interface import normalization
- Restore-on-failure behavior

---

## Workflow

1. Create restore point
2. Scan files for interface import issues
3. Generate AST diffs (optional preview)
4. Apply fixes in parallel
5. Roll back automatically on error

---

## CLI Usage

### Fix Interface Imports (Safe)

```bash
pnpm fix:interface-imports

pnpm fix:interface-imports --preview

pnpm fix:interface-imports --restore-last

pnpm fix:interface-imports --restore-point=1710289123456




Safety Guarantees

Automatic rollback on error

Meta-backup before restore

Checksum validation

Retention and cleanup policies

When to Use This System

✔ Large-scale refactors
✔ Interface consolidation
✔ Snapshot / state cleanup
✔ CI-safe automation

When NOT to Use

✖ One-off manual edits
✖ Experimental code without Git
✖ Files outside backup scope

Extensibility

Planned:

Restore-by-file

Restore-by-entity

Interactive CLI selection

HTML diff reportscommand