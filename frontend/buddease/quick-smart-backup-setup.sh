#!/bin/bash
# quick-smart-backup-setup.sh

echo "🔧 Setting up Smart Backup System..."

# 1. Create config file if it doesn't exist
if [ ! -f .smart-backup-config.json ]; then
  echo "📄 Creating .smart-backup-config.json..."
  cat > .smart-backup-config.json << 'EOF'
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
  ],
  "notificationSettings": {
    "notifyOnBackup": true,
    "notifyOnProductionBackup": true,
    "notifyOnRollback": true
  },
  "compression": {
    "enabled": false,
    "minSizeKB": 100
  }
}
EOF
  echo "✅ Config file created"
else
  echo "📄 Config file already exists"
fi

# 2. Update .gitignore
echo "📝 Updating .gitignore..."
if ! grep -q ".smart-backups" .gitignore 2>/dev/null; then
  cat >> .gitignore << 'EOF'

# Smart Backup System
.smart-backups/
.smart-backup-config.local.json
.smart-backup-temp/
*.bak
EOF
  echo "✅ .gitignore updated"
else
  echo "✅ .gitignore already contains smart backup entries"
fi

# 3. Add scripts to package.json
echo "📦 Checking package.json scripts..."

# Check if smart backup scripts exist
if ! grep -q '"smart:' package.json 2>/dev/null; then
  echo "⚠️ Smart backup scripts not found in package.json"
  echo "Please add them manually or run:"
  echo ""
  echo "Add this to your package.json scripts section:"
  cat << 'EOF'
    // ========== SMART BACKUP WORKFLOWS ==========
    "smart:dev-fix": "tsx src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts dev-fix",
    "smart:production-backup": "tsx src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts production-backup",
    "smart:status": "tsx src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts status",
    "smart:cleanup": "tsx src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts cleanup",
    "smart:report": "tsx src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts report",
    
    // ========== QUICK WORKFLOWS ==========
    "fix:smart": "pnpm smart:dev-fix",
    "backup:production": "pnpm smart:production-backup 'Production Ready - $(date)'",
    
    // ========== INTEGRATED WORKFLOWS ==========
    "dev:with-backup": "pnpm smart:dev-fix && pnpm dev",
    "build:with-safety": "pnpm smart:production-backup 'Pre-Build' && pnpm build",
    
    // ========== CONDITIONAL FIXES ==========
    "fix:imports-only": "tsx src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts dev-fix --focus imports",
    "fix:types-only": "tsx src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts dev-fix --focus types",
    "fix:patterns-only": "tsx src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts dev-fix --focus patterns",
    
    // ========== ROLLBACK MANAGEMENT ==========
    "rollback:latest": "bash .smart-backups/rollback/latest/rollback.sh",
    "rollback:list": "ls -la .smart-backups/rollback/",
    "rollback:to": "tsx src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts restore"
EOF
else
  echo "✅ Smart backup scripts already in package.json"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Check your config: cat .smart-backup-config.json"
echo "2. Update SmartBackupPhaseSystem.ts with the code I provided"
echo "3. Run: pnpm fix:smart"
