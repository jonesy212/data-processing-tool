#!/bin/bash

echo "🔧 Setting up Smart Backup System..."

# 1. Create config file if it doesn't exist
if [ ! -f .smart-backup-config.json ]; then
  echo "📄 Creating .smart-backup-config.json..."
  cat > .smart-backup-config.json << 'CONFIG_EOF'
{
  "backupOnChange": true,
  "backupOnlyFixed": false,
  "createProductionBackup": true,
  "trackEntityChanges": true,
  "cleanupOldBackups": true,
  "backupDir": ".smart-backups",
  "maxBackups": 20,
  "excludePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**"
  ]
}
CONFIG_EOF
  echo "✅ Config file created"
else
  echo "📄 Config file already exists"
  echo "Current content:"
  cat .smart-backup-config.json
fi

# 2. Update .gitignore
echo "📝 Updating .gitignore..."
if [ ! -f .gitignore ]; then
  touch .gitignore
fi

if ! grep -q ".smart-backups" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Smart Backup System" >> .gitignore
  echo ".smart-backups/" >> .gitignore
  echo ".smart-backup-config.local.json" >> .gitignore
  echo "*.bak" >> .gitignore
  echo "✅ .gitignore updated"
else
  echo "✅ .gitignore already contains smart backup entries"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Summary:"
echo "- Config file: $(ls -la .smart-backup-config.json 2>/dev/null || echo 'Not found')"
echo "- Gitignore updated"
echo ""
echo "Next steps:"
echo "1. Update SmartBackupPhaseSystem.ts with config loading code"
echo "2. Add scripts to package.json"
echo "3. Run: pnpm fix:smart (or npx tsx src/app/error-analyzer/phases/SmartBackupPhaseSystem.ts dev-fix)"
