#!/bin/bash
# scripts/migration-workflow/one-command-migration.sh

echo "🔄 One-Command Script Migration with Full Backup"
echo "============================================================"

# Step 1: Create backup
echo "📦 Step 1/4: Creating backup..."
BACKUP_RESULT=$(pnpm migration:backup "Full script migration - $(date)" 2>&1)
echo "$BACKUP_RESULT"

# Step 2: Analyze current state
echo "🔍 Step 2/4: Analyzing current script structure..."
pnpm script:analyze > scripts-analysis-before.json 2>&1

# Step 3: Dry run
echo "🧪 Step 3/4: Running dry run..."
pnpm script:dry-run 2>&1 | head -20

echo ""
echo "❓ Do you want to proceed with the migration? (y/N)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  # Step 4: Run migration
  echo "⚡ Step 4/4: Running migration..."
  pnpm script:run 2>&1 | tail -20
  
  echo ""
  echo "✅ Migration complete!"
  echo ""
  echo "📋 Next steps:"
  echo "   1. Verify changes: pnpm type-check"
  echo "   2. Test commands: pnpm fix:types --dry-run"
  echo "   3. Check new structure: ls -la scripts/"
  echo ""
  echo "🔄 If you need to rollback:"
  echo "   pnpm migration:list"
  echo "   pnpm migration:rollback <backup-id>"
else
  echo "⏸️ Migration cancelled"
  echo ""
  echo "You can still:"
  echo "   • Review analysis: cat scripts-analysis-before.json"
  echo "   • Run manual migration later"
  echo "   • Check other backups: pnpm migration:list"
fi