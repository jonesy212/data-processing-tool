#!/bin/bash
echo "📊 ENHANCED BUG REPORT GENERATOR"
echo "================================="

REPORT_FILE="buggy-files-report-$(date +%Y%m%d-%H%M%S).txt"
SUMMARY_FILE="bug-summary-$(date +%Y%m%d-%H%M%S).txt"

echo "Scanning for buggy files..."
echo "Looking for TypeScript files in: $(pwd)"

# Create temporary files for counters
TEMP_COUNTERS=$(mktemp)

# Initialize counters in temp file
echo "TOTAL_FILES=0" > "$TEMP_COUNTERS"
echo "BUGGY_FILES=0" >> "$TEMP_COUNTERS"
echo "TOTAL_LINES=0" >> "$TEMP_COUNTERS"
echo "BUGGY_LINES=0" >> "$TEMP_COUNTERS"

# Clear report files
echo "# BUGGY FILES REPORT" > "$REPORT_FILE"
echo "# Generated: $(date)" >> "$REPORT_FILE"
echo "#" >> "$REPORT_FILE"

echo "" > "$SUMMARY_FILE"

# Create an array to store buggy file info for later sorting
TEMP_BUGGY_FILES=$(mktemp)

# Process files without using pipeline to avoid subshell issues
# First, collect all files into an array
files_array=()
while IFS= read -r -d $'\0' file; do
    files_array+=("$file")
done < <(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "./node_modules/*" \
  ! -path "./.next/*" \
  ! -path "./dist/*" \
  ! -path "./build/*" \
  ! -path "./coverage/*" \
  ! -path "./.git/*" \
  -print0)

echo "Found ${#files_array[@]} TypeScript/TSX files to scan..."
echo ""

# Process each file
for file in "${files_array[@]}"; do
    # Load current counters
    source "$TEMP_COUNTERS" 2>/dev/null
    
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    # Save updated counters
    echo "TOTAL_FILES=$TOTAL_FILES" > "$TEMP_COUNTERS"
    echo "BUGGY_FILES=$BUGGY_FILES" >> "$TEMP_COUNTERS"
    echo "TOTAL_LINES=$TOTAL_LINES" >> "$TEMP_COUNTERS"
    echo "BUGGY_LINES=$BUGGY_LINES" >> "$TEMP_COUNTERS"
    
    # Show progress (more frequent updates)
    if [ $((TOTAL_FILES % 50)) -eq 0 ]; then
        echo "  Processing file $TOTAL_FILES: $(basename "$file")"
    fi
    
    FILE_HAS_BUGS=false
    BUG_LINES_IN_FILE=()
    local_bug_count=0
    local_total_lines=0
    
    # Check for bug patterns - SIMPLIFIED DETECTION (no regex issues)
    LINE_NUM=0
    while IFS= read -r line || [ -n "$line" ]; do
        LINE_NUM=$((LINE_NUM + 1))
        local_total_lines=$((local_total_lines + 1))
        
        # Skip empty lines
        if [[ -z "$line" ]]; then
            continue
        fi
        
        # Only check lines that start with //
        if [[ ! "$line" =~ ^// ]]; then
            continue
        fi
        
        # Bug pattern 1: //import without space (definitely wrong)
        if [[ "$line" =~ ^//import[[:space:]] ]]; then
            local_bug_count=$((local_bug_count + 1))
            BUG_LINES_IN_FILE+=("$LINE_NUM: //import without space")
            FILE_HAS_BUGS=true
            continue
        fi
        
        # Bug pattern 2: // import type without space after import
        if [[ "$line" =~ ^//import[[:space:]]+type ]]; then
            local_bug_count=$((local_bug_count + 1))
            BUG_LINES_IN_FILE+=("$LINE_NUM: //import type without space")
            FILE_HAS_BUGS=true
            continue
        fi
        
        # Bug pattern 3: Check for TypeScript keywords after //
        # Remove // and any leading spaces
        content_after_comment="${line#//}"
        content_after_comment="${content_after_comment#"${content_after_comment%%[![:space:]]*}"}"
        
        # Check for TypeScript keywords at the beginning (case sensitive)
        first_word=$(echo "$content_after_comment" | awk '{print $1}')
        
        case "$first_word" in
            export|const|let|var|function|class|interface|type|enum|namespace|module|declare|abstract|async|await)
                # But skip if it looks like a proper sentence comment
                if [[ ! "$content_after_comment" =~ ^[A-Z][a-z]+ ]]; then
                    local_bug_count=$((local_bug_count + 1))
                    BUG_LINES_IN_FILE+=("$LINE_NUM: // with TypeScript keyword")
                    FILE_HAS_BUGS=true
                fi
                ;;
        esac
        
        # Bug pattern 4: // ... from (looks like import but not a sentence)
        if [[ "$line" =~ from[[:space:]] ]]; then
            # Check if it's NOT a proper sentence
            if [[ ! "$content_after_comment" =~ ^[A-Z][a-z]+ ]]; then
                local_bug_count=$((local_bug_count + 1))
                BUG_LINES_IN_FILE+=("$LINE_NUM: // ... from (not a sentence)")
                FILE_HAS_BUGS=true
                continue
            fi
        fi
        
        # Bug pattern 5: // export default (commented exports)
        if [[ "$line" =~ //.*export.*default ]]; then
            local_bug_count=$((local_bug_count + 1))
            BUG_LINES_IN_FILE+=("$LINE_NUM: // export default")
            FILE_HAS_BUGS=true
            continue
        fi
        
        # Bug pattern 6: // with arrow function (FIXED: use pattern matching)
        if [[ "$line" == *"=>"* ]]; then
            local_bug_count=$((local_bug_count + 1))
            BUG_LINES_IN_FILE+=("$LINE_NUM: // arrow function")
            FILE_HAS_BUGS=true
            continue
        fi
        
        # Bug pattern 7: // with return statement
        if [[ "$line" =~ //.*return[[:space:]] ]]; then
            local_bug_count=$((local_bug_count + 1))
            BUG_LINES_IN_FILE+=("$LINE_NUM: // return statement")
            FILE_HAS_BUGS=true
            continue
        fi
        
        # Bug pattern 8: // with variable assignment
        # Check for = but not == or ===
        if [[ "$line" == *"="* ]] && [[ "$line" != *"=="* ]] && [[ "$line" != *"==="* ]]; then
            # Use grep to check if it looks like an assignment
            if echo "$line" | grep -q "//.*[a-zA-Z_][a-zA-Z0-9_]*[[:space:]]*="; then
                local_bug_count=$((local_bug_count + 1))
                BUG_LINES_IN_FILE+=("$LINE_NUM: // variable assignment")
                FILE_HAS_BUGS=true
                continue
            fi
        fi
        
    done < "$file"
    
    # Load counters again before updating
    source "$TEMP_COUNTERS" 2>/dev/null
    
    # Update global counters
    TOTAL_LINES=$((TOTAL_LINES + local_total_lines))
    BUGGY_LINES=$((BUGGY_LINES + local_bug_count))
    
    if [ "$FILE_HAS_BUGS" = true ]; then
        BUGGY_FILES=$((BUGGY_FILES + 1))
        
        # Save buggy file info for later sorting
        echo "$file|${#BUG_LINES_IN_FILE[@]}|$(basename "$file")" >> "$TEMP_BUGGY_FILES"
        
        # Add to report
        echo "" >> "$REPORT_FILE"
        echo "=== $(basename "$file") ===" >> "$REPORT_FILE"
        echo "Path: $file" >> "$REPORT_FILE"
        
        # Try to find backup files
        backup=$(find . -name "$(basename "$file").backup-*" -type f 2>/dev/null | sort -r | head -1)
        if [ -n "$backup" ]; then
            echo "Backup: $(basename "$backup")" >> "$REPORT_FILE"
        else
            backup=$(find . -name "*.backup-*" -type f 2>/dev/null | grep "$(basename "$file")" | sort -r | head -1)
            if [ -n "$backup" ]; then
                echo "Backup: $(basename "$backup")" >> "$REPORT_FILE"
            else
                echo "Backup: None" >> "$REPORT_FILE"
            fi
        fi
        
        echo "Bug count: ${#BUG_LINES_IN_FILE[@]}" >> "$REPORT_FILE"
        if [ ${#BUG_LINES_IN_FILE[@]} -le 20 ]; then
            echo "Bug lines:" >> "$REPORT_FILE"
            for bug_line in "${BUG_LINES_IN_FILE[@]}"; do
                echo "  Line $bug_line" >> "$REPORT_FILE"
            done
        else
            echo "Bug lines: ${#BUG_LINES_IN_FILE[@]} lines (showing first 20)" >> "$REPORT_FILE"
            for bug_line in "${BUG_LINES_IN_FILE[@]:0:20}"; do
                echo "  Line $bug_line" >> "$REPORT_FILE"
            done
            if [ ${#BUG_LINES_IN_FILE[@]} -gt 20 ]; then
                echo "  ... and $(( ${#BUG_LINES_IN_FILE[@]} - 20 )) more" >> "$REPORT_FILE"
            fi
        fi
        
        # Show sample of actual buggy lines from the file
        echo "Sample buggy lines:" >> "$REPORT_FILE"
        # Get actual lines that match bug patterns
        bug_line_numbers=()
        for bug_info in "${BUG_LINES_IN_FILE[@]}"; do
            line_num="${bug_info%%:*}"
            bug_line_numbers+=("$line_num")
        done
        
        # Show first 5 actual buggy lines
        count=0
        for line_num in "${bug_line_numbers[@]:0:5}"; do
            line_content=$(sed -n "${line_num}p" "$file" 2>/dev/null)
            if [ -n "$line_content" ]; then
                # Truncate if too long
                if [ ${#line_content} -gt 100 ]; then
                    line_content="${line_content:0:97}..."
                fi
                echo "  $line_num:$line_content" >> "$REPORT_FILE"
                count=$((count + 1))
            fi
        done
        if [ $count -eq 0 ]; then
            # Fallback to first 3 comment lines
            grep -n "^//" "$file" | head -3 | while IFS= read -r buggy; do
                echo "  $buggy" >> "$REPORT_FILE"
            done
        fi
        
        # Show file size
        lines_in_file=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo "Size: $lines_in_file lines" >> "$REPORT_FILE"
    fi
    
    # Save updated counters
    echo "TOTAL_FILES=$TOTAL_FILES" > "$TEMP_COUNTERS"
    echo "BUGGY_FILES=$BUGGY_FILES" >> "$TEMP_COUNTERS"
    echo "TOTAL_LINES=$TOTAL_LINES" >> "$TEMP_COUNTERS"
    echo "BUGGY_LINES=$BUGGY_LINES" >> "$TEMP_COUNTERS"
done

# Load final counters
source "$TEMP_COUNTERS" 2>/dev/null

# Generate summary
echo "# BUG SUMMARY" > "$SUMMARY_FILE"
echo "# Generated: $(date)" >> "$SUMMARY_FILE"
echo "#" >> "$SUMMARY_FILE"
echo "Total files scanned: $TOTAL_FILES" >> "$SUMMARY_FILE"
echo "Buggy files: $BUGGY_FILES" >> "$SUMMARY_FILE"
echo "Buggy lines: $BUGGY_LINES" >> "$SUMMARY_FILE"
echo "Total lines scanned: $TOTAL_LINES" >> "$SUMMARY_FILE"

if [ $TOTAL_LINES -gt 0 ]; then
    bug_density=$(echo "scale=4; $BUGGY_LINES * 100 / $TOTAL_LINES" | bc 2>/dev/null || echo "0.00")
    echo "Bug density: ${bug_density}%" >> "$SUMMARY_FILE"
else
    echo "Bug density: 0.00%" >> "$SUMMARY_FILE"
fi

echo "" >> "$SUMMARY_FILE"
echo "Top files by bug count:" >> "$SUMMARY_FILE"

# Sort and display top buggy files
if [ -s "$TEMP_BUGGY_FILES" ]; then
    sort -t'|' -k2 -nr "$TEMP_BUGGY_FILES" | head -10 | while IFS='|' read -r path count filename; do
        echo "  $filename: $count bugs ($path)" >> "$SUMMARY_FILE"
    done
fi

# Clean up temp files
rm -f "$TEMP_COUNTERS" "$TEMP_BUGGY_FILES"

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
    bug_density=$(echo "scale=4; $BUGGY_LINES * 100 / $TOTAL_LINES" | bc 2>/dev/null || echo "0.00")
    printf "   Bug density: %.4f%%\n" "$bug_density"
else
    echo "   Bug density: 0.00%"
fi

# Show a quick preview of buggy files if any
if [ $BUGGY_FILES -gt 0 ]; then
    echo ""
    echo "🔍 Quick preview of buggy files (top 5):"
    grep -m5 "^===" "$REPORT_FILE" | while read -r line; do
        filename="${line#=== }"
        filename="${filename% ===}"
        # Get bug count for this file
        bug_count=$(grep -A1 "$line" "$REPORT_FILE" | grep "Bug count:" | cut -d' ' -f3)
        if [ -n "$bug_count" ]; then
            echo "  - $filename: $bug_count bugs"
        else
            echo "  - $filename"
        fi
    done
fi

# If you want to verify against the original report, run this:
echo ""
if [ -f "buggy-files-report-20260104-172440.txt" ]; then
    echo "📊 Comparison with original report (20260104-172440):"
    orig_buggy_files=$(grep -c "^===" "buggy-files-report-20260104-172440.txt")
    echo "  Original report: $orig_buggy_files buggy files"
    echo "  New report: $BUGGY_FILES buggy files"
    
    if [ $BUGGY_FILES -lt $orig_buggy_files ]; then
        echo ""
        echo "⚠️  New report found FEWER buggy files than original!"
        echo "   Missing files from original report:"
        grep "^===" "buggy-files-report-20260104-172440.txt" | while read -r line; do
            filename="${line#=== }"
            filename="${filename% ===}"
            if ! grep -q "=== $filename ===" "$REPORT_FILE"; then
                echo "    - $filename"
            fi
        done
    fi
fi