#!/bin/bash
echo "🔍 Finding REAL TS1434 errors in videoSagas.ts..."
FILE="src/core/state/redux/sagas/videoSagas.ts"

# Get all TS1434 errors
npx tsc --noEmit --skipLibCheck "$FILE" 2>&1 | grep "TS1434" | \
while IFS= read -r error; do
  if [[ "$error" =~ ([^\(]+)\(([0-9]+), ]]; then
    line="${BASH_REMATCH[2]}"
    content=$(sed -n "${line}p" "$FILE" 2>/dev/null || echo "")
    
    # Show the error and content
    echo "Line $line: $error"
    echo "Content: '$content'"
    echo "---"
  fi
done | head -20
