#!/bin/bash
echo "📈 PROGRESS TRACKER"
echo "==================="

# Get baseline from previous run or create new
BASELINE_FILE="bug-baseline.txt"
CURRENT_FILE="bug-current.txt"

if [ ! -f "$BASELINE_FILE" ]; then
  echo "⚠️  No baseline found. Creating baseline..."
  ./generate-bug-report.sh > /dev/null 2>&1
  mv bug-summary-*.txt "$BASELINE_FILE"
  echo "✅ Baseline created: $BASELINE_FILE"
fi

# Generate current report
echo "Generating current report..."
./generate-bug-report.sh > /dev/null 2>&1
LATEST_REPORT=$(ls -t bug-summary-*.txt | head -1)
cp "$LATEST_REPORT" "$CURRENT_FILE"

echo ""
echo "📊 PROGRESS REPORT"
echo "------------------"

# Extract numbers
BASELINE_FILES=$(grep "Buggy files:" "$BASELINE_FILE" | awk '{print $3}')
BASELINE_LINES=$(grep "Buggy lines:" "$BASELINE_FILE" | awk '{print $3}')
CURRENT_FILES=$(grep "Buggy files:" "$CURRENT_FILE" | awk '{print $3}')
CURRENT_LINES=$(grep "Buggy lines:" "$CURRENT_FILE" | awk '{print $3}')

FILES_FIXED=$((BASELINE_FILES - CURRENT_FILES))
LINES_FIXED=$((BASELINE_LINES - CURRENT_LINES))
FILES_PROGRESS=$(echo "scale=1; ($FILES_FIXED * 100) / $BASELINE_FILES" | bc)
LINES_PROGRESS=$(echo "scale=1; ($LINES_FIXED * 100) / $BASELINE_LINES" | bc)

echo "Baseline: $BASELINE_FILES files, $BASELINE_LINES lines"
echo "Current:  $CURRENT_FILES files, $CURRENT_LINES lines"
echo ""
echo "✅ Fixed: $FILES_FIXED files ($FILES_PROGRESS%)"
echo "✅ Fixed: $LINES_FIXED lines ($LINES_PROGRESS%)"
echo ""

# Show progress bar
echo "Progress:"
echo -n "Files: ["
for i in $(seq 1 50); do
  if [ $i -le $((CURRENT_FILES * 50 / BASELINE_FILES)) ]; then
    echo -n "█"
  else
    echo -n "░"
  fi
done
echo "] $CURRENT_FILES/$BASELINE_FILES"

echo -n "Lines: ["
for i in $(seq 1 50); do
  if [ $i -le $((CURRENT_LINES * 50 / BASELINE_LINES)) ]; then
    echo -n "█"
  else
    echo -n "░"
  fi
done
echo "] $CURRENT_LINES/$BASELINE_LINES"

# Save progress
echo ""
echo "📝 Updating progress log..."
PROGRESS_LOG="fix-progress.log"
echo "$(date): $CURRENT_FILES files, $CURRENT_LINES lines remaining" >> "$PROGRESS_LOG"

echo "✅ Progress tracked in $PROGRESS_LOG"
