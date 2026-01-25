#!/bin/bash
# Auto-generated fix script
# Created: 2026-01-17T06:32:21.748Z

echo "🔧 EXECUTING FIX PRIORITY PLAN"
echo "================================"

echo "1. Fixing src (445 errors)"
echo "   Priority: 6/10, Estimated: extensive (90+ min)"

echo "   Running: npx tsc --noEmit src/core/actions/DynamicConfigActions.ts src/core/api/ApiMarkdown.ts src/core/api/ApiProxy.ts 2>&1 | head -20"
npx tsc --noEmit src/core/actions/DynamicConfigActions.ts src/core/api/ApiMarkdown.ts src/core/api/ApiProxy.ts 2>&1 | head -20

echo "   Running: grep -n "TS1005" ts-errors.json | head -5"
grep -n "TS1005" ts-errors.json | head -5

echo "✅ Done with ${item.folder}"
echo ""
echo "2. Fixing scripts/migration-backup (2 errors)"
echo "   Priority: 7/10, Estimated: quick (5-15 min)"

echo "   Running: npx tsc --noEmit scripts/migration-backup/SafeMigrationWrapper.ts 2>&1 | head -20"
npx tsc --noEmit scripts/migration-backup/SafeMigrationWrapper.ts 2>&1 | head -20

echo "   Running: grep -n "TS1005" ts-errors.json | head -5"
grep -n "TS1005" ts-errors.json | head -5

echo "✅ Done with ${item.folder}"
echo ""
echo "3. Fixing app (1 errors)"
echo "   Priority: 10/10, Estimated: quick (5-15 min)"

echo "   Running: npx tsc --noEmit app/scripts/UnifiedScriptManager.ts 2>&1 | head -20"
npx tsc --noEmit app/scripts/UnifiedScriptManager.ts 2>&1 | head -20

echo "✅ Done with ${item.folder}"
echo ""
echo "🎉 All fixes completed!"