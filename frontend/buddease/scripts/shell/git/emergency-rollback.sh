#!/bin/bash
echo "🚨 SAFE EMERGENCY ROLLBACK - Only removing BAD comments"

# Find files that have been damaged by the buggy fixer
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Check if the ENTIRE FILE starts with // (this is the bug pattern)
  # The buggy fixer comments out the entire file starting with //
  if head -1 "$file" | grep -q "^// " && head -5 "$file" | grep -q "^//import "; then
    echo "🔄 Fixing buggy file: $file"
    
    # Look for backup first (always prefer backup)
    backup=$(find . -name "$(basename "$file").backup-*" -type f | sort -r | head -1)
    
    if [ -f "$backup" ]; then
      cp "$backup" "$file"
      echo "   ✅ Restored from backup"
    else
      # SAFE FIX: Only remove // from lines that are ACTUAL CODE (not legitimate comments)
      # Pattern: lines that start with // followed by valid TypeScript code
      
      # Create a temporary file
      temp_file="${file}.temp"
      
      # Process line by line
      while IFS= read -r line; do
        # If line starts with //import or //export or //const etc., it's buggy code
        if [[ "$line" =~ ^//\s*(import|export|const|let|var|function|class|interface|type) ]]; then
          # Remove the leading // and space
          echo "${line#// }"
        # If line starts with // but is a legitimate comment (descriptive text)
        elif [[ "$line" =~ ^//\s+[A-Z] ]] || [[ "$line" =~ ^//\s*$ ]] || [[ "$line" =~ ^//\s*(TODO|FIXME|NOTE|HACK) ]]; then
          # Keep legitimate comments
          echo "$line"
        # If line starts with // followed by lowercase (likely descriptive comment)
        elif [[ "$line" =~ ^//\s+[a-z] ]]; then
          echo "$line"
        # If line starts with // but has code-like pattern after
        elif [[ "$line" =~ ^//.*[={\[\(;] ]]; then
          # Remove // but keep the code
          echo "${line#// }"
        else
          # Keep all other lines as-is
          echo "$line"
        fi
      done < "$file" > "$temp_file"
      
      # Replace the file
      mv "$temp_file" "$file"
      echo "   ⚠️  No backup, attempted SAFE fix (kept legitimate comments)"
    fi
  fi
done

echo "✅ Safe rollback complete"
echo "💡 Check files manually to ensure legitimate comments were preserved"