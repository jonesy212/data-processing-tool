#!/bin/bash
echo "🔧 Fixing TS1434 errors in generateTree.ts..."

FILE="src/core/scripts/generateTree.ts"

if [ ! -f "$FILE" ]; then
  echo "❌ File not found: $FILE"
  exit 1
fi

# Backup
BACKUP="${FILE}.backup.$(date +%s)"
cp "$FILE" "$BACKUP"
echo "💾 Backup created: $BACKUP"

ERRORS=$(npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep "TS1434")
BEFORE_COUNT=$(echo "$ERRORS" | wc -l | tr -d ' ')
echo "📊 Found $BEFORE_COUNT TS1434 errors"

echo "$ERRORS" | while IFS= read -r error; do
  if [[ "$error" =~ \(([0-9]+), ]]; then
    line_num="${BASH_REMATCH[1]}"
    line_content=$(sed -n "${line_num}p" "$FILE")

    # Detect raw prose / markdown-like headers
    if [[ "$line_content" =~ ^[A-Z#=\-|📁🎯🔍🧱✨🗺️] ]] &&
       [[ ! "$line_content" =~ ^[[:space:]]*// ]]; then
      echo "✏️  Line $line_num: commenting invalid prose"
      sed -i '' "${line_num}s|^|// |" "$FILE"
    fi
  fi
done

AFTER_COUNT=$(npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep -c "TS1434" | tr -d ' ')
echo ""
echo "📊 Results:"
echo "Before: $BEFORE_COUNT"
echo "After:  $AFTER_COUNT"
echo "Fixed:  $((BEFORE_COUNT - AFTER_COUNT))"

if [ "$AFTER_COUNT" -gt 0 ]; then
  echo "⚠️  Some TS1434 errors remain — review manually"
fi

echo ""
echo "🔄 Restore backup if needed:"
echo "cp \"$BACKUP\" \"$FILE\""
