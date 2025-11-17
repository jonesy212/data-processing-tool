<!-- DEV_COMMANDS.md -->
# Development Commands Reference

This document provides a complete reference of all available scripts in the project with explanations and usage examples.

## 🚀 Development & Build

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm dev` | Start development server | `pnpm dev` |
| `pnpm build` | Build for production | `pnpm build` |
| `pnpm start` | Start production server | `pnpm start` |
| `pnpm lint` | Run ESLint | `pnpm lint` |

## 🔍 Code Analysis & Quality

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm analyze:duplicates` | Find duplicate code | `pnpm analyze:duplicates` |
| `pnpm analyze:dependencies` | Analyze dependency issues | `pnpm analyze:dependencies` |
| `pnpm analyze:all` | Run all code analysis | `pnpm analyze:all` |
| `pnpm analyze:errors` | Analyze various error types | `pnpm analyze:errors` |
| `pnpm analyze:build-errors` | Analyze build errors specifically | `pnpm analyze:build-errors` |
| `pnpm analyze:ts-errors` | Analyze TypeScript errors | `pnpm analyze:ts-errors` |
| `pnpm analyze:file` | Analyze specific file errors | `pnpm analyze:file` |
| `pnpm analyze:typescript-errors` | TypeScript error analysis | `pnpm analyze:typescript-errors` |
| `pnpm type-check` | TypeScript type checking | `pnpm type-check` |
| `pnpm lint:types` | TypeScript linting | `pnpm lint:types` |
| `pnpm test:types` | Run type checks & analysis | `pnpm test:types` |
| `pnpm validate:build` | Full validation before build | `pnpm validate:build` |
| `pnpm analyze` | Run comprehensive error analysis | `pnpm analyze` |


## 🧪 Testing

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm test` | Run Vitest tests | `pnpm test` |
| `pnpm test:ui` | Run Vitest with UI | `pnpm test:ui` |
| `pnpm test:run` | Run Vitest once | `pnpm test:run` |
| `pnpm test:coverage` | Run tests with coverage | `pnpm test:coverage` |
| `pnpm test:watch` | Run tests in watch mode | `pnpm test:watch` |
| `pnpm test:jest` | Run Jest tests | `pnpm test:jest` |
| `pnpm test:jest:watch` | Run Jest in watch mode | `pnpm test:jest:watch` |
| `pnpm test:jest:coverage` | Run Jest with coverage | `pnpm test:jest:coverage` |
| `pnpm test:error-system` | Test error analysis system | `pnpm test:error-system` |


## 📊 Project Structure & Roadmaps

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm generate:tree` | Generate project tree (text) | `pnpm generate:tree` |
| `pnpm generate:tree:text` | Generate text format tree | `pnpm generate:tree:text` |
| `pnpm generate:tree:markdown` | Generate markdown format tree | `pnpm generate:tree:markdown` |
| `pnpm generate:tree:json` | Generate JSON format tree | `pnpm generate:tree:json` |
| `pnpm generate:roadmaps` | Generate development roadmaps | `pnpm generate:roadmaps` |
| `pnpm generate:roadmaps:custom` | Generate custom roadmaps | `pnpm generate:roadmaps:custom "project description"` |
| `pnpm generate:analysis` | Generate project analysis | `pnpm generate:analysis` |
| `pnpm tree` | Generate project tree | `pnpm tree` |
| `pnpm tree:json` | Generate JSON tree | `pnpm tree:json` |
| `pnpm tree:markdown` | Generate markdown tree | `pnpm tree:markdown` |

## 🛠️ Code Corrections & Fixes

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm generate:corrections` | **Full code correction analysis** - Finds compilation errors, structural issues, and security problems | `pnpm generate:corrections` |
| `pnpm generate:corrections:critical` | **Critical errors only** - Shows only blocking compilation errors | `pnpm generate:corrections:critical` |
| `pnpm generate:corrections:snapshots` | **Snapshot folder focus** - Analyzes issues in the snapshot folder specifically | `pnpm generate:corrections:snapshots` |
| `pnpm generate:corrections:quick` | **Quick fixes only** - Shows easy wins that take <5 minutes each | `pnpm generate:corrections:quick` |
| `pnpm generate:corrections:docs` | **Generate to docs folder** - Outputs corrections to ./docs/corrections/ | `pnpm generate:corrections:docs` |
| `pnpm fix:critical` | Fix critical errors automatically | `pnpm fix:critical` |
| `pnpm fix:react-native` | Fix React Native specific issues | `pnpm fix:react-native` |


## 🔧 Configuration Management

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm config:sync` | Sync all configuration files | `pnpm config:sync` |
| `pnpm config:rollback` | Rollback configuration changes | `pnpm config:rollback` |
| `pnpm config:backup:list` | List available backups | `pnpm config:backup:list` |
| `pnpm config:verify` | Verify configuration sync | `pnpm config:verify` |
| `pnpm config:git-rollback` | Git-based configuration rollback | `pnpm config:git-rollback` |


## 🔄 Development Workflows

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm dev:with-analysis` | Start dev server after project analysis | `pnpm dev:with-analysis` |
| `pnpm dev:with-corrections` | **Start dev after full correction analysis** - Comprehensive check | `pnpm dev:with-corrections` |
| `pnpm dev:with-critical-fixes` | **Start dev after critical error check** - Fast safety check | `pnpm dev:with-critical-fixes` |
| `pnpm dev:with-snapshot-fixes` | **Start dev after snapshot analysis** - Focus on snapshot issues | `pnpm dev:with-snapshot-fixes` |
| `pnpm dev:with-tracking` | Start dev with error tracking | `pnpm dev:with-tracking` |
| `pnpm dev:with-quality` | Start dev with quality analysis | `pnpm dev:with-quality` |
| `pnpm dev:correction-roadmap` | Generate correction roadmap | `pnpm dev:correction-roadmap` |
| `pnpm build:with-analysis` | Build after running all analysis | `pnpm build:with-analysis` |
| `pnpm build:with-quality` | Build with quality checks | `pnpm build:with-quality` |


## 📸 Snapshot Management

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm snapshots:generate` | Generate application snapshots | `pnpm snapshots:generate` |
| `pnpm snapshots:clean` | Clean up old snapshots | `pnpm snapshots:clean` |
| `pnpm data:reset` | Reset development data | `pnpm data:reset` |

## ⚡ Quick Actions

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm quick:fixes` | **Show quick fixes** - Easy wins under 5 minutes (TypeScript code fixes) | `pnpm quick:fixes` |
| `pnpm scan:full` | Full project scan | `pnpm scan:full` |
| `pnpm review:roadmap` | Review development roadmap | `pnpm review:roadmap` |
| `pnpm review:file` | Review specific file | `pnpm review:file` |
| `pnpm mark:done` | Mark tasks as done | `pnpm mark:done` |

## 📈 Progress Tracking

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm track:progress` | Check progress report | `pnpm track:progress` |
| `pnpm track:history` | Check error history | `pnpm track:history` |

## 🔒 Pre-commit & Pre-push Hooks

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm pre-commit` | Run before committing code | `pnpm pre-commit` |
| `pnpm pre-push` | Run before pushing code | `pnpm pre-push` |
| `pnpm prestart` | Run before starting dev server | `pnpm prestart` |
| `pnpm pretest` | Run before tests | `pnpm pretest` |
| `pnpm prebuild` | Run before build | `pnpm prebuild` |

## 📱 Mobile & React Native

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm start:mobile` | Start React Native packager | `pnpm start:mobile` |
| `pnpm android` | Run Android app | `pnpm android` |
| `pnpm ios` | Run iOS app | `pnpm ios` |

## 🌐 Web & React Scripts

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm start_react` | Start React development server | `pnpm start_react` |
| `pnpm build_react` | Build React app | `pnpm build_react` |
| `pnpm web` | Build and serve React app | `pnpm web` |
| `pnpm eject` | Eject from Create React App | `pnpm eject` |

## 🖥️ Server & Backend

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm server` | Start backend server | `pnpm server` |
| `pnpm ollama` | Run Ollama AI model | `pnpm ollama` |

## 🏗️ CI & Quality

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm ci:quality` | Run quality checks for CI | `pnpm ci:quality` |

## 🎯 Recommended Workflows

### Daily Development
```bash
# Quick safety check before starting
pnpm dev:with-critical-fixes

# Or comprehensive analysis if working on major changes
pnpm dev:with-corrections






Before Committing Code
bash
# Run pre-commit checks
pnpm pre-commit

# If you want more detailed analysis
pnpm generate:corrections:quick
When You Have Snapshot Issues
bash
# Focus specifically on snapshot problems
pnpm generate:corrections:snapshots

# Then start development
pnpm dev:with-snapshot-fixes
Before Production Build
bash
# Full validation
pnpm validate:build

# Or step by step
pnpm analyze:all
pnpm type-check
pnpm build
📁 Output Locations
Project Analysis: ./analysis/

Corrections: ./corrections/ (or ./docs/corrections/ for docs version)

Roadmaps: ./roadmaps/

Project Trees: Various formats in project root

💡 Tips
Use pnpm quick:fixes for fast wins when you have limited time

Run pnpm generate:corrections:critical before major changes to catch blocking issues

The snapshot-focused commands are particularly useful when working with data persistence features

All correction commands generate detailed markdown reports with code examples and fixes

text

## Final Clean Package.json:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "ollama": "ollama run llama2 ",
    "start_react": "react-scripts start",
    "build_react": "react-scripts build",
    "eject": "react-scripts eject",
    "server": "ts-node server/server.ts",
    "start:mobile": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "web": "react-scripts build && npx serve -s build",
    "postinstall": "patch-package",
    "analyze:duplicates": "tsx src/app/scripts/analyzeDuplicates.ts",
    "analyze:dependencies": "tsx src/app/scripts/analyzeDependencies.ts",
    "analyze:all": "pnpm analyze:duplicates && pnpm analyze:dependencies",
    "analyze:errors": "tsx src/app/scripts/analyze-errors.ts",
    "analyze:build-errors": "tsx src/app/scripts/analyze-errors.ts build",
    "analyze:ts-errors": "tsx src/app/scripts/analyze-errors.ts typescript",
    "analyze:file": "tsx src/app/scripts/analyze-errors.ts file",
    "build:with-quality": "pnpm analyze:all && pnpm build",
    "dev:with-quality": "pnpm analyze:patterns && pnpm dev",
    "ci:quality": "pnpm analyze:all --fail-on-issues",
    "fix:react-native": "tsx src/app/scripts/analyze-errors.ts file src/app/generators/corrections/analyzers/ReactNativeAnalyzer.ts",
    "test:error-system": "tsx app/scripts/test-error-analysis.ts",
    "analyze:typescript-errors": "tsx src/utils/BuildErrorHandler.ts --type-check",
    "fix:critical": "tsx src/utils/BuildErrorHandler.ts --fix-critical",
    "type-check": "tsc --noEmit",
    "lint:types": "tsc --noEmit --skipLibCheck",
    "generate:tree": "tsx src/app/scripts/generateTree.ts",
    "generate:tree:text": "tsx src/app/scripts/generateTree.ts text",
    "generate:tree:markdown": "tsx src/app/scripts/generateTree.ts markdown",
    "generate:tree:json": "tsx src/app/scripts/generateTree.ts json",
    "generate:roadmaps": "tsx src/app/scripts/generateRoadmaps.ts",
    "generate:roadmaps:custom": "tsx src/app/scripts/generateRoadmaps.ts",
    "generate:analysis": "tsx src/app/scripts/generateTree.ts \"project analysis\" --output ./analysis",
    "dev:with-analysis": "pnpm generate:tree:json && pnpm dev",
    "build:with-analysis": "pnpm analyze:all && pnpm build",
    "snapshots:generate": "tsx src/app/scripts/generateSnapshots.ts",
    "snapshots:clean": "tsx src/app/scripts/cleanSnapshots.ts",
    "data:reset": "tsx src/app/scripts/resetDevelopmentData.ts",
    "test:types": "pnpm type-check && pnpm analyze:all",
    "validate:build": "pnpm test:types && pnpm build",
    "generate:corrections": "tsx src/app/generators/corrections/CorrectionGenerator.ts",
    "generate:corrections:critical": "tsx src/app/generators/corrections/CorrectionGenerator.ts --critical",
    "generate:corrections:snapshots": "tsx src/app/generators/corrections/CorrectionGenerator.ts --snapshots",
    "generate:corrections:quick": "tsx src/app/generators/corrections/CorrectionGenerator.ts --quick",
    "generate:corrections:docs": "tsx src/app/generators/corrections/CorrectionGenerator.ts --output ./docs/corrections",
    "dev:with-corrections": "pnpm generate:corrections && pnpm dev",
    "dev:with-critical-fixes": "pnpm generate:corrections:critical && pnpm dev",
    "dev:with-snapshot-fixes": "pnpm generate:corrections:snapshots && pnpm dev",
    "quick:fixes": "pnpm generate:corrections:quick && echo '✅ Check ./corrections/quick-fixes.md for easy wins (zsh commands)'",
    "track:progress": "echo 'Check ./error-tracking/progress-report.md'",
    "track:history": "echo 'Check ./error-tracking/error-history.json'",
    "dev:with-tracking": "pnpm generate:corrections && pnpm track:progress && pnpm dev",
    "dev:correction-roadmap": "pnpm run scan:full && pnpm run review:roadmap",
    "scan:full": "tsx scripts/devCorrectionRoadmap.ts scan",
    "review:roadmap": "tsx scripts/devCorrectionRoadmap.ts review",
    "review:file": "tsx scripts/devCorrectionRoadmap.ts file",
    "mark:done": "tsx scripts/devCorrectionRoadmap.ts done",
    "pre-push": "pnpm analyze:all && pnpm type-check",
    "pre-commit": "pnpm lint && pnpm type-check",
    "analyze": "ts-node src/app/generators/corrections/CorrectionGenerator.ts",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:jest": "jest",
    "test:jest:watch": "jest --watch",
    "test:jest:coverage": "jest --coverage",
    "config:sync": "node scripts/sync-configs.js",
    "config:rollback": "node scripts/rollback-configs.js",
    "config:backup:list": "node scripts/rollback-configs.js --list",
    "config:verify": "node scripts/validate-configs.js",
    "config:git-rollback": "node scripts/rollback-configs.js --git",
    "tree": "ts-node src/app/scripts/generateTree.ts",
    "tree:json": "ts-node src/app/scripts/generateTree.ts json",
    "tree:markdown": "ts-node src/app/scripts/generateTree.ts markdown",
    "prestart": "pnpm run config:sync",
    "pretest": "pnpm run config:sync",
    "prebuild": "pnpm run config:sync"
  }
}



Before Committing Code
bash
# Run pre-commit checks
pnpm pre-commit

# If you want more detailed analysis
pnpm generate:corrections:quick
When You Have Snapshot Issues
bash
# Focus specifically on snapshot problems
pnpm generate:corrections:snapshots

# Then start development
pnpm dev:with-snapshot-fixes
Before Production Build
bash
# Full validation
pnpm validate:build

# Or step by step
pnpm analyze:all
pnpm type-check
pnpm build
Configuration Management
bash
# Sync all config files
pnpm config:sync

# If something breaks, rollback
pnpm config:rollback

# Verify configs are in sync
pnpm config:verify
📁 Output Locations
Project Analysis: ./analysis/

Corrections: ./corrections/ (or ./docs/corrections/ for docs version)

Roadmaps: ./roadmaps/

Project Trees: Various formats in project root

Configuration Backups: ./.config-backups/

💡 Tips
Use pnpm quick:fixes for fast wins when you have limited time

Run pnpm generate:corrections:critical before major changes to catch blocking issues

The snapshot-focused commands are particularly useful when working with data persistence features

All correction commands generate detailed markdown reports with code examples and fixes

Use pnpm config:sync after adding new path aliases to keep all configs synchronized

The configuration management system automatically creates backups before making changes