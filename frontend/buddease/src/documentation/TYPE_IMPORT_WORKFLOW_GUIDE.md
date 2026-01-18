Type Import Fixer Workflow Guide
📋 Decision Tree: When to Use Which Tool


🚀 Scenario 1: Just Starting - Many Errors
You see: 47 errors: 'X' is a type and must be imported...

Step-by-Step Solution:
bash
# Step 1: See what you're dealing with
pnpm fix:types:dry

# Step 2: Fix everything at once  
pnpm fix:types

# Step 3: Verify everything is fixed
pnpm check:types:count
Expected Output:
text
🚀 UNIFIED TYPE IMPORT FIXER
============================
📊 Step 1: Running diagnostics...
📋 Step 2: Analysis Report
========================================
📁 Files affected: 12
📝 Total errors: 47
  • Namespace imports: 3
  • Type-only imports: 32
  • Mixed imports: 12

🔧 Fixing 47 errors...
✅ All fixed! Estimated time saved: 23.5 minutes
🎯 Scenario 2: Specific Issue - Namespace Imports
You see: '*' is a type and must be imported

bash
# Quick check for namespace issues
pnpm verify:namespace

# Target just namespace imports
pnpm fix:types:namespace

# Or preview first
pnpm fix:types:namespace:dry
🔍 Scenario 3: During Development - Quick Fix
You just added a new file with type imports

bash
# Quick check
pnpm check:types

# If errors found, fix them quickly
pnpm fix:types:quick
💾 Scenario 4: Safe Development Workflow
Before starting work each day:

bash
# Check for type issues
pnpm dev:types-check

# Or manually
pnpm fix:types:dry && pnpm dev
🛠️ Scenario 5: Pre-commit Hook
In your pre-commit hook or CI:

bash
# Fail if there are type import errors
pnpm pre-commit:types

# Or in CI
pnpm ci:types-check
⚠️ Scenario 6: Something Went Wrong
You applied fixes and something broke:

bash
# List available backups
pnpm backup:types:list

# Rollback last fix
pnpm backup:types:rollback

# Or restore from specific backup manually
cp .type-import-backups/file.ts.backup src/path/to/file.ts
📊 Detailed Usage Examples
Example 1: Mixed Import Scenario
File: src/components/UserProfile.tsx

typescript
// ❌ Before: Mixed imports causing errors
import { User, getUser, UserPreferences } from '@/core/types';
import * as Utils from '@/core/utils';
bash
# Analyze the problem
pnpm check:types | grep UserProfile.tsx

# See what the fixer will do
pnpm fix:types:dry

# Apply the fix
pnpm fix:types
After fix:

typescript
// ✅ After: Properly separated
import type { User, UserPreferences } from '@/core/types';
import { getUser } from '@/core/types';
import type * as Utils from '@/core/utils';
Example 2: CI/CD Pipeline
.github/workflows/type-check.yml:

yaml
name: Type Import Checks
on: [push, pull_request]

jobs:
  check-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
        
      - name: Check for type import errors
        run: |
          ERROR_COUNT=$(pnpm check:types:count)
          if [ "$ERROR_COUNT" -gt 0 ]; then
            echo "❌ Found $ERROR_COUNT type import errors"
            echo "Running fixer in dry-run mode to show issues..."
            pnpm fix:types:dry
            exit 1
          else
            echo "✅ No type import errors"
          fi
🎯 Quick Reference Card
For Most Cases (90% of the time):
bash
# One command to rule them all
pnpm fix:types

# Want to see what it will do first?
pnpm fix:types:dry

# Super fast for small changes
pnpm fix:types:quick
For Specific Problems:
bash
# Just namespace imports (* as X)
pnpm fix:types:namespace

# Mixed imports (types + values together)
pnpm fix:types:mixed
For Safety & Recovery:
bash
# Preview before making changes
pnpm fix:types:dry

# List backups
pnpm backup:types:list

# Rollback if something goes wrong
pnpm backup:types:rollback
For CI/CD & Automation:
bash
# Count errors (returns number)
pnpm check:types:count

# Check and fail if errors exist
pnpm ci:types-check
📈 Success Metrics
Track your progress with these metrics:

bash
#!/bin/bash
# scripts/track-type-progress.sh

LAST_WEEK_COUNT=47  # Your starting point
CURRENT_COUNT=$(pnpm check:types:count)

echo "📊 Type Import Error Tracking"
echo "============================="
echo "Last week: $LAST_WEEK_COUNT errors"
echo "This week: $CURRENT_COUNT errors"
echo ""

if [ "$CURRENT_COUNT" -eq 0 ]; then
  echo "🎉 Perfect! No type import errors!"
elif [ "$CURRENT_COUNT" -lt "$LAST_WEEK_COUNT" ]; then
  REDUCTION=$((LAST_WEEK_COUNT - CURRENT_COUNT))
  echo "📈 Improvement: Reduced by $REDUCTION errors"
  echo "💪 Keep going!"
else
  echo "⚠️  Need attention: $CURRENT_COUNT errors remaining"
  echo "💡 Run: pnpm fix:types:dry"
fi
🆘 Troubleshooting Common Issues
Issue: "Command not found"
bash
# Make sure scripts are in the right place
ls -la app/scripts/ | grep -E "(type|fix)"

# If missing, check the paths
find . -name "*type*import*" -type f

# Common locations:
# - app/scripts/
# - src/app/scripts/
# - scripts/
Issue: "Permission denied"
bash
# Make TypeScript scripts executable
chmod +x app/scripts/*.ts

# Or run through tsx (safer)
tsx app/scripts/fix-all-type-imports.ts
Issue: "Too many arguments"
bash
# Some shells need special handling
pnpm run "fix:types" -- --dry-run

# Or use quotes
pnpm "fix:types:dry"
Issue: "Script hangs or times out"
bash
# Run with verbose output
pnpm fix:types:dry --verbose

# Check TypeScript compilation separately
pnpm tsc --noEmit --skipLibCheck 2>&1 | head -20

# Look for infinite loops or large files
🏗️ Integration with Your Existing Workflow
Current State Analysis:
You have three overlapping systems:

SmartBackupPhaseSystem - General error fixing with backup

fix-type-imports-with-backup.ts - Specialized type import fixer

fix-all-type-imports.ts - Another type import fixer

Migration Path:
bash
# Phase 1: Use unified fixer for all new work
pnpm fix:types

# Phase 2: Update CI/CD to use new commands
# Replace: pnpm fix:types:comprehensive
# With:    pnpm fix:types

# Phase 3: Clean up old scripts gradually
Backward Compatibility Script:
bash
#!/bin/bash
# scripts/legacy-wrapper.sh

COMMAND="$1"

case "$COMMAND" in
  "fix:types:all"|"fix:types:comprehensive")
    echo "⚠️  Legacy command detected. Using new unified fixer..."
    pnpm fix:types "${@:2}"
    ;;
  "fix:types:dry-run")
    echo "⚠️  Legacy command detected. Using new dry-run..."
    pnpm fix:types:dry "${@:2}"
    ;;
  *)
    echo "Unknown legacy command: $COMMAND"
    echo "Try: pnpm fix:types"
    exit 1
    ;;
esac
🎯 The Bottom Line
For Your Team:
Use pnpm fix:types for everything unless you have a specific reason to use a specialized tool.

The Unified Fixer Will:
Detect all types of type import errors

Fix them in the right order (namespace → regular → mixed)

Create backups automatically

Provide detailed reporting

Verify the fixes were applied

Eliminates Confusion:
No more choosing between similar tools

Consistent experience for the entire team

Clear error messages and recovery options

Integrated backup and rollback