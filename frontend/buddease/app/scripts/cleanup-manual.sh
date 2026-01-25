#!/bin/bash
# scripts/cleanup-manual.sh

echo "🧹 Manual Duplicate Cleanup"
echo "==========================="

# Files to check for duplicates
DUPLICATE_PATTERNS=(
  "run-report-tests.ts"
  "one-command-migration.sh"
  "*.fixer.ts"
  "*backup*.ts"
  "*migration*.sh"
)

echo "🔍 Checking for duplicates..."
echo ""

for pattern in "${DUPLICATE_PATTERNS[@]}"; do
  echo "📁 Pattern: $pattern"
  find . -name "$pattern" \
    -not -path "./node_modules/*" \
    -not -path "./.migration-backups/*" \
    -not -path "./.smart-backups/*" \
    -not -type l | while read -r file; do
    echo "   • $file"
  done
  echo ""
done

echo "🗑️  Removing known duplicates..."
echo "------------------------------"

# Remove specific duplicates
echo "1. Removing old run-report-tests.ts..."
find . -name "run-report-tests.ts" \
  -not -path "./scripts/typescript/testing/run-report-tests.ts" \
  -not -type l \
  -not -path "./node_modules/*" \
  -not -path "./.migration-backups/*" \
  -exec echo "   Removing: {}" \; \
  -delete

echo ""
echo "2. Removing old one-command-migration.sh..."
find . -name "one-command-migration.sh" \
  -not -path "./scripts/shell/backup/one-command-migration.sh" \
  -not -type l \
  -not -path "./node_modules/*" \
  -not -path "./.migration-backups/*" \
  -exec echo "   Removing: {}" \; \
  -delete

echo ""
echo "✅ Manual cleanup complete!"
echo ""
echo "📋 Verification:"
echo "---------------"
find . -name "run-report-tests.ts" -o -name "one-command-migration.sh" | \
  grep -v node_modules | \
  grep -v ".migration-backups" | \
  sort