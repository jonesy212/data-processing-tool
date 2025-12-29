# Import Fixer Commands Reference

## Overview

The **Import Fixer** tool is a comprehensive utility for detecting and fixing import issues in TypeScript/JavaScript projects. It identifies broken or incorrect imports, suggests fixes, and provides safe automation with built‑in backup and rollback capabilities.

---

## Available Commands

### 1. Scan and Analysis Commands

These commands analyze your project for import issues **without making changes**.

| Command              | Description                                | Usage                         |
| -------------------- | ------------------------------------------ | ----------------------------- |
| `fix-imports:scan`   | Scan project and generate a report only    | `pnpm run fix-imports:scan`   |
| `fix-imports:report` | Generate a detailed import analysis report | `pnpm run fix-imports:report` |
| `import:scan`        | Advanced scan with custom configuration    | `pnpm run import:scan`        |
| `import:report`      | Generate comprehensive import reports      | `pnpm run import:report`      |

---

### 2. Preview and Dry‑Run Commands

Preview what changes would be made **without applying them**.

| Command               | Description                           | Usage                          |
| --------------------- | ------------------------------------- | ------------------------------ |
| `fix-imports:dry-run` | Show what would change (safe preview) | `pnpm run fix-imports:dry-run` |
| `fix-imports:preview` | Preview all suggested fixes           | `pnpm run fix-imports:preview` |

---

### 3. Safe Fixing Commands (Recommended)

Apply fixes with safety features and automatic backups.

| Command            | Description                          | Usage                       | Safety Features               |
| ------------------ | ------------------------------------ | --------------------------- | ----------------------------- |
| `fix-imports:safe` | Apply high‑confidence fixes only     | `pnpm run fix-imports:safe` | Backups, high‑confidence only |
| `fix-imports`      | Default safe fixing (same as `safe`) | `pnpm run fix-imports`      | Backups, high‑confidence only |

---

### 4. Advanced Fixing Commands (Use with Caution)

Apply **all** suggested fixes. Use only when safe fixes do not resolve issues.

| Command             | Description               | Usage                        | Risk Level |
| ------------------- | ------------------------- | ---------------------------- | ---------- |
| `fix-imports:all`   | Apply all suggested fixes | `pnpm run fix-imports:all`   | High       |
| `fix-imports:force` | Force apply all fixes     | `pnpm run fix-imports:force` | High       |

---

### 5. Rollback and Recovery Commands

Revert changes made by the Import Fixer.

| Command                | Description                 | Usage                           |
| ---------------------- | --------------------------- | ------------------------------- |
| `fix-imports:rollback` | Rollback all previous fixes | `pnpm run fix-imports:rollback` |

---

### 6. Interactive and Debug Commands

Manual review and debugging tools.

| Command                   | Description                        | Usage                              |
| ------------------------- | ---------------------------------- | ---------------------------------- |
| `fix-imports:interactive` | Interactive mode for manual review | `pnpm run fix-imports:interactive` |
| `fix-imports:debug`       | Debug import issues                | `pnpm run fix-imports:debug`       |
| `import:fix`              | Manual import fixing               | `pnpm run import:fix`              |

---

### 7. Validation and Testing Commands

Verify fixes and test your project.

| Command           | Description                    | Usage                      |
| ----------------- | ------------------------------ | -------------------------- |
| `test:types`      | Run type checking and analysis | `pnpm run test:types`      |
| `debug:ts-errors` | Debug TypeScript errors        | `pnpm run debug:ts-errors` |

---

### 8. Utility Commands

Additional utilities for project maintenance.

| Command              | Description              | Usage                         |
| -------------------- | ------------------------ | ----------------------------- |
| `fix:filename-cases` | Fix filename case issues | `pnpm run fix:filename-cases` |

---

## Recommended Workflow

### Standard Safe Workflow

Use this workflow for most import‑fixing scenarios:

```bash
# 1. Scan to identify issues
pnpm run fix-imports:scan

# 2. Preview proposed changes
pnpm run fix-imports:dry-run

# 3. Apply safe fixes only
pnpm run fix-imports:safe

# 4. Test the project
pnpm run test:types

# 5. Re-scan if issues persist
pnpm run fix-imports:scan
```

---

### Advanced Workflow (When Safe Fixes Aren’t Enough)

```bash
# 1. Scan and review issues
pnpm run fix-imports:scan

# 2. Review each issue interactively
pnpm run fix-imports:interactive

# 3. Apply all fixes (automatic backups enabled)
pnpm run fix-imports:all

# 4. Test immediately
pnpm run test:types

# 5. Roll back if problems occur
pnpm run fix-imports:rollback
```

---

### Emergency Rollback

```bash
# Roll back all changes made by Import Fixer
pnpm run fix-imports:rollback

# Verify rollback success
pnpm run fix-imports:scan
```

---

## Generated Reports

The Import Fixer generates reports in the `./reports/` directory:

| Report File                   | Description                        | Generated By                          |
| ----------------------------- | ---------------------------------- | ------------------------------------- |
| `import-fixes.md`             | Human‑readable fix recommendations | `fix-imports:scan`                    |
| `import-issues-detailed.json` | Raw issue data in JSON format      | `fix-imports:scan`                    |
| `fix-records.json`            | Record of all applied fixes        | `fix-imports:safe`, `fix-imports:all` |

---

## Safety Features

### Automatic Backups

* Every modified file is backed up to `./.import-fix-backups/`
* Backup files are timestamped (e.g. `FileName.1702512345678.bak`)
* Backups can be restored using the rollback command

### Fix Records

* All applied fixes are logged to `reports/fix-records.json`
* Records include:

  * Original import
  * New import
  * Line number
  * Timestamp
* Enables precise rollback of changes

### Confidence Levels

| Level  | Description                                   |
| ------ | --------------------------------------------- |
| High   | Clear path matches, auto‑applied in safe mode |
| Medium | Multiple possible matches, requires review    |
| Low    | No clear matches, manual fix required         |

---

## Command Examples

### Basic Usage

```bash
# Quick scan and safe fix
pnpm run fix-imports:scan
pnpm run fix-imports:safe

# Preview before applying
pnpm run fix-imports:dry-run --fix-all

# Interactive mode for complex projects
pnpm run fix-imports:interactive

# Roll back last changes
pnpm run fix-imports:rollback
```

---

## Integration with Development Workflow

```bash
# Pre-commit hook
pnpm run fix-imports:scan
pnpm run fix-imports:safe

# CI/CD pipeline
pnpm run fix-imports:scan
pnpm run test:types

# Post-merge cleanup
pnpm run fix-imports:all
pnpm run test:types
```

---

## Troubleshooting

### Common Issues

| Issue                                      | Solution                                    |
| ------------------------------------------ | ------------------------------------------- |
| "No issues found" but imports still broken | Run `pnpm run debug:ts-errors`              |
| Rollback fails                             | Manually check `./.import-fix-backups/`     |
| Type errors after fixes                    | Run `pnpm run test:types`                   |
| Script not found                           | Verify `package.json` scripts configuration |

---

## Getting Help

* Review reports in `./reports/`
* Inspect backups in `./.import-fix-backups/`
* Examine fix records in `reports/fix-records.json`
* Run debug commands: `pnpm run debug:ts-errors`

---

## File Locations

| Item          | Path                             |
| ------------- | -------------------------------- |
| Scripts       | `app/scripts/fix-imports.ts`     |
| Backups       | `./.import-fix-backups/`         |
| Reports       | `./reports/`                     |
| Configuration | `package.json` (scripts section) |

---

## Best Practices

* Always scan before applying fixes
* Use dry‑run to preview changes
* Start with safe mode and escalate only if necessary
* Test immediately after fixes
* Retain backups until verification is complete
* Use interactive mode for complex or uncertain fixes

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Maintainer:** Import Fixer Team
