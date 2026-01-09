#!/bin/bash
echo "🔍 Using TypeScript error patterns to identify REAL broken code"

# AUTO-FIX MODE
AUTO_FIX=false
if [[ "$1" == "--auto-fix" ]]; then
  AUTO_FIX=true
  echo "⚙️  Auto-fix mode enabled (no prompts)"
  shift
fi

# TARGET FILE
TARGET_FILE=""
if [[ -n "$1" ]]; then
  TARGET_FILE="$1"
  echo "🎯 Targeting specific file: $TARGET_FILE"
fi

# sed wrapper function
sed_in_place() {
  local script="$1"
  local file="$2"
  
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "$script" "$file"
  else
    sed -i "$script" "$file"
  fi
}

# First, run TypeScript to see what errors we have
echo "Running TypeScript check..."
ERRORS=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "(error|warning)" || true)

if [ -z "$ERRORS" ]; then
  echo "✅ No TypeScript errors found!"
  exit 0
fi

echo "Found TypeScript errors. Analyzing patterns..."

# Create temp file to store lines that need fixing
FIX_FILE=$(mktemp)
trap 'rm -f "$FIX_FILE"' EXIT

# Find all lines that need fixing (BOTH TS1434 and TS1109)
echo "$ERRORS" | grep -E "\.(ts|tsx)" | while read -r error_line; do
  # Match filename(line,column) format ONLY
  if [[ "$error_line" =~ ([^\(]+)\(([0-9]+), ]]; then
    FILENAME="${BASH_REMATCH[1]}"
    LINE_NUM="${BASH_REMATCH[2]}"
  else
    continue
  fi
  
  # Skip if we have a target file and this isn't it
  if [[ -n "$TARGET_FILE" && "$FILENAME" != *"$TARGET_FILE"* ]]; then
    continue
  fi
  
  # Check if this file exists
  if [ -f "$FILENAME" ]; then
    # Get the specific line
    LINE_CONTENT=$(sed -n "${LINE_NUM}p" "$FILENAME")
    ERROR_TYPE=$(echo "$error_line" | grep -o "TS[0-9]\+" | head -1)
    
    # Check if this line needs fixing
    # CASE 1: TS1434 and starts with letter
    # CASE 2: TS1109 and starts with dashes
    if [[ "$ERROR_TYPE" =~ TS(1434|1109) ]] && [[ ! "$LINE_CONTENT" =~ ^[[:space:]]*// ]]; then
      if [[ "$ERROR_TYPE" == "TS1434" ]] && [[ "$LINE_CONTENT" =~ ^[A-Za-z] ]]; then
        echo "${FILENAME}:${LINE_NUM}:text" >> "$FIX_FILE"
      elif [[ "$ERROR_TYPE" == "TS1109" ]] && [[ "$LINE_CONTENT" =~ ^-{4,} ]]; then
        echo "${FILENAME}:${LINE_NUM}:dash" >> "$FIX_FILE"
      fi
    fi
  fi
done

# Fix lines from BOTTOM to TOP (so line numbers don't shift)
if [[ -s "$FIX_FILE" ]]; then
  # Sort by line number descending and remove duplicates
  sort -t: -k2 -nr "$FIX_FILE" | uniq | while IFS=: read -r FILENAME LINE_NUM TYPE; do
    if [[ -n "$FILENAME" && -n "$LINE_NUM" ]]; then
      LINE_CONTENT=$(sed -n "${LINE_NUM}p" "$FILENAME")
      echo "🔧 File: $FILENAME"
      echo "   Line $LINE_NUM: $LINE_CONTENT"
      
      if [[ "$TYPE" == "dash" ]]; then
        echo "   ❌ SEPARATOR without //"
      else
        echo "   ❌ COMMENT without //"
      fi
      
      if [[ "$AUTO_FIX" == true ]]; then
        sed_in_place "${LINE_NUM}s/^/\/\/ /" "$FILENAME"
        echo "   ✅ Fixed line $LINE_NUM (auto-fix)"
      else
        read -p "   Add // to this line? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          sed_in_place "${LINE_NUM}s/^/\/\/ /" "$FILENAME"
          echo "   ✅ Fixed line $LINE_NUM"
        fi
      fi
    fi
  done
else
  echo "ℹ️  No lines need fixing"
fi

echo -e "\n✅ Error-based fixing complete"
echo "Run 'npx tsc --noEmit --skipLibCheck' to check remaining errors"