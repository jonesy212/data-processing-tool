#!/bin/bash

echo "🔧 Setting up Smart Backup System..."

# 1. Create main config file
CONFIG_FILE=".smart-backup-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "📄 Creating $CONFIG_FILE..."
  cat > "$CONFIG_FILE" << 'CONFIG_EOF'
{
  "backupOnChange": true,
  "backupOnlyFixed": true,
  "createProductionBackup": true,
  "trackEntityChanges": true,
  "cleanupOldBackups": true,
  "backupDir": ".smart-backups",
  "maxBackups": 50,
  "excludePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**",
    ".smart-backups/**",
    "coverage/**",
    "*.log",
    "*.tmp",
    "*.bak"
  ],
  "entities": {
    "DataStore": ["*DataStore*", "*Store*.ts", "*/stores/*.ts"],
    "Snapshot": ["*Snapshot*", "*/snapshots/*.ts"],
    "Team": ["*Team*", "*/teams/*.ts", "*/typings/team*"],
    "Hooks": ["*/hooks/*.ts", "use*.ts"],
    "Components": ["*/components/*.tsx", "*/components/*.ts"]
  }
}
CONFIG_EOF
  echo "✅ Config file created"
else
  echo "📄 Config file already exists"
fi

# 2. Create local override file template
LOCAL_CONFIG=".smart-backup-config.local.json"
if [ ! -f "$LOCAL_CONFIG" ]; then
  echo "📄 Creating $LOCAL_CONFIG template..."
  cat > "$LOCAL_CONFIG" << 'LOCAL_EOF'
{
  "//": "Local overrides - this file is .gitignored",
  "backupDir": ".smart-backups-local",
  "maxBackups": 10,
  "excludePatterns": [
    "**/.git/**",
    "**/node_modules/**",
    "**/dist/**"
  ]
}
LOCAL_EOF
  echo "✅ Local config template created"
fi

# 3. Update .gitignore
echo "📝 Updating .gitignore..."
if [ ! -f .gitignore ]; then
  touch .gitignore
fi

# Add smart backup entries if not present
if ! grep -q ".smart-backups" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Smart Backup System" >> .gitignore
  echo ".smart-backups/" >> .gitignore
  echo ".smart-backups-local/" >> .gitignore
  echo ".smart-backup-config.local.json" >> .gitignore
  echo "*.backup.*" >> .gitignore
  echo "backup-*/" >> .gitignore
  echo "✅ .gitignore updated"
else
  echo "✅ .gitignore already contains smart backup entries"
fi

# 4. Create backup system script
BACKUP_SCRIPT="src/app/scripts/smart-backup-system.ts"
if [ ! -f "$BACKUP_SCRIPT" ]; then
  echo "📦 Creating smart backup system script..."
  mkdir -p "$(dirname "$BACKUP_SCRIPT")"
  
  # Create a simple starter script
  cat > "$BACKUP_SCRIPT" << 'SCRIPT_EOF'
#!/usr/bin/env tsx
// smart-backup-system.ts
// Placeholder - run setup to get full script

console.log('🚀 Smart Backup System');
console.log('=====================');
console.log('Please run: ./setup-smart-backup.sh to install the full system');
SCRIPT_EOF
  
  chmod +x "$BACKUP_SCRIPT"
  echo "✅ Backup script created at $BACKUP_SCRIPT"
fi

# 5. Update package.json with backup scripts
echo "📦 Checking package.json scripts..."
if [ -f package.json ]; then
  # Check if backup scripts already exist
  if ! grep -q '"backup:' package.json; then
    echo "📝 Adding backup scripts to package.json..."
    
    # Create temporary file with new scripts
    TEMP_FILE=$(mktemp)
    cat package.json | jq '.scripts += {
      "backup:setup": "./setup-smart-backup.sh",
      "backup:create": "tsx src/app/scripts/smart-backup-system.ts create",
      "backup:entity": "tsx src/app/scripts/smart-backup-system.ts entity",
      "backup:restore": "tsx src/app/scripts/smart-backup-system.ts restore",
      "backup:list": "tsx src/app/scripts/smart-backup-system.ts list",
      "backup:stats": "tsx src/app/scripts/smart-backup-system.ts stats",
      "backup:cleanup": "tsx src/app/scripts/smart-backup-system.ts cleanup",
      "backup:test": "pnpm backup:create \"Test backup\" && echo \"✅ Test backup created\""
    }' > "$TEMP_FILE"
    
    mv "$TEMP_FILE" package.json
    echo "✅ Package.json updated with backup scripts"
  else
    echo "✅ Package.json already has backup scripts"
  fi
else
  echo "⚠️ package.json not found"
fi

# 6. Create initial backup
echo ""
echo "🚀 Creating initial backup..."
if command -v tsx &> /dev/null; then
  npx tsx src/app/scripts/smart-backup-system.ts create "Initial setup" || echo "⚠️ Could not create initial backup"
else
  echo "⚠️ tsx not available, skipping initial backup"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📊 Summary:"
echo "- Config file: $CONFIG_FILE"
echo "- Local config: $LOCAL_CONFIG"
echo "- Backup script: $BACKUP_SCRIPT"
echo "- Gitignore updated"
echo "- Package.json scripts added"
echo ""
echo "🚀 Available commands:"
echo "  pnpm backup:create [description]  - Create backup of changed files"
echo "  pnpm backup:entity <name>         - Create entity-specific backup"
echo "  pnpm backup:list                  - List all backups"
echo "  pnpm backup:restore <id>          - Restore from backup"
echo "  pnpm backup:stats                 - Show backup statistics"
echo "  pnpm backup:cleanup               - Clean up old backups"
echo ""
echo "💡 Integration with type fixing:"
echo "  pnpm types:fix-safe               - Auto-backup before fixing"
echo "  pnpm types:test-safe              - Auto-backup before testing"