p# Complete Script Verification Checklist
Here's a systematic checklist to verify EVERY script works. We'll go category by category:



# 📋 Pre-Verification Setup
## Backup First: pnpm migration:backup "Pre-verification backup"

- Current Directory: Make sure you're in project root

- Dependencies: pnpm install (ensure all deps are installed)

# 🎯 Category 1: Type Import Fixers (Most Critical)
## Current Scripts (Before Migration)

```bash
# Test each fix:types script
[ ] pnpm fix:types --dry-run                    # Unified fixer
[ ] pnpm fix:types:dry                          # Dry run
[ ] pnpm fix:types:quick --dry-run              # Quick fixer
[ ] pnpm fix:types:namespace --dry-run          # Namespace fixer
[ ] pnpm fix:types:mixed --dry-run              # Mixed imports fixer
[ ] pnpm verify:types                           # Verification
Organized Scripts (After Migration)
bash
# Test organized versions
[ ] pnpm organized:fix:types --dry-run
[ ] pnpm organized:fix:types:namespace --dry-run
[ ] pnpm organized:fix:types:mixed --dry-run
[ ] pnpm organized:verify:types
Comparison Tests
bash
[ ] pnpm compare:scripts  # Compare old vs new
[ ] pnpm test:organized-scripts
📦 Category 2: Import Management
Current Import Scripts
bash
[ ] pnpm imports:deduplicate --dry-run
[ ] pnpm fix-imports --dry-run
[ ] pnpm fix-imports:dry-run
[ ] pnpm fix-imports:safe --dry-run
[ ] pnpm fix-imports:high --dry-run
[ ] pnpm fix-imports:all --dry-run
[ ] pnpm imports:cleanup
Organized Import Scripts
bash
[ ] pnpm organized:imports:deduplicate --dry-run
[ ] pnpm organized:imports:cleanup --dry-run
[ ] pnpm organized:imports:fix --dry-run
Interface Import Fixers
bash
[ ] pnpm fix:interface-imports:dry-run
[ ] pnpm fix:interface-imports:quick --dry-run
[ ] pnpm fix:interface-imports:preview
[ ] pnpm fix:interface-imports:safe --dry-run
[ ] pnpm fix:interface-imports:all --dry-run
🔍 Category 3: Code Quality & Analysis
Analysis Scripts
bash
[ ] pnpm analyze:ts-quick
[ ] pnpm analyze:ts-output
[ ] pnpm analyze:duplicates
[ ] pnpm analyze:dependencies
[ ] pnpm analyze:all
[ ] pnpm analyze:errors
[ ] pnpm analyze:ts-errors
[ ] pnpm analyze:ts-errors:advanced
Organized Quality Scripts
bash
[ ] pnpm organized:quality:analyze
[ ] pnpm organized:quality:circular
[ ] pnpm quality:analyze-errors
[ ] pnpm quality:circular
[ ] pnpm quality:code-smells --dry-run
[ ] pnpm quality:debug-ts --dry-run
🏗️ Category 4: Infrastructure & Workflow
Project Management
bash
[ ] pnpm project:discovery
[ ] pnpm project:assessment --dry-run
[ ] pnpm project:scope --dry-run
[ ] pnpm project:analyze --dry-run
[ ] pnpm project:metrics --dry-run
Workflow Management
bash
[ ] pnpm workflow:analyze --dry-run
[ ] pnpm workflow:list
[ ] pnpm workflow:start --dry-run
Bootstrap System
bash
[ ] pnpm bootstrap:analyze
[ ] pnpm bootstrap:plan
[ ] pnpm bootstrap:report --dry-run
Infrastructure Scripts
bash
[ ] pnpm infra:bootstrap --dry-run
[ ] pnpm infra:project-workflow --dry-run
[ ] pnpm infra:scaffold --dry-run --template test --name TestComponent
[ ] pnpm infra:database --dry-run
💾 Category 5: Backup & Recovery
Migration Backup System
bash
[ ] pnpm migration:backup "Test backup"
[ ] pnpm migration:list
[ ] pnpm migration:cleanup 1 --dry-run
Smart Backup System
bash
[ ] pnpm smart:dev-fix --dry-run
[ ] pnpm smart:status
[ ] pnpm smart:report --dry-run
[ ] pnpm backup:smart-rollback --dry-run
[ ] pnpm backup:utils --dry-run
[ ] pnpm backup:safe-fix --dry-run
Type Import Backups
bash
[ ] pnpm backup:types --dry-run
[ ] pnpm backup:types:list
📁 Category 6: File Management
bash
[ ] pnpm files:fix-names --dry-run
[ ] pnpm files:fix-comments --dry-run
[ ] pnpm files:verify-comments
[ ] pnpm fix:filename-cases --dry-run
[ ] pnpm fix:headers --dry-run
[ ] pnpm fix:comment-errors --dry-run
🧪 Category 7: Testing & Debug
TypeScript Debug
bash
[ ] pnpm debug:ts-errors --dry-run
[ ] pnpm fix-ts1109 --dry-run
[ ] pnpm debug-ts-error --dry-run
[ ] pnpm ts:strict
[ ] pnpm ts:strict-type
Snapshot Testing
bash
[ ] pnpm tsc:check-snapshots
[ ] pnpm tsc:snapshot-errors
[ ] pnpm fix:snapshots-first --dry-run
[ ] pnpm analyze:snapshots
[ ] pnpm check:snapshots
Diagnostic Tools
bash
[ ] pnpm diagnose:line332
[ ] pnpm view:problem-area
[ ] pnpm view:line332
[ ] pnpm fix:with-diagnosis --dry-run
⚙️ Category 8: Configuration & Setup
bash
[ ] pnpm tsconfig:check
[ ] pnpm tsconfig:fix --dry-run
[ ] pnpm config:sync --dry-run
[ ] pnpm config:verify
[ ] pnpm generate:tree --dry-run
[ ] pnpm generate:roadmaps --dry-run
🐚 Category 9: Shell Scripts
bash
[ ] bash scripts/shell/git/pre-commit.sh --dry-run
[ ] bash scripts/shell/build/check-snapshots.sh --dry-run
[ ] bash scripts/shell/dev/track-progress.sh --dry-run
[ ] bash scripts/shell/config/update-tsconfig.sh --dry-run
[ ] bash scripts/shell/git/sync-shared.sh --dry-run
🔄 Category 10: Migration & Organization
Smart Script Organizer
bash
[ ] pnpm script:analyze
[ ] pnpm script:stats
[ ] pnpm script:dry-run
[ ] pnpm script:dry-run --no-symlinks
[ ] pnpm script:show-symlinks
[ ] pnpm script:verify-symlinks
[ ] pnpm script:generate-update-guide
Migration Workflows
bash
[ ] pnpm migrate:scripts-dry
[ ] pnpm migration:dry-full
[ ] pnpm script:migrate-safe --dry-run
Safe Migration Wrapper
bash
[ ] pnpm migration:safe-run "echo 'Test command'"
[ ] pnpm script:safe-run --dry-run
[ ] pnpm script:safe-dry-run
🛠️ Category 11: Development & Build
Development Commands
bash
[ ] pnpm dev:safe
[ ] pnpm dev:with-check
[ ] pnpm dev:with-analysis
[ ] pnpm dev:quick
[ ] pnpm dev:web
[ ] pnpm dev:mobile --dry-run
Build Commands
bash
[ ] pnpm build:types
[ ] pnpm build:web --dry-run
[ ] pnpm build:all --dry-run
[ ] pnpm build:with-safety --dry-run
[ ] pnpm build:quick --dry-run
Linting & Formatting
bash
[ ] pnpm lint
[ ] pnpm lint:types
[ ] pnpm lint:fix --dry-run
[ ] pnpm lint:strict
[ ] pnpm format --dry-run
[ ] pnpm check:format
🧪 Category 12: Testing
bash
[ ] pnpm test:types
[ ] pnpm test:unit --dry-run
[ ] pnpm test:integration --dry-run
[ ] pnpm test:error-system --dry-run
[ ] pnpm test:imports
[ ] pnpm validate:build --dry-run
[ ] pnpm validate:ts-setup
🚀 Category 13: Deployment
bash
[ ] pnpm project:deploy-git --dry-run
[ ] pnpm deploy:safe --dry-run
[ ] pnpm ci:build --dry-run
[ ] pnpm ci:lint
[ ] pnpm ci:test --dry-run
[ ] pnpm ci:quality --dry-run
🔗 Category 14: Unified Script Manager
bash
[ ] pnpm scripts:list
[ ] pnpm scripts:workflow --dry-run
[ ] pnpm scripts:run type-imports:unified --dry-run
[ ] pnpm scripts:run imports:deduplicate --dry-run
[ ] pnpm scripts:run quality:analyze-errors --dry-run
📊 Category 15: Verification & Reporting
bash
[ ] pnpm type-check
[ ] pnpm check:types
[ ] pnpm check:types:count
[ ] pnpm verify:namespace
[ ] pnpm track:ts-progress
[ ] pnpm track:ts-history
[ ] pnpm report:ts-errors --dry-run
[ ] pnpm reports:quick --dry-run
⚠️ Category 16: Deprecated/Legacy Scripts
bash
# These should show deprecation warnings
[ ] pnpm fix:types:comprehensive
[ ] pnpm fix:types:all
[ ] pnpm fix:types:regular
[ ] pnpm fix:types:capture
[ ] pnpm fix:types:comprehensive-dry
[ ] pnpm fix:types:comprehensive-quick
[ ] pnpm fix:types:regular:dry
🚨 Emergency & Rollback Commands
bash
[ ] pnpm emergency:status
[ ] pnpm migration:list
[ ] pnpm rollback:list
[ ] pnpm rollback:latest --dry-run
[ ] pnpm rollback:to --dry-run
[ ] pnpm phase:rollback --dry-run
✅ Final Verification Tests
1. Quick Health Check
bash
[ ] pnpm dev:safe  # Should start dev server
[ ] pnpm type-check  # Should have minimal errors
[ ] pnpm lint  # Should pass
2. Migration Test
bash
[ ] pnpm migrate:test  # Test organized scripts
[ ] pnpm compare:scripts  # Compare old vs new
3. Critical Path Test
bash
# Most important workflow
[ ] pnpm fix:types --dry-run
[ ] pnpm verify:types
[ ] pnpm type-check
[ ] pnpm lint:types
[ ] pnpm build:types
4. Backup & Recovery Test
bash
[ ] pnpm migration:backup "Final verification backup"
[ ] pnpm migration:list  # Should show backup
[ ] pnpm script:verify-symlinks  # All symlinks should be healthy
📝 Documentation & Cleanup
bash
[ ] pnpm script:generate-update-guide
[ ] pnpm update:package-scripts
[ ] pnpm package:update-guide
[ ] ls -la symlink-report.json  # Should exist
[ ] ls -la scripts-analysis.json  # Should exist
[ ] ls -la package-update-guide.md  # Should exist
🎯 Completion Checklist
ALL scripts tested (use grep -c "pnpm" to count)

No broken symlinks (pnpm script:verify-symlinks)

Migration report generated (symlink-report.json)

Update guide created (package-update-guide.md)

Backup exists (pnpm migration:list)

All deprecation warnings work

Organized scripts work (pnpm test:organized-scripts)

Critical paths verified (dev, build, type-check, lint)

🚨 If Any Script Fails:
Check if it's a symlink issue: pnpm script:verify-symlinks

Check if file exists: ls -la [script-path]

Check package.json path: Is it pointing to correct location?

Try organized version: pnpm organized:[script-name]

Rollback if needed: pnpm migration:rollback [backup-id]

📊 Quick Verification Commands:
```bash
# Count total scripts
grep -c "pnpm" package.json

# List all script names
grep '"pnpm' package.json | cut -d'"' -f2 | sort

# Test critical scripts in batch
for script in "fix:types" "type-check" "lint" "dev:safe"; do
  echo "Testing: $script"
  pnpm $script --dry-run || true
done