#!/bin/bash
echo "🎯 SMART ROLLBACK - Only fixing actual broken code, preserving comments"

# Pattern to identify ACTUAL broken code vs legitimate comments
# Broken code characteristics:
# 1. Starts with // but contains code keywords (import, export, const, function, etc.)
# 2. Starts with // but has TypeScript syntax errors after it
# 3. Starts with // but the line looks like actual code (has =, =>, {, }, etc.)

# Legitimate comment characteristics:
# 1. Is a sentence (contains spaces, punctuation, no code symbols)
# 2. Is a TODO/FIXME/NOTE comment
# 3. Is a file header (mentions filename or path)
# 4. Is documentation (describes what follows)

find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Check first 10 lines for broken code patterns
  BROKEN_CODE_FOUND=false
  LINE_NUMBER=0
  
  while IFS= read -r line && [ $LINE_NUMBER -lt 10 ]; do
    LINE_NUMBER=$((LINE_NUMBER + 1))
    
    # Check if line starts with // but contains code
    if [[ "$line" =~ ^//[[:space:]]+.* ]]; then
      # Extract the content after //
      content="${line#// }"
      
      # Check if it looks like CODE (not a comment)
      if [[ "$content" =~ ^(import|export|const|let|var|function|class|interface|type|return|if|for|while|switch|case|default|break|continue)[[:space:]] ]] ||
         [[ "$content" =~ [=+\-*/&|<>{}();:] ]] || 
         [[ "$content" =~ => ]] ||
         [[ "$content" =~ ^[A-Z][a-zA-Z]*:[[:space:]] ]] || # Type annotations
         [[ "$content" =~ \<.*\> ]] || # JSX/TypeScript generics
         [[ "$content" =~ \`.*\` ]]; then # Template literals
        
        echo "🔄 Found broken code at $file:$LINE_NUMBER"
        echo "   Broken line: $line"
        BROKEN_CODE_FOUND=true
        break
      fi
      
      # Check if it's a legitimate comment (sentence structure)
      # Legitimate comments often:
      # - Have sentence capitalization (start with capital letter)
      # - End with punctuation
      # - Don't contain code symbols
      # - Might mention the filename
      if [[ "$content" =~ ^[A-Z][a-z ]+\.?$ ]] ||
         [[ "$content" =~ TODO:|FIXME:|NOTE:|HACK: ]] ||
         [[ "$content" =~ [Ff]ile[: ] ]] ||
         [[ "$content" =~ [Cc]omponent[: ] ]] ||
         [[ "$content" =~ [Hh]ook[: ] ]] ||
         [[ "$content" =~ [Ss]tore[: ] ]] ||
         [[ "$content" =~ ^[[:space:]]*$ ]]; then
        
        echo "   ℹ️  Line $LINE_NUMBER looks like legitimate comment: '$content'"
        echo "   (Will keep this as a comment)"
      fi
    fi
  done < "$file"
  
  if [ "$BROKEN_CODE_FOUND" = true ]; then
    echo "🔄 Processing: $file"
    
    # Look for backup
    backup=$(find . -name "$(basename "$file").backup-*" -type f | sort -r | head -1)
    
    if [ -f "$backup" ]; then
      echo "   📦 Restoring from backup: $(basename "$backup")"
      cp "$backup" "$file"
    else
      echo "   🔧 No backup, performing smart fix..."
      
      # Create temp file
      TEMP_FILE="$file.temp"
      
      # Process line by line
      LINE_NUMBER=0
      while IFS= read -r line; do
        LINE_NUMBER=$((LINE_NUMBER + 1))
        
        # Only fix lines in the first 20 lines (where imports typically are)
        if [ $LINE_NUMBER -le 20 ] && [[ "$line" =~ ^//[[:space:]]+.* ]]; then
          content="${line#// }"
          
          # Check if it's CODE that needs fixing
          if [[ "$content" =~ ^(import|export|const|let|var|function|class|interface|type|return)[[:space:]] ]] ||
             [[ "$content" =~ [=+\-*/&|<>{}();:] ]] ||
             [[ "$content" =~ => ]] ||
             [[ "$content" =~ ^[A-Z][a-zA-Z]*:[[:space:]] ]] ||
             [[ "$content" =~ \<.*\> ]] ||
             [[ "$content" =~ \`.*\` ]]; then
            
            # This is CODE - remove the //
            echo "      Line $LINE_NUMBER: Fixed code - '$content'"
            echo "$content" >> "$TEMP_FILE"
            continue
          fi
        fi
        
        # Keep the line as-is (either it's fine, or it's a legitimate comment)
        echo "$line" >> "$TEMP_FILE"
        
      done < "$file"
      
      # Replace original with temp
      mv "$TEMP_FILE" "$file"
      echo "   ✅ Applied smart fix"
    fi
  fi
done

echo -e "\n✅ Smart rollback complete"
echo "💡 Check results:"
echo "   Files that still have issues: find src -name '*.ts' -exec grep -l '^// import' {} \;"
echo "   Legitimate comments preserved: find src -name '*.ts' -exec grep '^// [A-Z]' {} \; | head -5"
