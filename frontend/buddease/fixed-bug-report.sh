#!/bin/bash
echo "📊 FIXED BUG REPORT GENERATOR"
echo "=============================="

REPORT_FILE="buggy-files-report-$(date +%Y%m%d-%H%M%S).txt"
SUMMARY_FILE="bug-summary-$(date +%Y%m%d-%H%M%S).txt"

echo "Scanning for buggy files..."

# Initialize counters
TOTAL_FILES=0
BUGGY_FILES=0
TOTAL_LINES=0
BUGGY_LINES=0

# Clear report files
echo "# BUGGY FILES REPORT" > "$REPORT_FILE"
echo "# Generated: $(date)" >> "$REPORT_FILE"
echo "#" >> "$REPORT_FILE"

echo "" > "$SUMMARY_FILE"

find src -name "*.ts" -o -name "*.tsx" | while read file; do
  TOTAL_FILES=$((TOTAL_FILES + 1))
  FILE_HAS_BUGS=false
  BUG_LINES_IN_FILE=()
  
  # Check for bug patterns
  LINE_NUM=0
  while IFS= read -r line; do
    LINE_NUM=$((LINE_NUM + 1))
    
    # Bug patterns (definitely wrong)
    if [[ "$line" =~ ^//import[[:space:]] ]]; then
      BUGGY_LINES=$((BUGGY_LINES + 1))
      BUG_LINES_IN_FILE+=("$LINE_NUM: //import without space")
      FILE_HAS_BUGS=true
    elif [[ "$line" =~ ^//[[:space:]]+(export|const|let|var|function|class|interface|type)[[:space:]]+[A-Za-z_] ]]; then
      BUGGY_LINES=$((BUGGY_LINES + 1))
      BUG_LINES_IN_FILE+=("$LINE_NUM: // with TypeScript keyword")
      FILE_HAS_BUGS=true
    elif [[ "$line" =~ ^//.*from[[:space:]] ]]; then
      # Check if it's NOT a sentence (legitimate comment)
      if ! [[ "$line" =~ ^//[[:space:]]*[A-Z][a-z]+ ]]; then
        BUGGY_LINES=$((BUGGY_LINES + 1))
        BUG_LINES_IN_FILE+=("$LINE_NUM: // ... from (not a sentence)")
        FILE_HAS_BUGS=true
      fi
    fi
    
    TOTAL_LINES=$((TOTAL_LINES + 1))
  done < "$file"
  
  if [ "$FILE_HAS_BUGS" = true ]; then
    BUGGY_FILES=$((BUGGY_FILES + 1))
    
    # Add to report
    echo "" >> "$REPORT_FILE"
    echo "=== $(basename "$file") ===" >> "$REPORT_FILE"
    echo "Path: $file" >> "$REPORT_FILE"
    backup=$(find . -name "$(basename "$file").backup-*" -type f 2>/dev/null | sort -r | head -1)
    if [ -n "$backup" ]; then
      echo "Backup: $(basename "$backup")" >> "$REPORT_FILE"
    else
      echo "Backup: None" >> "$REPORT_FILE"
    fi
    echo "Bug count: ${#BUG_LINES_IN_FILE[@]}" >> "$REPORT_FILE"
    echo "Bug lines:" >> "$REPORT_FILE"
    for bug_line in "${BUG_LINES_IN_FILE[@]}"; do
      echo "  Line $bug_line" >> "$REPORT_FILE"
    done
    
    # Show sample of buggy lines
    echo "Sample buggy lines:" >> "$REPORT_FILE"
    grep -n "^//" "$file" | head -3 | while read buggy; do
      echo "  $buggy" >> "$REPORT_FILE"
    done
    
    # Show file size
    lines_in_file=$(wc -l < "$file" 2>/dev/null || echo "0")
    echo "Size: $lines_in_file lines" >> "$REPORT_FILE"
  fi
done

# Generate summary
echo "# BUG SUMMARY" > "$SUMMARY_FILE"
echo "# Generated: $(date)" >> "$SUMMARY_FILE"
echo "#" >> "$SUMMARY_FILE"
echo "Total files scanned: $TOTAL_FILES" >> "$SUMMARY_FILE"
echo "Buggy files: $BUGGY_FILES" >> "$SUMMARY_FILE"
echo "Buggy lines: $BUGGY_LINES" >> "$SUMMARY_FILE"
echo "Total lines scanned: $TOTAL_LINES" >> "$SUMMARY_FILE"

if [ $TOTAL_LINES -gt 0 ]; then
  bug_density=$(echo "scale=2; $BUGGY_LINES * 100 / $TOTAL_LINES" | bc 2>/dev/null || echo "0.00")
  echo "Bug density: ${bug_density}%" >> "$SUMMARY_FILE"
else
  echo "Bug density: 0.00%" >> "$SUMMARY_FILE"
fi

echo "" >> "$SUMMARY_FILE"
echo "Top files by bug count:" >> "$SUMMARY_FILE"
grep -A2 "Bug count:" "$REPORT_FILE" | paste -d' ' - - - | sort -k5 -nr | head -10 | while read line; do
  echo "$line" >> "$SUMMARY_FILE"
done

echo ""
echo "✅ Report generated!"
echo "📄 Full report: $REPORT_FILE"
echo "📊 Summary: $SUMMARY_FILE"
echo ""
echo "📋 Quick stats:"
echo "   Total files: $TOTAL_FILES"
echo "   Buggy files: $BUGGY_FILES"
echo "   Buggy lines: $BUGGY_LINES"
if [ $TOTAL_LINES -gt 0 ]; then
  echo "   Bug density: $(echo "scale=2; $BUGGY_LINES * 100 / $TOTAL_LINES" | bc)%"
fi
