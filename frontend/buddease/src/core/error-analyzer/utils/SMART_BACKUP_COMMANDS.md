<!-- SMART_BACKUP_COMMANDS.md -->
# Smart Backup System Commands Reference

This document provides a complete reference for the Smart Backup System - an intelligent backup management system that only creates backups when files actually change and provides production-safe backup points.

## 🧠 Smart Backup Workflows

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm smart:dev-fix` | **Incremental error fixing with smart backups** - Fix TypeScript/JavaScript errors incrementally, only creating backups when files actually change | `pnpm smart:dev-fix` |
| `pnpm smart:production-backup` | **Create production-safe backup point** - Create comprehensive backup when ALL errors are fixed, ready for deployment | `pnpm smart:production-backup "Release 1.0"` |
| `pnpm smart:status` | **Show backup system status** - Display current backup counts, production points, and system health | `pnpm smart:status` |
| `pnpm smart:cleanup` | **Clean up old backups** - Remove old backups while keeping recent ones, configurable via `.smart-backup-config.json` | `pnpm smart:cleanup --max-backups=10` |
| `pnpm smart:report` | **Generate detailed backup report** - Create comprehensive JSON report with statistics and recommendations | `pnpm smart:report` |

## ⚡ Quick Workflows

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm fix:smart` | **Quick smart fix alias** - Alias for `smart:dev-fix` for faster typing | `pnpm fix:smart` |
| `pnpm backup:production` | **Timestamped production backup** - Create production backup with automatic date stamping | `pnpm backup:production` |
| `pnpm restore:last` | **Restore from most recent backup** - Extract and restore the latest backup ID automatically | `pnpm restore:last` |

## 🔄 Integrated Workflows

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm dev:with-backup` | **Start dev server with backup safety** - Run smart error fixes before starting development server | `pnpm dev:with-backup` |
| `pnpm build:with-safety` | **Build with production backup** - Create backup point before building for production | `pnpm build:with-safety` |
| `pnpm deploy:safe` | **Safe deployment workflow** - Create backup, build, and deploy with rollback protection | `pnpm deploy:safe` |

## 🎯 Conditional Fixes

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm fix:imports-only` | **Import-specific error fixes** - Focus only on import-related issues (duplicates, missing imports, incorrect paths) | `pnpm fix:imports-only` |
| `pnpm fix:types-only` | **Type-specific error fixes** - Focus only on TypeScript type errors and type safety issues | `pnpm fix:types-only` |
| `pnpm fix:patterns-only` | **Pattern standardization fixes** - Focus only on entity pattern standardization across 57 entities | `pnpm fix:patterns-only` |

## 🔙 Rollback Management

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm rollback:latest` | **Rollback to latest production backup** - Execute rollback script from most recent production backup point | `pnpm rollback:latest` |
| `pnpm rollback:list` | **List available rollback points** - Show all production backup points available for rollback | `pnpm rollback:list` |
| `pnpm rollback:to` | **Restore specific backup** - Restore from a specific backup ID or entity backup | `pnpm rollback:to entity-1234567890.bak` |

## 🎯 Recommended Workflows

### Daily Development
```bash
# Quick smart fix before starting work
pnpm fix:smart

# Or comprehensive with backup safety
pnpm dev:with-backup

```

### Pre-Production Checklist
# 1. Fix all errors with smart backups
pnpm smart:dev-fix

# 2. Verify no errors remain
pnpm type-check

# 3. Create production backup
pnpm smart:production-backup "Pre-Production v1.2.0"

# 4. Build safely
pnpm build:with-safety


# Recovery When Something Breaks
# 1. List available rollback points
pnpm rollback:list

# 2. Check latest backup contents
ls -la .smart-backups/rollback/latest/

# 3. Rollback to working state
pnpm rollback:latest

# Focused Error Resolution
# When you know the specific issue type
pnpm fix:imports-only    # For import-related errors
pnpm fix:types-only      # For type-related errors  
pnpm fix:patterns-only   # For entity pattern standardization



``` bash
📁 Output Locations
Smart Backup System:

Backup files: .smart-backups/file-versions/

Production backup points: .smart-backups/production-points/

Rollback packages: .smart-backups/rollback/

System reports: .smart-backups/smart-report.json

Backup log: .smart-backups/backup-log.json

Configuration:

Main config: .smart-backup-config.json

Local overrides: .smart-backup-config.local.json (gitignored)

Environment configs: .smart-backup-config.dev.json, .smart-backup-config.prod.json




CLI Configuration Overrides:
bash
# Override config values via CLI
pnpm smart:dev-fix --max-backups=50 --backup-dir="./custom-backups"
pnpm smart:dev-fix --no-backup-on-change
pnpm smart:cleanup --max-backups=10