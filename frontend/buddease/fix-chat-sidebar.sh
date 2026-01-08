#!/bin/bash
echo "🔍 Fixing ChatSidebarProvider.tsx"

# Detect macOS for sed compatibility
if [[ "$(uname)" == "Darwin" ]]; then
  SED_IN_PLACE="sed -i ''"
else
  SED_IN_PLACE="sed -i"
fi

# Run TypeScript just for this file
ERRORS=$(npx tsc --noEmit --skipLibCheck src/core/api/ChatSidebarProvider.tsx 2>&1 || true)

# Filter errors for this file and extract line numbers
echo "$ERRORS" | grep "ChatSidebarProvider.tsx" | while read -r error_line; do
  if [[ "$error_line" =~ ChatSidebarProvider\.tsx\(([0-9]+), ]]; then
    LINE_NUM="${BASH_REMATCH[1]}"
    FILENAME="src/core/api/ChatSidebarProvider.tsx"
    
    # Get the specific line
    LINE_CONTENT=$(sed -n "${LINE_NUM}p" "$FILENAME")
    ERROR_TYPE=$(echo "$error_line" | grep -o "TS[0-9]\+" | head -1)
    
    echo "Line $LINE_NUM: $LINE_CONTENT"
    echo "Error: $ERROR_TYPE"
    
    # Check if line looks like a comment without // (starts with letter)
    if [[ "$ERROR_TYPE" == "TS1434" ]] && [[ "$LINE_CONTENT" =~ ^[A-Za-z] ]]; then
      echo "  ⚠️  Adding // to line $LINE_NUM"
      $SED_IN_PLACE "${LINE_NUM}s/^/\/\/ /" "$FILENAME"
    fi
  fi
done

echo "✅ Done fixing ChatSidebarProvider.tsx"
echo "Checking remaining errors..."
npx tsc --noEmit --skipLibCheck src/core/api/ChatSidebarProvider.tsx 2>&1 | grep "ChatSidebarProvider.tsx" || echo "✅ No more errors!"
