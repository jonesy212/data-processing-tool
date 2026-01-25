#!/bin/bash
# scripts/check-comment-integrity.sh
echo "🔍 Checking comment integrity..."
echo "📊 Report generated: $(date)"
echo ""

REPORT_FILE="comment-errors-report.md"
TS_ERRORS_FILE="ts-errors.json"

# Run TypeScript and save errors
echo "Running TypeScript check..."
npx tsc --noEmit --skipLibCheck 2>&1 > "$TS_ERRORS_FILE" || true

# Create/update report
{
  echo "# Comment Integrity Report"
  echo "**Generated:** $(date)"
  echo "**Command:** \`$0\`"
  echo ""
  
  echo "## 📊 Summary"
  echo ""
  
  # Count total TS1434 errors
  TS1434_COUNT=$(grep -c "TS1434" "$TS_ERRORS_FILE" || echo "0")
  echo "- **Total TS1434 Errors:** $TS1434_COUNT"
  
  # Count files with TS1434 errors
  TS1434_FILES=$(grep "TS1434" "$TS_ERRORS_FILE" | cut -d'(' -f1 | sort -u | wc -l)
  echo "- **Files with TS1434 Errors:** $TS1434_FILES"
  
  # Count other relevant errors
  SYNTAX_ERRORS=$(grep -c "TS(1005\|1109\|1128)" "$TS_ERRORS_FILE" || echo "0")
  echo "- **Other Syntax Errors:** $SYNTAX_ERRORS"
  
  echo ""
  echo "## 🚨 Files Needing Attention"
  echo ""
  
  if [ "$TS1434_COUNT" -eq "0" ]; then
    echo "✅ **No TS1434 errors found!**"
  else
    echo "| File | TS1434 Errors | Other Syntax Errors | Status |"
    echo "|------|---------------|---------------------|--------|"
    
    # Group errors by file
    grep "TS1434" "$TS_ERRORS_FILE" | cut -d'(' -f1 | sort | uniq -c | sort -rn | \
    while read count file; do
      # Get other error count for this file
      other_errors=$(grep -c "$file" "$TS_ERRORS_FILE" | grep -c "TS(1005\|1109\|1128)" || echo "0")
      
      # Determine status
      if [ "$count" -gt "5" ]; then
        status="🔴 High Priority"
      elif [ "$count" -gt "2" ]; then
        status="🟡 Medium Priority"
      else
        status="🟢 Low Priority"
      fi
      
      echo "| \`$file\` | $count | $other_errors | $status |"
    done
  fi
  
  echo ""
  echo "## 📝 Detailed Error List"
  echo ""
  
  if [ "$TS1434_COUNT" -gt "0" ]; then
    echo "### TS1434 (Unexpected keyword/identifier) Errors:"
    echo ""
    
    grep "TS1434" "$TS_ERRORS_FILE" | \
    while IFS= read -r error; do
      if [[ "$error" =~ ([^\(]+)\(([0-9]+), ]]; then
        file="${BASH_REMATCH[1]}"
        line="${BASH_REMATCH[2]}"
        
        # Skip test files
        if [[ "$file" != *".test."* ]] && [[ "$file" != *".spec."* ]]; then
          content=$(sed -n "${line}p" "$file" 2>/dev/null || echo "Cannot read line")
          echo "- **\`$file:$line\`**: \`${content:0:80}\`"
        fi
      fi
    done
  fi
  
  echo ""
  echo "## 🔧 Fix Commands"
  echo ""
  echo "To fix a specific line:"
  echo '```bash'
  echo "# sed -i \"LINENUMBERs/^/\\/\\/ /\" FILENAME"
  echo "# Example: sed -i \"10s/^/\\/\\/ /\" src/utils/YourClass.ts"
  echo '```'
  echo ""
  echo "To fix all TS1434 errors automatically (use with caution):"
  echo '```bash'
  echo "npx tsc --noEmit --skipLibCheck 2>&1 | grep \"TS1434\" | grep -v \".test\\|.spec\" | \\"
  echo "while read line; do "
  echo "  file=\$(echo \$line | cut -d'(' -f1); "
  echo "  num=\$(echo \$line | sed 's/.*(\\([0-9]*\\),.*/\\1/'); "
  echo "  sed -i \"\${num}s/^/\\/\\/ /\" \"\$file\"; "
  echo "done"
  echo '```'
  echo ""
  echo "## 📈 Progress Tracking"
  echo ""
  echo "| Date | TS1434 Errors | Files | Fixed Today | Notes |"
  echo "|------|---------------|-------|-------------|-------|"
  
  # Try to load previous report for comparison
  if [ -f "$REPORT_FILE" ]; then
    PREV_COUNT=$(grep -A2 "## 📊 Summary" "$REPORT_FILE" | grep "TS1434" | grep -o "[0-9]\+" | head -1)
    if [ -n "$PREV_COUNT" ] && [ "$PREV_COUNT" -ne "$TS1434_COUNT" ]; then
      DIFF=$((PREV_COUNT - TS1434_COUNT))
      echo "| $(date '+%Y-%m-%d %H:%M') | $TS1434_COUNT | $TS1434_FILES | +$DIFF | Auto-update |"
    fi
  fi
  
  echo "| $(date '+%Y-%m-%d %H:%M') | $TS1434_COUNT | $TS1434_FILES | — | Initial scan |"
  
} > "$REPORT_FILE"

echo "📄 Report saved to: $REPORT_FILE"
echo "📊 Summary: $TS1434_COUNT TS1434 errors in $TS1434_FILES files"

# Show top 5 files needing attention
echo ""
echo "🔴 Top files needing fixes:"
grep "TS1434" "$TS_ERRORS_FILE" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -5 | \
while read count file; do
  echo "  $file: $count errors"
done

# Clean up temp file
rm -f "$TS_ERRORS_FILE"