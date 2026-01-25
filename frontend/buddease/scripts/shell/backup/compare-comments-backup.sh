#!/bin/bash
# src/app/scripts/compare-comments-backup.sh

echo "🔍 COMPARE COMMENTS WITH BACKUPS"
echo "================================="
echo ""
echo "This script compares current TypeScript/TSX files with backup versions"
echo "to identify where '//' comments were incorrectly removed."
echo ""

# Configuration
BACKUP_DIR="${1:-.smart-backups}"
CURRENT_DIR="${2:-src}"
OUTPUT_REPORT="comment-comparison-report.txt"
MISSING_COMMENT_FILES="files-missing-comments.txt"

# Ensure backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Backup directory not found: $BACKUP_DIR"
  echo ""
  echo "Available backup directories:"
  find . -name "*.backup-*" -type d 2>/dev/null | head -10
  echo ""
  echo "Usage: $0 [backup-directory] [source-directory]"
  exit 1
fi

echo "📂 Scanning for TypeScript files in: $CURRENT_DIR"
echo "📦 Comparing with backups in: $BACKUP_DIR"
echo ""

# Create output directory
mkdir -p "./comment-analysis"
REPORT_FILE="./comment-analysis/$OUTPUT_REPORT"
MISSING_FILE="./comment-analysis/$MISSING_COMMENT_FILES"

# Clear previous reports
> "$REPORT_FILE"
> "$MISSING_FILE"

# Function to find backup for a file
find_backup_for_file() {
  local file_path="$1"
  local file_name=$(basename "$file_path")
  
  # Look for backups with different patterns
  local backups=()
  
  # Pattern 1: .bak files
  backups+=($(find "$BACKUP_DIR" -name "${file_name}.bak" -o -name "${file_name}.backup" 2>/dev/null))
  
  # Pattern 2: Files with backup- in name
  backups+=($(find "$BACKUP_DIR" -name "*${file_name}*" -type f | grep -E "\.(backup|bak|backup-[0-9]+)" 2>/dev/null))
  
  # Pattern 3: Check in timestamped directories
  local base_name="${file_name%.*}"
  local ext="${file_name##*.}"
  backups+=($(find "$BACKUP_DIR" -name "${base_name}-backup-*.${ext}" -o -name "${base_name}.${ext}.backup" 2>/dev/null))
  
  # Return the most recent backup if multiple found
  if [ ${#backups[@]} -gt 0 ]; then
    echo "${backups[-1]}"  # Most recent (last in array)
  fi
}

# Function to compare file with backup
compare_file_comments() {
  local current_file="$1"
  local backup_file="$2"
  local file_name=$(basename "$current_file")
  
  echo "=== Comparing: $file_name ===" >> "$REPORT_FILE"
  echo "Current: $current_file" >> "$REPORT_FILE"
  echo "Backup:  $backup_file" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Read both files line by line
  local line_num=1
  local differences_found=0
  local missing_comments_count=0
  
  while IFS= read -r backup_line && IFS= read -r current_line <&3; do
    # Check if backup line has // comment but current doesn't
    if [[ "$backup_line" =~ ^[[:space:]]*// ]] && [[ ! "$current_line" =~ ^[[:space:]]*// ]]; then
      # Check if it's the same content (just missing //)
      local backup_content="${backup_line#//}"
      backup_content=$(echo "$backup_content" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
      local current_content=$(echo "$current_line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
      
      if [ "$backup_content" = "$current_content" ]; then
        echo "  Line $line_num: Comment '//' missing" >> "$REPORT_FILE"
        echo "    Backup: $backup_line" >> "$REPORT_FILE"
        echo "    Current: $current_line" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        missing_comments_count=$((missing_comments_count + 1))
        differences_found=1
      fi
    fi
    
    # Check for other comment differences
    if [ "$backup_line" != "$current_line" ]; then
      # Check if it's just comment-related
      if [[ "$backup_line" =~ // ]] || [[ "$current_line" =~ // ]]; then
        echo "  Line $line_num: Different comments" >> "$REPORT_FILE"
        echo "    Backup: $backup_line" >> "$REPORT_FILE"
        echo "    Current: $current_line" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        differences_found=1
      fi
    fi
    
    line_num=$((line_num + 1))
  done < "$backup_file" 3< "$current_file"
  
  if [ $differences_found -eq 0 ]; then
    echo "  ✓ No comment differences found" >> "$REPORT_FILE"
  else
    echo "  Total missing comments: $missing_comments_count" >> "$REPORT_FILE"
    echo "$current_file:$missing_comments_count" >> "$MISSING_FILE"
  fi
  
  echo "=== End comparison ===" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  return $missing_comments_count
}

# Main comparison logic
echo "🔍 Starting comparison..."
echo "📊 Report will be saved to: $REPORT_FILE"
echo ""

total_files=0
files_with_differences=0
total_missing_comments=0

# Find all TypeScript/TSX files
while IFS= read -r -d '' ts_file; do
  total_files=$((total_files + 1))
  file_name=$(basename "$ts_file")
  
  echo -n "📄 $file_name..."
  
  # Find backup for this file
  backup_file=$(find_backup_for_file "$ts_file")
  
  if [ -z "$backup_file" ]; then
    echo " No backup found" | tee -a "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    continue
  fi
  
  if [ ! -f "$backup_file" ]; then
    echo " Backup file not accessible" | tee -a "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    continue
  fi
  
  # Compare the files
  compare_file_comments "$ts_file" "$backup_file"
  missing_count=$?
  
  if [ $missing_count -gt 0 ]; then
    echo " $missing_count missing comments" | tee -a "$REPORT_FILE"
    files_with_differences=$((files_with_differences + 1))
    total_missing_comments=$((total_missing_comments + missing_count))
  else
    echo " OK" | tee -a "$REPORT_FILE"
  fi
  
done < <(find "$CURRENT_DIR" \( -name "*.ts" -o -name "*.tsx" \) -type f -print0)

echo ""
echo "📊 COMPARISON SUMMARY"
echo "====================="
echo "Total TypeScript files scanned: $total_files"
echo "Files with backup found: $(find "$BACKUP_DIR" -name "*.ts" -o -name "*.tsx" -o -name "*.bak" 2>/dev/null | wc -l)"
echo "Files with comment differences: $files_with_differences"
echo "Total missing '//' comments: $total_missing_comments"
echo ""
echo "📁 Output files:"
echo "   Full report: $REPORT_FILE"
echo "   Files needing fixes: $MISSING_FILE"
echo ""

# Show top files needing fixes
if [ -f "$MISSING_FILE" ] && [ $(wc -l < "$MISSING_FILE") -gt 0 ]; then
  echo "🔴 TOP FILES NEEDING COMMENT FIXES:"
  echo "===================================="
  sort -t: -k2 -nr "$MISSING_FILE" | head -10 | while IFS=: read file count; do
    echo "  $(basename "$file"): $count missing comments"
  done
  echo ""
  
  # Create a fix script
  FIX_SCRIPT="./comment-analysis/restore-comments.sh"
  echo "Creating automatic fix script: $FIX_SCRIPT"
  
  cat > "$FIX_SCRIPT" << 'EOF'
#!/bin/bash
# Auto-restore missing comments from backups

echo "🔧 RESTORING MISSING COMMENTS"
echo "=============================="
echo ""

BACKUP_DIR="${1:-.smart-backups}"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Backup directory not found: $BACKUP_DIR"
  exit 1
fi

# Read the missing file list
MISSING_FILE="./comment-analysis/files-missing-comments.txt"

if [ ! -f "$MISSING_FILE" ]; then
  echo "❌ Missing file list not found: $MISSING_FILE"
  exit 1
fi

total_fixed=0

while IFS=: read -r current_file missing_count; do
  if [ -z "$current_file" ] || [ ! -f "$current_file" ]; then
    continue
  fi
  
  echo "📄 Processing: $(basename "$current_file") ($missing_count missing comments)"
  
  # Find backup
  backup_file=$(find "$BACKUP_DIR" -name "$(basename "$current_file").bak" -o \
                -name "$(basename "$current_file").backup" -o \
                -name "*$(basename "$current_file")*" | head -1)
  
  if [ -z "$backup_file" ] || [ ! -f "$backup_file" ]; then
    echo "   ⚠️  No backup found"
    continue
  fi
  
  # Create a fixed version
  temp_file="$current_file.temp"
  > "$temp_file"
  
  line_num=1
  fixed_in_file=0
  
  while IFS= read -r backup_line && IFS= read -r current_line <&3; do
    # Check if backup has // but current doesn't (and content is same)
    if [[ "$backup_line" =~ ^[[:space:]]*// ]] && [[ ! "$current_line" =~ ^[[:space:]]*// ]]; then
      backup_content="${backup_line#//}"
      backup_content_trimmed=$(echo "$backup_content" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
      current_trimmed=$(echo "$current_line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
      
      if [ "$backup_content_trimmed" = "$current_trimmed" ]; then
        # Restore the comment
        echo "$backup_line" >> "$temp_file"
        fixed_in_file=$((fixed_in_file + 1))
        echo "   Line $line_num: Restored comment"
        continue
      fi
    fi
    
    # Keep current line if no match
    echo "$current_line" >> "$temp_file"
    
    line_num=$((line_num + 1))
  done < "$backup_file" 3< "$current_file"
  
  if [ $fixed_in_file -gt 0 ]; then
    # Backup current file
    cp "$current_file" "$current_file.before-comment-restore"
    
    # Replace with fixed version
    mv "$temp_file" "$current_file"
    
    echo "   ✅ Fixed $fixed_in_file comments"
    total_fixed=$((total_fixed + fixed_in_file))
  else
    rm -f "$temp_file"
    echo "   ℹ️  No fixes applied (line count mismatch?)"
  fi
  
done < "$MISSING_FILE"

echo ""
echo "📊 RESTORE SUMMARY"
echo "=================="
echo "Total comments restored: $total_fixed"
echo ""
echo "💡 Next steps:"
echo "   1. Review changes: git diff"
echo "   2. Test the application"
echo "   3. Commit fixes: git add . && git commit -m 'Restore missing comments'"
EOF
  
  chmod +x "$FIX_SCRIPT"
  
  echo ""
  echo "🚀 To automatically restore missing comments, run:"
  echo "   ./comment-analysis/restore-comments.sh [backup-directory]"
  echo ""
  echo "⚠️  Always review changes before committing!"
else
  echo "✅ No files with missing comments found!"
fi

# Additional analysis: Check for files that might have been over-fixed
echo ""
echo "🔍 CHECKING FOR OVER-FIXED FILES"
echo "================================"
echo ""

OVER_FIXED_FILE="./comment-analysis/over-fixed-analysis.txt"
> "$OVER_FIXED_FILE"

find "$CURRENT_DIR" \( -name "*.ts" -o -name "*.tsx" \) -type f | while read file; do
  # Count lines that look like code but start with //
  weird_comments=$(grep -n "^[[:space:]]*//[[:space:]]*\(import\|export\|const\|let\|var\|function\|class\|interface\|type\|return\|if\|for\|while\|switch\|case\)" "$file" 2>/dev/null | head -5)
  
  if [ ! -z "$weird_comments" ]; then
    echo "=== $(basename "$file") ===" >> "$OVER_FIXED_FILE"
    echo "Lines that might be code incorrectly commented:" >> "$OVER_FIXED_FILE"
    echo "$weird_comments" >> "$OVER_FIXED_FILE"
    echo "" >> "$OVER_FIXED_FILE"
  fi
done

if [ -s "$OVER_FIXED_FILE" ]; then
  echo "⚠️  Found files that might have code incorrectly commented as comments"
  echo "   See: $OVER_FIXED_FILE"
else
  echo "✅ No obvious over-fixing detected"
fi

echo ""
echo "🎉 Analysis complete!"
echo "💡 Run './comment-analysis/restore-comments.sh' to automatically fix missing comments"