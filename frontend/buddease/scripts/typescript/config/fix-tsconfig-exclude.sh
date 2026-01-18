#!/bin/bash
# fix-tsconfig-exclude.sh

echo "📝 Updating tsconfig.json exclude list..."

# Check if jq is available
if command -v jq &> /dev/null; then
  echo "✅ jq found, using JSON manipulation"
  
  # Read current exclude array, add our directories, write back
  jq '.exclude = (.exclude // []) + [".comment-fix-backups", ".type-import-backups", ".import-fix-backups", ".ts-backups"]' tsconfig.json > tsconfig.json.tmp
  
  # Check if the operation was successful
  if [ $? -eq 0 ]; then
    mv tsconfig.json.tmp tsconfig.json
    echo "✅ Successfully updated tsconfig.json"
  else
    echo "❌ Failed to update tsconfig.json with jq"
    rm tsconfig.json.tmp
  fi
else
  echo "⚠️  jq not found, using sed (fallback)"
  
  # Create backup of tsconfig.json
  cp tsconfig.json tsconfig.json.backup
  
  # Check the exact format of exclude array in your file
  echo "Current exclude section:"
  grep -A 10 '"exclude"' tsconfig.json
  
  # Use sed with the exact pattern from your file
  # First, find the line number of the exclude array
  EXCLUDE_LINE=$(grep -n '"exclude"' tsconfig.json | head -1 | cut -d: -f1)
  
  if [ -n "$EXCLUDE_LINE" ]; then
    # Find the line where the exclude array ends
    # Look for the closing bracket at the same indentation level
    END_LINE=$((EXCLUDE_LINE + 1))
    while [ $END_LINE -lt $((EXCLUDE_LINE + 20)) ]; do
      LINE_CONTENT=$(sed -n "${END_LINE}p" tsconfig.json)
      if [[ "$LINE_CONTENT" =~ ^\s*\] ]]; then
        # Found the closing bracket
        # Insert our exclusions before the closing bracket
        sed -i "${END_LINE}i\    \".comment-fix-backups\",\n    \".type-import-backups\",\n    \".import-fix-backups\",\n    \".ts-backups\"," tsconfig.json
        echo "✅ Successfully updated tsconfig.json with sed"
        break
      fi
      END_LINE=$((END_LINE + 1))
    done
  else
    echo "❌ Could not find exclude array in tsconfig.json"
  fi
fi

echo ""
echo "📋 Updated exclude list:"
grep -A 15 '"exclude"' tsconfig.json