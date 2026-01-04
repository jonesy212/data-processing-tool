#!/bin/bash
echo "🔍 Using TypeScript error patterns to identify REAL broken code"

# First, run TypeScript to see what errors we have
echo "Running TypeScript check..."
ERRORS=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "(error|warning)" || true)

if [ -z "$ERRORS" ]; then
  echo "✅ No TypeScript errors found!"
  exit 0
fi

echo "Found TypeScript errors. Analyzing patterns..."

# Extract file names and line numbers from errors
echo "$ERRORS" | grep -E "\.(ts|tsx)\([0-9]+," | while read -r error_line; do
  # Extract filename and line number
  if [[ "$error_line" =~ ([^\(]+)\(([0-9]+), ]]; then
    FILENAME="${BASH_REMATCH[1]}"
    LINE_NUM="${BASH_REMATCH[2]}"
    
    # Check if this file exists and the line starts with //
    if [ -f "$FILENAME" ]; then
      # Get the specific line
      LINE_CONTENT=$(sed -n "${LINE_NUM}p" "$FILENAME")
      
      if [[ "$LINE_CONTENT" =~ ^//[[:space:]]+ ]]; then
        echo "🔧 File: $FILENAME"
        echo "   Line $LINE_NUM has error: $(echo "$error_line" | cut -d':' -f4-)"
        echo "   Content: $LINE_CONTENT"
        
        # Check error type to decide if it's really broken code
        ERROR_TYPE=$(echo "$error_line" | grep -o "TS[0-9]\+")
        
        # Common errors for commented-out code:
        # TS1005: ';' expected
        # TS1109: Expression expected  
        # TS1128: Declaration or statement expected
        # TS1434: Unexpected keyword or identifier
        # TS2448: Block-scoped variable used before declaration
        
        if [[ "$ERROR_TYPE" =~ TS(1005|1109|1128|1434|2448) ]]; then
          echo "   ❌ This looks like commented-out CODE (error $ERROR_TYPE)"
          
          # Ask if we should fix it
          read -p "   Remove // from this line? (y/n): " -n 1 -r
          echo
          if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Remove the // prefix
            FIXED_LINE="${LINE_CONTENT#// }"
            sed -i "${LINE_NUM}s/^\/\/ //" "$FILENAME"
            echo "   ✅ Fixed line $LINE_NUM"
          fi
        else
          echo "   ℹ️  Different error type ($ERROR_TYPE) - might be legitimate"
        fi
      fi
    fi
  fi
done

echo -e "\n✅ Error-based fixing complete"
echo "Run 'npx tsc --noEmit --skipLibCheck' to check remaining errors"
