#!/bin/bash
# scripts/backup-type-imports.sh

BACKUP_DIR=".type-import-backups"
ROLLBACK_DIR=".type-import-rollback"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔧 Type Import Backup System"
echo "============================"

# Create directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$ROLLBACK_DIR"

case "$1" in
  "backup")
    echo "📦 Creating backup..."
    
    # Find all TypeScript files with namespace imports
    FILES=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "import \* as" 2>/dev/null || true)
    
    if [ -z "$FILES" ]; then
      echo "✅ No files with namespace imports found"
      exit 0
    fi
    
    echo "Found $(echo "$FILES" | wc -l) files with namespace imports"
    
    # Create backup for each file
    BACKUP_COUNT=0
    echo "$FILES" | while read -r FILE; do
      if [ -f "$FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$(basename "$FILE")-$TIMESTAMP.backup"
        cp "$FILE" "$BACKUP_FILE"
        BACKUP_COUNT=$((BACKUP_COUNT + 1))
        echo "  💾 $(basename "$FILE") → $(basename "$BACKUP_FILE")"
      fi
    done
    
    # Create rollback script
    ROLLBACK_SCRIPT="$ROLLBACK_DIR/rollback-$TIMESTAMP.sh"
    cat > "$ROLLBACK_SCRIPT" << EOF
#!/bin/bash
echo "🔄 Rolling back type import fixes from $TIMESTAMP"

EOF
    
    echo "$FILES" | while read -r FILE; do
      if [ -f "$FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$(basename "$FILE")-$TIMESTAMP.backup"
        echo "cp \"$BACKUP_FILE\" \"$FILE\"" >> "$ROLLBACK_SCRIPT"
      fi
    done
    
    cat >> "$ROLLBACK_SCRIPT" << EOF

echo "✅ Rollback complete"
EOF
    
    chmod +x "$ROLLBACK_SCRIPT"
    
    # Update latest rollback symlink
    ln -sf "$ROLLBACK_SCRIPT" "$ROLLBACK_DIR/latest-rollback.sh"
    
    echo "✅ Created $BACKUP_COUNT backups"
    echo "💡 Rollback script: $ROLLBACK_SCRIPT"
    ;;
    
  "rollback")
    echo "🔄 Rolling back..."
    
    LATEST_ROLLBACK="$ROLLBACK_DIR/latest-rollback.sh"
    
    if [ ! -f "$LATEST_ROLLBACK" ]; then
      echo "❌ No rollback script found"
      exit 1
    fi
    
    echo "Using: $(basename "$LATEST_ROLLBACK")"
    read -p "Are you sure? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      bash "$LATEST_ROLLBACK"
    else
      echo "❌ Cancelled"
    fi
    ;;
    
  "list")
    echo "📦 Available backups:"
    echo "====================="
    
    if [ -d "$BACKUP_DIR" ]; then
      find "$BACKUP_DIR" -name "*.backup" | sort | while read -r BACKUP; do
        BASENAME=$(basename "$BACKUP")
        SIZE=$(du -h "$BACKUP" | cut -f1)
        MTIME=$(stat -f "%Sm" "$BACKUP" 2>/dev/null || date -r "$BACKUP")
        echo "  $BASENAME ($SIZE, $MTIME)"
      done
    else
      echo "No backups found"
    fi
    
    echo ""
    echo "🔄 Rollback scripts:"
    echo "==================="
    
    if [ -d "$ROLLBACK_DIR" ]; then
      find "$ROLLBACK_DIR" -name "rollback-*.sh" | sort | while read -r SCRIPT; do
        BASENAME=$(basename "$SCRIPT")
        echo "  $BASENAME"
      done
    else
      echo "No rollback scripts found"
    fi
    ;;
    
  "cleanup")
    echo "🧹 Cleaning old backups..."
    
    # Keep only last 10 backups
    if [ -d "$BACKUP_DIR" ]; then
      BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.backup" | wc -l)
      if [ "$BACKUP_COUNT" -gt 10 ]; then
        echo "Found $BACKUP_COUNT backups, keeping last 10"
        find "$BACKUP_DIR" -name "*.backup" -type f | sort | head -n -10 | xargs rm -f
        echo "✅ Cleanup complete"
      else
        echo "Only $BACKUP_COUNT backups, no cleanup needed"
      fi
    fi
    ;;
    
  *)
    echo "Usage: $0 {backup|rollback|list|cleanup}"
    echo ""
    echo "Commands:"
    echo "  backup    - Create backups of files with namespace imports"
    echo "  rollback  - Rollback to the latest backup"
    echo "  list      - List available backups and rollback scripts"
    echo "  cleanup   - Remove old backups (keep last 10)"
    exit 1
    ;;
esac