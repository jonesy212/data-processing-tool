<!-- DEV_WORKFLOW_REFERENCE.md -->
# Development & Workflow Reference

This document provides a **comprehensive reference** for all scripts, utilities, and workflows available in the project. It includes **PNPM commands**, **TypeScript utilities**, **backup/rollback procedures**, **snapshot management**, **corrections workflow**, and **progress tracking**. Examples are provided where applicable.

---

## 📁 Granular Backup & Rollback

The project includes a **TypeScript utility library** for granular backup and rollback at multiple levels:

- **Project-level**: Full backup of the project
- **Folder-level**: Backup specific folder
- **File-level**: Backup a specific file
- **Code block-level**: Backup a specific `interface`, `class`, or `function`  

### Example Usage

```ts
import { backupFile, rollbackFile, backupCodeBlock, restoreCodeBlock } from './GranularBackupSystem';

// Backup
backupFile('src/app/models/UserEntity.ts');
backupCodeBlock('src/app/models/UserEntity.ts', 'interface UserEntity');

// Rollback if needed
rollbackFile('src/app/models/UserEntity.ts');
restoreCodeBlock('src/app/models/UserEntity.ts', 'interface UserEntity');


// 🚀 Development & Build
| Command      | Purpose                  | Usage        |
| ------------ | ------------------------ | ------------ |
| `pnpm dev`   | Start development server | `pnpm dev`   |
| `pnpm build` | Build for production     | `pnpm build` |
| `pnpm start` | Start production server  | `pnpm start` |
| `pnpm lint`  | Run ESLint               | `pnpm lint`  |


// 🔍 Code Analysis & Quality

| Command                          | Purpose                           | Usage                            |
| -------------------------------- | --------------------------------- | -------------------------------- |
| `pnpm analyze:duplicates`        | Find duplicate code               | `pnpm analyze:duplicates`        |
| `pnpm analyze:dependencies`      | Analyze dependency issues         | `pnpm analyze:dependencies`      |
| `pnpm analyze:all`               | Run all code analysis             | `pnpm analyze:all`               |
| `pnpm analyze:errors`            | Analyze various error types       | `pnpm analyze:errors`            |
| `pnpm analyze:build-errors`      | Analyze build errors specifically | `pnpm analyze:build-errors`      |
| `pnpm analyze:ts-errors`         | Analyze TypeScript errors         | `pnpm analyze:ts-errors`         |
| `pnpm analyze:file`              | Analyze specific file errors      | `pnpm analyze:file`              |
| `pnpm analyze:typescript-errors` | TypeScript error analysis         | `pnpm analyze:typescript-errors` |
| `pnpm type-check`                | TypeScript type checking          | `pnpm type-check`                |
| `pnpm lint:types`                | TypeScript linting                | `pnpm lint:types`                |
| `pnpm test:types`                | Run type checks & analysis        | `pnpm test:types`                |
| `pnpm validate:build`            | Full validation before build      | `pnpm validate:build`            |
| `pnpm analyze`                   | Run comprehensive error analysis  | `pnpm analyze`                   |


// 🖥️ Backup & Rollback Commands
| Command                              | Purpose                         | Usage
| ------------------------------------ | ------------------------------- | ------------------------------- | ------------------------------- | ------------------------------------------------------------- |
| `pnpm backup:project`                | Full project backup             | `pnpm backup:project`                                         |
| `pnpm backup:folder <folder>`        | Backup specific folder          | `pnpm backup:folder src/app/models`                           |
| `pnpm backup:file <file>`            | Backup specific file            | `pnpm backup:file src/app/models/UserEntity.ts`               |
| `pnpm backup:block <file> <block>`   | Backup interface/class/function | `pnpm backup:block src/app/models/UserEntity.ts UserEntity`   |
| `pnpm rollback:project`              | Restore full project            | `pnpm rollback:project`                                       |
| `pnpm rollback:folder <folder>`      | Restore folder                  | `pnpm rollback:folder src/app/models`                         |
| `pnpm rollback:file <file>`          | Restore file                    | `pnpm rollback:file src/app/models/UserEntity.ts`             |
| `pnpm rollback:block <file> <block>` | Restore code block              | `pnpm rollback:block src/app/models/UserEntity.ts UserEntity` |


// 📸 Snapshot Management

| Command                   | Purpose                        | Usage                     |
| ------------------------- | ------------------------------ | ------------------------- |
| `pnpm snapshots:generate` | Generate application snapshots | `pnpm snapshots:generate` |
| `pnpm snapshots:clean`    | Clean up old snapshots         | `pnpm snapshots:clean`    |
| `pnpm data:reset`         | Reset development data         | `pnpm data:reset`         |


// 🛠️ Corrections & Fixes Workflow
| Command                               | Purpose                           | Usage                                 |
| ------------------------------------- | --------------------------------- | ------------------------------------- |
| `pnpm generate:corrections`           | Full code correction analysis     | `pnpm generate:corrections`           |
| `pnpm generate:corrections:critical`  | Only critical errors              | `pnpm generate:corrections:critical`  |
| `pnpm generate:corrections:snapshots` | Snapshot folder focus             | `pnpm generate:corrections:snapshots` |
| `pnpm generate:corrections:quick`     | Quick fixes (<5 minutes)          | `pnpm generate:corrections:quick`     |
| `pnpm generate:corrections:docs`      | Output corrections to docs        | `pnpm generate:corrections:docs`      |
| `pnpm fix:critical`                   | Fix critical errors automatically | `pnpm fix:critical`                   |



🔄 Recommended Daily Workflow
Before Committing Code
# Run pre-commit checks
pnpm pre-commit

# Optional detailed analysis
pnpm generate:corrections:quick



# When Working with Snapshots
# Focus on snapshot problems
pnpm generate:corrections:snapshots

# Start development
pnpm dev:with-snapshot-fixes


Before Production Build
# Full validation
pnpm validate:build

# Or step by step
pnpm analyze:all
pnpm type-check
pnpm build


Configuration Management
# Sync config files
pnpm config:sync

# Rollback if needed
pnpm config:rollback

# Verify sync
pnpm config:verify


💡 Output Locations

Project Analysis: ./analysis/

Corrections: ./corrections/ or ./docs/corrections/

Roadmaps: ./roadmaps/

Project Trees: Root, text/JSON/Markdown formats

Configuration Backups: ./.config-backups/

⚡ Tips

Use pnpm quick:fixes for fast wins.

Run pnpm generate:corrections:critical before major changes.

Snapshot-focused commands are useful for persistence-related features.

All correction commands generate detailed Markdown reports with examples.

Run pnpm config:sync after adding new path aliases.



continuously updateable reference** for:

- Backup/rollback system  
- PNPM development & build commands  
- Snapshots  
- Corrections workflow  
- Progress tracking  
- Recommended workflows  

---