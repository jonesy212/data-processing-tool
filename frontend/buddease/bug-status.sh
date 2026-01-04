#!/bin/bash
echo "🔍 QUICK BUG STATUS"
echo "==================="

# Count buggy files quickly
echo "Scanning for bug patterns..."
BUGGY_COUNT=$(find src -name "*.ts" -o -name "*.tsx" -exec grep -l "^//import\|^// export\|^// const\|^// function" {} \; | wc -l)
TOTAL_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)

echo ""
echo "📊 Quick Stats:"
echo "   Total TypeScript files: $TOTAL_FILES"
echo "   Files with bug patterns: $BUGGY_COUNT"
echo "   Percentage affected: $(echo "scale=1; $BUGGY_COUNT * 100 / $TOTAL_FILES" | bc)%"

if [ $BUGGY_COUNT -gt 0 ]; then
  echo ""
  echo "🔴 Top 5 affected files:"
  find src -name "*.ts" -o -name "*.tsx" -exec grep -l "^//import\|^// export\|^// const\|^// function" {} \; | head -5 | while read file; do
    bug_count=$(grep -c "^//import\|^// export\|^// const\|^// function" "$file")
    echo "   $(basename "$file"): $bug_count bugs"
  done
  
  echo ""
  echo "💡 Run './generate-bug-report.sh' for detailed report"
  echo "💡 Run './interactive-fixer.sh' to fix interactively"
else
  echo ""
  echo "✅ No bug patterns found!"
  echo "💡 Run './track-progress.sh' to update progress"
fi
