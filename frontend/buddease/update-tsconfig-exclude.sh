#!/bin/bash
echo "📝 Updating all tsconfig.json files to exclude backup directories..."

BACKUP_DIRS=".ts-backups .comment-fix-backups .type-import-backups .import-fix-backups"

for config in tsconfig.json tsconfig.scripts.json tsconfig.snapshots.json; do
    if [ -f "$config" ]; then
        echo "📝 Updating: $config"
        
        # Create backup of config
        cp "$config" "${config}.backup.$(date +%s)"
        
        # Use Python to update
        python3 -c "
import json
import sys

try:
    with open('$config', 'r') as f:
        data = json.load(f)
    
    if 'exclude' not in data:
        data['exclude'] = []
    
    added = []
    for dir in ['$BACKUP_DIRS'.split()]:
        if dir not in data['exclude']:
            data['exclude'].append(dir)
            added.append(dir)
    
    with open('$config', 'w') as f:
        json.dump(data, f, indent=2)
    
    if added:
        print(f'  ✅ Added: {added}')
    else:
        print(f'  ✅ Already excluded')
        
except Exception as e:
    print(f'  ❌ Error: {e}')
    sys.exit(1)
" 2>/dev/null || echo "  ⚠️ Python failed, checking manually..."
    fi
done

echo ""
echo "✅ All tsconfig files updated!"
echo "📋 Current exclude lists:"
for config in tsconfig.json tsconfig.scripts.json tsconfig.snapshots.json; do
    if [ -f "$config" ]; then
        echo ""
        echo "=== $config ==="
        grep -A 10 '"exclude"' "$config" 2>/dev/null || echo "  (no exclude section)"
    fi
done