#!/bin/bash
echo "📊 BUG REPORT GENERATOR"
echo "======================="

REPORT_FILE="buggy-files-report-$(date +%Y%m%d-%H%M%S).txt"
SUMMARY_FILE="bug-summary-$(date +%Y%m%d-%H%M%S).txt"

echo "Scanning for buggy files..."

# Initialize counters
TOTAL_FILES=0
BUGGY_FILES=0
TOTAL_LINES=0
BUGGY_LINES=0

# Clear report files
> "$REPORT_FILE"
> "$SUMMARY_FILE"

echo "# BUGGY FILES REPORT" >> "$REPORT_FILE"
echo "# Generated: $(date)" >> "$REPORT_FILE"
echo "#" >> "$REPORT_FILE"

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
    elif [[ "$line" =~ ^//.*from[[:space:]]+['\"] ]] && [[ ! "$line" =~ ^//[[:space:]]*[A-Z][a-z]+[\.!?]?[[:space:]]*$ ]]; then
      BUGGY_LINES=$((BUGGY_LINES + 1))
      BUG_LINES_IN_FILE+=("$LINE_NUM: // ... from 'path' (not a sentence)")
      FILE_HAS_BUGS=true
    fi
    
    TOTAL_LINES=$((TOTAL_LINES + 1))
  done < "$file"
  
  if [ "$FILE_HAS_BUGS" = true ]; then
    BUGGY_FILES=$((BUGGY_FILES + 1))
    
    # Add to report
    echo "" >> "$REPORT_FILE"
    echo "=== $(basename "$file") ===" >> "$REPORT_FILE"
    echo "Path: $file" >> "$REPORT_FILE"
    echo "Backup: $(find . -name "$(basename "$file").backup-*" -type f 2>/dev/null | sort -r | head -1 | xargs basename 2>/dev/null || echo "None")" >> "$REPORT_FILE"
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
    echo "Size: $(wc -l < "$file") lines" >> "$REPORT_FILE"
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
echo "Bug density: $(echo "scale=2; $BUGGY_LINES * 100 / $TOTAL_LINES" | bc)%" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "Top 10 files by bug count:" >> "$SUMMARY_FILE"
grep -A2 "Bug count:" "$REPORT_FILE" | paste -d' ' - - | sort -k4 -nr | head -10 | while read line; do
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
echo "   Bug density: $(echo "scale=2; $BUGGY_LINES * 100 / $TOTAL_LINES" | bc)%"