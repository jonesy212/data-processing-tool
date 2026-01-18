#!/bin/bash
# fix-all-type-imports.sh

echo "🔧 Fixing ALL type-only imports..."
echo "=================================\n"

# Create a backup directory
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📁 Backups will be saved to: $BACKUP_DIR\n"

# Fix function
fix_file() {
  local file="$1"
  local type="$2"
  
  # Create backup
  cp "$file" "$BACKUP_DIR/$(basename "$file").backup"
  
  # Fix import type for named imports
  sed -i '' "s/import { \($type[, }]\)/import type { \1/g" "$file"
  
  # Fix import type for default imports
  sed -i '' "s/import $type from/import type $type from/g" "$file"
  
  echo "✅ Fixed $type in $(basename "$file")"
}

# List of types to fix
TYPES=(
  "BaseDataEntity"
  "BaseDataRoot"
  "DefaultExcludedFields"
  "DefaultMeta"
  "UnifiedMetadata"
  "StructuredMetadata"
  "Attachment"
  "SharedMetadata"
  "EventManager"
  "InitializedState"
)

# Process each type
for TYPE in "${TYPES[@]}"; do
  echo "🔍 Processing $TYPE..."
  
  # Find files with this import (excluding those already using import type)
  find src -name "*.ts" -o -name "*.tsx" | \
    while read -r file; do
      # Check if file imports this type without 'import type'
      if grep -q "import.*$TYPE.*from" "$file" && \
         ! grep -q "import type.*$TYPE.*from" "$file"; then
        fix_file "$file" "$TYPE"
      fi
    done
done

echo "\n📊 Summary of fixes:"
echo "==================="
for TYPE in "${TYPES[@]}"; do
  count=$(grep -r "import.*$TYPE.*from" src/ --include="*.ts" --include="*.tsx" | \
           grep -v "import type" | wc -l | tr -d ' ')
  echo "$TYPE: $count files fixed"
done

echo "\n✅ All fixes applied! Backups saved to $BACKUP_DIR"
echo "\n🔍 Verify with: pnpm run check:types:all"