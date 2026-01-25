#!/bin/bash
echo "🔧 Fixing videoSagas.ts TS1434 errors..."

FILE="src/core/state/redux/sagas/videoSagas.ts"

# Backup
cp "$FILE" "${FILE}.backup.$(date +%s)"

# Get errors
ERRORS=$(npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep "TS1434")
BEFORE_COUNT=$(echo "$ERRORS" | wc -l)
echo "Found $BEFORE_COUNT TS1434 errors"

# Fix each error
echo "$ERRORS" | while read error; do
  # Extract line number
  line_num=$(echo "$error" | sed 's/.*(//;s/,.*//')
  
  if [ -n "$line_num" ] && [ "$line_num" -eq "$line_num" ] 2>/dev/null; then
    # Get line content
    line_content=$(sed -n "${line_num}p" "$FILE" 2>/dev/null)
    
    # Check if it needs //
    if [[ -n "$line_content" ]] && [[ "$line_content" =~ ^[A-Za-z] ]] && [[ ! "$line_content" =~ ^[[:space:]]*// ]]; then
      echo "Line $line_num: Adding //"
      sed -i "${line_num}s/^/\/\/ /" "$FILE"
    fi
  fi
done

# Check after
AFTER_COUNT=$(npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep -c "TS1434")
echo ""
echo "📊 Results:"
echo "Before: $BEFORE_COUNT errors"
echo "After: $AFTER_COUNT errors"
echo "Fixed: $((BEFORE_COUNT - AFTER_COUNT)) errors"
