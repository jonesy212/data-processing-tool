#!/bin/bash
echo "🔍 Testing fix on videoSagas.ts..."

FILE="src/core/state/redux/sagas/videoSagas.ts"

# Backup
cp "$FILE" "${FILE}.test-backup"

# Get first 5 TS1434 errors
echo "First 5 TS1434 errors:"
npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep "TS1434" | head -5 | \
while IFS= read -r error; do
  if [[ "$error" =~ ([^\(]+)\(([0-9]+), ]]; then
    line="${BASH_REMATCH[2]}"
    content=$(sed -n "${line}p" "$FILE" 2>/dev/null || echo "")
    echo "Line $line: ${content:0:60}..."
    
    # Check if it's plain text (starts with letter, not code)
    if [[ "$content" =~ ^[A-Za-z] ]] && [[ ! "$content" =~ ^[[:space:]]*// ]]; then
      echo "  Should fix: Adding // to line $line"
      # Uncomment to actually fix:
      # sed -i "${line}s/^/\/\/ /" "$FILE"
    fi
  fi
done

echo ""
echo "Before error count:"
npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep -c "TS1434"

# Uncomment to test fixing first 5 errors:
# npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep "TS1434" | head -5 | \
# while read line; do 
#   num=$(echo $line | sed 's/.*(\([0-9]*\),.*/\1/'); 
#   sed -i "${num}s/^/\/\/ /" "$FILE";
# done

# echo "After error count:"
# npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep -c "TS1434"
