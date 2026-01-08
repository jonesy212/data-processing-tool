#!/bin/bash
# test-video-sagas-specific.sh
echo "�� Testing fix specifically on videoSagas.ts..."

FILE="src/core/state/redux/sagas/videoSagas.ts"

if [ ! -f "$FILE" ]; then
  echo "❌ File not found: $FILE"
  exit 1
fi

# Backup
BACKUP="${FILE}.backup.$(date +%s)"
cp "$FILE" "$BACKUP"
echo "💾 Backup created: $BACKUP"

# Get TS1434 errors for this file
echo "📊 Current TS1434 errors in $FILE:"
ERRORS=$(npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep "TS1434")
ERROR_COUNT=$(echo "$ERRORS" | wc -l)
echo "Total TS1434 errors: $ERROR_COUNT"

echo ""
echo "📝 Sample errors (first 5):"
echo "$ERRORS" | head -5

echo ""
echo "🔍 Analyzing lines that need // added..."

# Check first 10 error lines
echo "$ERRORS" | head -10 | while IFS= read -r error_line; do
  if [[ "$error_line" =~ ([^\(]+)\(([0-9]+), ]]; then
    line="${BASH_REMATCH[2]}"
    content=$(sed -n "${line}p" "$FILE" 2>/dev/null || echo "")
    
    echo ""
    echo "Line $line: '$content'"
    
    # Check if it should have //
    if [[ "$content" =~ ^[A-Za-z] ]] && \
       [[ ! "$content" =~ ^[[:space:]]*// ]] && \
       [[ ! "$content" =~ ^[[:space:]]*import ]] && \
       [[ ! "$content" =~ ^[[:space:]]*export ]] && \
       [[ ! "$content" =~ ^[[:space:]]*const ]] && \
       [[ ! "$content" =~ ^[[:space:]]*function ]] && \
       [[ ! "$content" =~ ^[[:space:]]*class ]] && \
       [[ ! "$content" =~ ^[[:space:]]*interface ]] && \
       [[ ! "$content" =~ ^[[:space:]]*type ]]; then
      
      echo "  ✅ Should add // to this line"
      
      # Ask to fix
      read -p "  Add // to line $line? (y/n): " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i "${line}s/^/\/\/ /" "$FILE"
        echo "  ✅ Fixed line $line"
      fi
    else
      echo "  ℹ️  Already has // or is valid code"
    fi
  fi
done

echo ""
echo "📊 After fix check:"
AFTER_ERRORS=$(npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep -c "TS1434" || echo "0")
echo "Remaining TS1434 errors: $AFTER_ERRORS"

if [ "$AFTER_ERRORS" -lt "$ERROR_COUNT" ]; then
  FIXED=$((ERROR_COUNT - AFTER_ERRORS))
  echo "🎉 Fixed $FIXED errors!"
else
  echo "⚠️  No errors fixed or count increased"
fi

echo ""
echo "🔄 To restore backup:"
echo "cp \"$BACKUP\" \"$FILE\""
