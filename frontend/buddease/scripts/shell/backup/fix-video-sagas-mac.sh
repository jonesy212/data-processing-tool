#!/bin/bash
echo "🔧 Fixing videoSagas.ts TS1434 errors (macOS compatible)..."

FILE="src/core/state/redux/sagas/videoSagas.ts"

# Backup
cp "$FILE" "${FILE}.backup.$(date +%s)"

# Get errors
ERRORS=$(npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep "TS1434")
BEFORE_COUNT=$(echo "$ERRORS" | wc -l | tr -d ' ')
echo "Found $BEFORE_COUNT TS1434 errors"

# Fix each error
fixed_count=0
echo "$ERRORS" | while read error; do
  # Extract line number
  line_num=$(echo "$error" | sed 's/.*(//;s/,.*//')
  
  if [ -n "$line_num" ] && [ "$line_num" -eq "$line_num" ] 2>/dev/null; then
    # Get line content
    line_content=$(sed -n "${line_num}p" "$FILE" 2>/dev/null)
    
    # Check if it needs //
    if [[ -n "$line_content" ]] && [[ "$line_content" =~ ^[A-Za-z] ]] && [[ ! "$line_content" =~ ^[[:space:]]*// ]]; then
      echo "Line $line_num: Adding //"
      # macOS sed syntax: -i '' for in-place without backup
      sed -i '' "${line_num}s/^/\/\/ /" "$FILE"
      ((fixed_count++))
    fi
  fi
done

# Check after
AFTER_COUNT=$(npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep -c "TS1434")
echo ""
echo "📊 Results:"
echo "Before: $BEFORE_COUNT errors"
echo "After: $AFTER_COUNT errors"
echo "Fixed: $fixed_count errors"

# If no errors fixed, try alternative approach
if [ "$fixed_count" -eq 0 ]; then
  echo ""
  echo "⚠️ Using alternative approach..."
  
  # Alternative: Use perl instead of sed
  echo "$ERRORS" | head -10 | while read error; do
    line_num=$(echo "$error" | sed 's/.*(//;s/,.*//')
    if [ -n "$line_num" ]; then
      echo "Trying perl for line $line_num"
      perl -i -pe "s/^/\/\/ / if \$. == $line_num" "$FILE"
    fi
  done
  
  AFTER_COUNT2=$(npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep -c "TS1434")
  echo "After perl: $AFTER_COUNT2 errors"
fi
