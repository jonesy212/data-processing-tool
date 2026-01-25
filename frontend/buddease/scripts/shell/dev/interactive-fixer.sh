#!/bin/bash
echo "🎯 INTERACTIVE FIXER WITH PROGRESS TRACKING"
echo "=========================================="

# Load bug report
REPORT_FILE=$(ls -t buggy-files-report-*.txt 2>/dev/null | head -1)
if [ -z "$REPORT_FILE" ] || [ ! -f "$REPORT_FILE" ]; then
  echo "⚠️  No bug report found. Generating..."
  ./generate-bug-report.sh > /dev/null 2>&1
  REPORT_FILE=$(ls -t buggy-files-report-*.txt | head -1)
fi

# Parse buggy files
BUGGY_FILES=()
while IFS= read -r line; do
  if [[ "$line" =~ ^Path:\ (.*)$ ]]; then
    BUGGY_FILES+=("${BASH_REMATCH[1]}")
  fi
done < <(grep "^Path:" "$REPORT_FILE")

TOTAL_FILES=${#BUGGY_FILES[@]}
echo "Found $TOTAL_FILES buggy files to fix"
echo ""

# Progress tracking
FIXED_COUNT=0
SKIPPED_COUNT=0

for file in "${BUGGY_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi
  
  clear
  echo "🎯 Fixing: $(basename "$file")"
  echo "Progress: $FIXED_COUNT/$TOTAL_FILES files ($(echo "scale=1; $FIXED_COUNT * 100 / $TOTAL_FILES" | bc)%)"
  echo "Path: $file"
  echo ""
  
  # Show buggy lines
  echo "Buggy lines in this file:"
  grep -n "^//" "$file" | head -5 | while read buggy; do
    echo "  $buggy"
  done
  
  # Show backup status
  backup=$(find . -name "$(basename "$file").backup-*" -type f 2>/dev/null | sort -r | head -1)
  if [ -f "$backup" ]; then
    echo "✅ Backup available: $(basename "$backup")"
  else
    echo "⚠️  No backup found"
  fi
  
  echo ""
  echo "Options:"
  echo "  1. Fix this file (remove // from buggy lines)"
  echo "  2. View full file"
  echo "  3. Skip this file"
  echo "  4. Mark as fixed (manually verified)"
  echo "  5. Exit"
  echo ""
  read -p "Choose option (1-5): " choice
  
  case $choice in
    1)
      # Fix the file
      TEMP_FILE="$file.temp"
      > "$TEMP_FILE"
      
      while IFS= read -r line; do
        # Remove // from buggy patterns
        if [[ "$line" =~ ^//import[[:space:]] ]]; then
          echo "${line#//}" >> "$TEMP_FILE"
        elif [[ "$line" =~ ^//[[:space:]]+(export|const|let|var|function|class|interface|type)[[:space:]]+[A-Za-z_] ]]; then
          echo "${line#//}" >> "$TEMP_FILE"
        elif [[ "$line" =~ ^//.*from[[:space:]]+['\"] ]] && [[ ! "$line" =~ ^//[[:space:]]*[A-Z][a-z]+[\.!?]?[[:space:]]*$ ]]; then
          echo "${line#//}" >> "$TEMP_FILE"
        else
          echo "$line" >> "$TEMP_FILE"
        fi
      done < "$file"
      
      mv "$TEMP_FILE" "$file"
      echo "✅ File fixed"
      FIXED_COUNT=$((FIXED_COUNT + 1))
      ;;
      
    2)
      # View file
      echo ""
      echo "=== FILE CONTENT (first 30 lines) ==="
      head -30 "$file" | cat -n
      echo "====================================="
      read -p "Press Enter to continue..."
      ;;
      
    3)
      echo "⏭️  Skipping this file"
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      ;;
      
    4)
      echo "✅ Marked as manually fixed"
      FIXED_COUNT=$((FIXED_COUNT + 1))
      ;;
      
    5)
      echo "Exiting..."
      break
      ;;
      
    *)
      echo "Invalid choice"
      ;;
  esac
  
  echo ""
  read -p "Press Enter to continue to next file..."
done

echo ""
echo "🎉 SESSION COMPLETE"
echo "=================="
echo "Total files processed: $TOTAL_FILES"
echo "Files fixed: $FIXED_COUNT"
echo "Files skipped: $SKIPPED_COUNT"
echo "Remaining: $((TOTAL_FILES - FIXED_COUNT - SKIPPED_COUNT))"

# Update progress
if [ $FIXED_COUNT -gt 0 ]; then
  echo ""
  echo "📈 Updating progress..."
  ./track-progress.sh
fi
