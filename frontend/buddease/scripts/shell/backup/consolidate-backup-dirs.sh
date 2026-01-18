#!/bin/bash
# scripts/consolidate-backup-dirs.sh

echo "🔧 Consolidating backup directories..."
echo "======================================"

OLD_DIR=".import-fix-backups"
NEW_DIR=".type-import-backups"

# Create new directory if it doesn't exist
mkdir -p "$NEW_DIR"

# Check if old directory exists
if [ -d "$OLD_DIR" ]; then
    echo "📦 Found old backups in: $OLD_DIR"
    
    # Count files
    OLD_COUNT=$(find "$OLD_DIR" -type f | wc -l)
    echo "   Contains $OLD_COUNT backup files"
    
    # Move files
    if [ "$OLD_COUNT" -gt 0 ]; then
        echo "🚚 Moving files to: $NEW_DIR"
        mv "$OLD_DIR"/* "$NEW_DIR/" 2>/dev/null || true
        
        # Update file names if they don't indicate type
        echo "🏷️  Renaming files for clarity..."
        find "$NEW_DIR" -name "*.backup" | while read -r file; do
            if [[ ! "$file" =~ type-.*\.backup ]]; then
                new_name="${file%.backup}-type-import.backup"
                mv "$file" "$new_name" 2>/dev/null || true
            fi
        done
    fi
    
    # Remove empty old directory
    rmdir "$OLD_DIR" 2>/dev/null || true
    echo "✅ Consolidated backups"
else
    echo "ℹ️ No old backups found at: $OLD_DIR"
fi

# Update .gitignore
echo ""
echo "📝 Updating .gitignore..."
if grep -q ".import-fix-backups" .gitignore 2>/dev/null; then
    echo "   Removing old entry..."
    sed -i '' '/\.import-fix-backups/d' .gitignore
fi

if ! grep -q ".type-import-backups" .gitignore 2>/dev/null; then
    echo "   Adding new entry..."
    echo "" >> .gitignore
    echo "# Type import backups" >> .gitignore
    echo ".type-import-backups/" >> .gitignore
fi

echo ""
echo "🎉 Consolidation complete!"
echo ""
echo "New structure:"
echo "  .type-import-backups/     # All type import backups"
echo "  .type-import-rollback/    # Rollback scripts"
echo ""
echo "Run: chmod +x scripts/consolidate-backup-dirs.sh"
echo "Then: ./scripts/consolidate-backup-dirs.sh"