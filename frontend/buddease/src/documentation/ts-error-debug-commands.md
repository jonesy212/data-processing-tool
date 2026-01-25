<!-- ts-error-debug-commands.md -->

1. Create ts-error-debug-commands.md
markdown
# TypeScript Error Debugging Commands Reference

## 📋 Quick Start
```bash
# Get all TypeScript errors
pnpm type-check

# Skip library errors (node_modules)
npx tsc --noEmit --skipLibCheck

# Save errors to file
npx tsc --noEmit --pretty false 2>&1 > ts-errors.json
🔍 PHASE 1: INITIAL DIAGNOSIS
Get Error Overview
bash
# Count total errors
npx tsc --noEmit 2>&1 | grep -c "error TS"

# Check if errors are from node_modules
npx tsc --noEmit 2>&1 | grep "node_modules" | wc -l

# Get errors excluding node_modules
npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "react-datepicker" | head -20
Group Errors by File
bash
# Show files with most errors
npx tsc --noEmit 2>&1 | grep -o "src/[^:]*" | sort | uniq -c | sort -rn

# Check specific folder (e.g., snapshots)
npx tsc --noEmit src/app/snapshots/*.ts src/app/snapshots/*.tsx 2>&1 | head -20
📊 PHASE 2: ERROR GROUPING
Group by Error Code
bash
# Show most common error codes
npx tsc --noEmit 2>&1 | grep -o "TS[0-9]*" | sort | uniq -c | sort -rn

# Check specific error patterns
npx tsc --noEmit 2>&1 | grep "Cannot find name" | head -10
npx tsc --noEmit 2>&1 | grep "is not assignable" | head -5
npx tsc --noEmit 2>&1 | grep "Missing property" | head -5
Error Code Descriptions
bash
# Common error codes and their meanings:
# TS1005 - Expected ',' or '>' (syntax error)
# TS1128 - Declaration or statement expected (missing semicolon/bracket)
# TS2304 - Cannot find name (missing import)
# TS2322 - Type mismatch
# TS2741 - Missing property
# TS1003 - Expected identifier
# TS1109 - Expression expected
📄 PHASE 3: FILE-SPECIFIC ANALYSIS
Analyze Worst File
bash
# Find file with most errors
FILE=$(npx tsc --noEmit 2>&1 | grep -o "src/[^:]*" | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')

# Show errors for that file
npx tsc --noEmit "$FILE" 2>&1

# Count errors in file
npx tsc --noEmit "$FILE" 2>&1 | grep -c "error TS"
Show File Context
bash
# Show first 50 lines of problematic file
head -50 src/app/snapshots/sampleSnapshotInstance.ts

# Show with line numbers
cat -n src/app/snapshots/sampleSnapshotInstance.ts | head -50
🔬 PHASE 4: LINE-BY-LINE DEBUGGING
Examine Specific Lines
bash
# Show lines around error (e.g., line 332)
sed -n '330,335p' src/app/snapshots/sampleSnapshotInstance.ts

# Show with more context
awk 'NR>=325 && NR<=340 {printf "%3d: %s\n", NR, $0}' src/app/snapshots/sampleSnapshotInstance.ts

# Show exact line with character analysis
LINE=$(sed -n '332p' src/app/snapshots/sampleSnapshotInstance.ts)
echo "Line: $LINE"
echo "Length: ${#LINE}"
Character-Level Analysis
bash
# Show characters with ASCII codes
sed -n '332p' src/app/snapshots/sampleSnapshotInstance.ts | od -c | head -5

# Show with column markers
sed -n '332p' src/app/snapshots/sampleSnapshotInstance.ts | cat -A

# Check character at specific column (e.g., column 91)
LINE=$(sed -n '332p' src/app/snapshots/sampleSnapshotInstance.ts)
if [ ${#LINE} -ge 91 ]; then
    echo "Character at col 91: '${LINE:90:1}'"
fi
🔧 PHASE 5: AUTO-FIX ATTEMPTS
Common Syntax Fixes
bash
# Fix missing > in generics (Type<Param = value → Type<Param> = value)
sed -i 's/\(<[^>]*\) = /\1> = /g' filename.ts

# Fix missing semicolons
sed -i 's/\([^;{}]\)\s*$/\1;/g' filename.ts

# Remove extra commas before >
sed -i 's/,\s*>/ >/g' filename.ts

# Fix space in => ( = > → =>)
sed -i 's/= *>/=>/g' filename.ts
Backup Before Fixing
bash
# Always backup first!
cp filename.ts filename.ts.backup.$(date +%s)

# Test fix without modifying
sed 's/pattern/replacement/g' filename.ts

# Apply fix and test
sed -i.bak 's/pattern/replacement/g' filename.ts
npx tsc --noEmit filename.ts 2>&1 | head -5
🛠️ PHASE 6: MANUAL FIX GUIDANCE
Missing Identifier Patterns
bash
# Find all missing identifiers
npx tsc --noEmit 2>&1 | grep "Cannot find name" | grep -o "'[^']*'" | sort | uniq -c | sort -rn

# Search for definitions in project
grep -r "export.*IdentifierName" src/ --include="*.ts" --include="*.tsx"

# Check import statements in file
grep -n "import" src/app/snapshots/sampleSnapshotInstance.ts | head -20
Type/Interface Missing
For errors like Cannot find name 'CreateSnapshotsPayload':

bash
# 1. Check if type exists
find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "CreateSnapshotsPayload" | head -5

# 2. Check import paths
grep -n "from.*snapshot" src/app/snapshots/sampleSnapshotInstance.ts

# 3. Common locations for missing types:
#    - @/core/typings/snapshotTypes.ts
#    - @/core/interfaces/payload/payloadTypes.ts
#    - @/core/snapshots/types.ts
Generic Parameter Consistency
When generic parameters don't match:

bash
# Check line for mismatched generics
sed -n '332p' src/app/snapshots/sampleSnapshotInstance.ts | grep -o "<[^>]*>"

# Fix pattern: Change SnapshotUnion<T, K, Meta> to SnapshotUnion<AppEntity, AppK, AppMeta>
sed -i '332s/SnapshotUnion<T, K, Meta/SnapshotUnion<AppEntity, AppK, AppMeta/' filename.ts
✅ PHASE 7: VERIFICATION
Test Fixes
bash
# Test single file
npx tsc --noEmit src/app/snapshots/sampleSnapshotInstance.ts 2>&1 | head -10

# Test folder
npx tsc --noEmit --skipLibCheck src/app/snapshots/*.ts src/app/snapshots/*.tsx 2>&1 | head -20

# Count remaining errors
npx tsc --noEmit --skipLibCheck src/app/snapshots/*.ts src/app/snapshots/*.tsx 2>&1 | grep -c "error TS"
Progress Tracking
bash
# Compare before/after
BEFORE=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
# ... apply fixes ...
AFTER=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
echo "Progress: $((BEFORE - AFTER)) errors fixed, $AFTER remaining"
🚀 QUICK WORKFLOWS
Complete Snapshot Debug Workflow
bash
# 1. Initial check
npx tsc --noEmit --skipLibCheck src/app/snapshots/*.ts src/app/snapshots/*.tsx 2>&1 | head -20

# 2. Find worst file
FILE=$(npx tsc --noEmit --skipLibCheck src/app/snapshots/*.ts src/app/snapshots/*.tsx 2>&1 | grep -o "src/[^:]*" | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')

# 3. Show first error location
LINE=$(npx tsc --noEmit "$FILE" 2>&1 | head -1 | grep -o "([0-9]*," | tr -d '(),')

# 4. Show context
sed -n "$((LINE-3)),$((LINE+3))p" "$FILE"

# 5. Fix common issues
sed -i.bak 's/\(<[^>]*\) = /\1> = /g' "$FILE"
sed -i 's/= *>/=>/g' "$FILE"

# 6. Verify
npx tsc --noEmit "$FILE" 2>&1 | head -5
Missing Import Workflow
bash
# 1. Find all missing identifiers
MISSING=$(npx tsc --noEmit 2>&1 | grep "Cannot find name" | grep -o "'[^']*'" | tr -d "'" | sort | uniq)

# 2. For each, search in project
for ID in $MISSING; do
    echo "Searching for: $ID"
    grep -r "export.*$ID" src/ --include="*.ts" --include="*.tsx" | head -2
done

# 3. Check AppEntity.ts for type definitions
grep -n "export.*type\|export.*interface" src/app/typings/entities/AppEntity.ts
📝 USEFUL ONE-LINERS
Quick Diagnostics
bash
# Show first 5 errors with file names
npx tsc --noEmit 2>&1 | grep -E "(error TS|\.tsx?\([0-9]+,[0-9]+\))" | head -10

# Count errors by file
npx tsc --noEmit 2>&1 | grep -o "src/[^:]*" | sort | uniq -c | sort -rn | head -10

# Show only syntax errors (TS1005, TS1128)
npx tsc --noEmit 2>&1 | grep -E "(TS1005|TS1128)" | head -10

# Show only missing identifiers (TS2304)
npx tsc --noEmit 2>&1 | grep "TS2304" | head -10
File Analysis
bash
# Show import statements in file
grep -n "^import\|^export" filename.ts | head -20

# Show type/interface definitions
grep -n "type\|interface\|class" filename.ts | head -20

# Count lines in file
wc -l filename.ts

# Show file structure
head -100 filename.ts | tail -50
🎯 TROUBLESHOOTING COMMON ISSUES
1. Node_modules Errors
bash
# Skip library checking
npx tsc --noEmit --skipLibCheck

# Or ignore specific packages
npx tsc --noEmit 2>&1 | grep -v "react-datepicker" | grep -v "node_modules"
2. Generic Type Issues
bash
# Check for unclosed generics
grep -n "<[^>]*$" filename.ts

# Check for = instead of >
grep -n "<.*=" filename.ts

# Fix missing closing >
sed -i '/<[^>]*$/s/$/>/' filename.ts
3. Missing Type Definitions
bash
# Search for type in project
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "CreateSnapshotsPayload" {} \;

# Check common type locations
ls -la src/app/typings/
ls -la src/app/interfaces/
ls -la src/app/types/
🔄 RECOVERY COMMANDS
Restore Backup
bash
# Find latest backup
ls -t *.backup.* | head -1

# Restore
cp filename.ts.backup.1234567890 filename.ts

# Or use git if available
git checkout -- filename.ts
Test Without Modifying
bash
# Create test copy
cp filename.ts filename.test.ts
sed -i 's/pattern/replacement/g' filename.test.ts
npx tsc --noEmit filename.test.ts 2>&1 | head -5
rm filename.test.ts
📈 PROGRESS MONITORING
bash
# Create error snapshot
npx tsc --noEmit --pretty false 2>&1 > errors-$(date +%Y%m%d-%H%M%S).txt

# Compare with previous
diff errors-before.txt errors-after.txt | head -20

# Count fixed errors
BEFORE=$(cat errors-before.txt | grep -c "error TS")
AFTER=$(cat errors-after.txt | grep -c "error TS")
echo "Fixed: $((BEFORE - AFTER)) errors, Remaining: $AFTER"
Quick Reference Card
Most Used Commands:
bash
# 1. Quick error check
pnpm type-check

# 2. Skip library errors
npx tsc --noEmit --skipLibCheck

# 3. Check specific file
npx tsc --noEmit filename.ts 2>&1 | head -10

# 4. Show context around line
sed -n 'X-3,X+3p' filename.ts

# 5. Fix missing generic >
sed -i 's/\(<[^>]*\) = /\1> = /g' filename.ts

# 6. Find missing identifiers
npx tsc --noEmit 2>&1 | grep "Cannot find name" | head -10
Error Priority:
Syntax errors (TS1005, TS1128) - Fix first

Missing imports (TS2304) - Group and fix together

Type mismatches (TS2322) - Fix after imports

Missing properties (TS2741) - Add to interfaces

Library errors - Skip with --skipLibCheck

text

## **2. Create `ts-debug-scripts.sh`** (Executable shell scripts)

```bash
#!/bin/bash
# ts-debug-scripts.sh - Collection of TypeScript debugging scripts

# Configuration
PROJECT_ROOT=$(pwd)
ERROR_FILE="$PROJECT_ROOT/ts-errors.json"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========== PHASE 1: INITIAL DIAGNOSIS ==========

diagnose_errors() {
    echo -e "${BLUE}🔍 Phase 1: Initial Diagnosis${NC}"
    echo "========================================"
    
    # Get total errors
    TOTAL_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
    echo -e "${YELLOW}Total TypeScript errors: $TOTAL_ERRORS${NC}"
    
    # Check node_modules errors
    NODE_MODULES_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "node_modules")
    if [ $NODE_MODULES_ERRORS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $NODE_MODULES_ERRORS errors from node_modules${NC}"
        echo "   Use: npx tsc --noEmit --skipLibCheck"
    fi
    
    # Show files with most errors
    echo -e "\n${BLUE}📁 Files with most errors:${NC}"
    npx tsc --noEmit 2>&1 | grep -o "src/[^:]*" | sort | uniq -c | sort -rn | head -5 | while read count file; do
        echo "  $count errors: $file"
    done
    
    # Save errors to file
    npx tsc --noEmit --pretty false 2>&1 > "$ERROR_FILE"
    echo -e "\n${GREEN}✅ Errors saved to: $ERROR_FILE${NC}"
}

# ========== PHASE 2: ERROR GROUPING ==========

group_errors() {
    echo -e "\n${BLUE}📊 Phase 2: Error Grouping${NC}"
    echo "========================================"
    
    if [ ! -f "$ERROR_FILE" ]; then
        echo -e "${RED}❌ Error file not found. Run diagnose_errors first.${NC}"
        return 1
    fi
    
    # Group by error code
    echo -e "${BLUE}Top error codes:${NC}"
    grep -o "TS[0-9]*" "$ERROR_FILE" | sort | uniq -c | sort -rn | head -10 | while read count code; do
        percentage=$((count * 100 / $(grep -c "error TS" "$ERROR_FILE")))
        echo "  $count× $code (${percentage}%)"
    done
    
    # Show missing identifiers
    echo -e "\n${BLUE}🔍 Missing identifiers:${NC}"
    grep "Cannot find name" "$ERROR_FILE" | grep -o "'[^']*'" | sort | uniq -c | sort -rn | head -10
    
    # Show syntax errors
    echo -e "\n${BLUE}⚡ Syntax errors (TS1005, TS1128):${NC}"
    grep -E "(TS1005|TS1128)" "$ERROR_FILE" | head -5
}

# ========== PHASE 3: FILE ANALYSIS ==========

analyze_file() {
    local FILE=${1:-$(npx tsc --noEmit 2>&1 | grep -o "src/[^:]*" | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')}
    
    if [ -z "$FILE" ]; then
        echo -e "${RED}❌ No file specified and couldn't find worst file${NC}"
        return 1
    fi
    
    echo -e "\n${BLUE}📄 Phase 3: Analyzing $FILE${NC}"
    echo "========================================"
    
    # Count errors in file
    ERROR_COUNT=$(npx tsc --noEmit "$FILE" 2>&1 | grep -c "error TS")
    echo -e "${YELLOW}Total errors in file: $ERROR_COUNT${NC}"
    
    # Show first error
    FIRST_ERROR=$(npx tsc --noEmit "$FILE" 2>&1 | head -1)
    if [[ $FIRST_ERROR =~ \(([0-9]+),([0-9]+)\) ]]; then
        LINE=${BASH_REMATCH[1]}
        COL=${BASH_REMATCH[2]}
        echo -e "${YELLOW}First error at line $LINE, column $COL${NC}"
        
        # Show context
        echo -e "\n${BLUE}Context (lines $((LINE-3))-$((LINE+3))):${NC}"
        sed -n "$((LINE-3)),$((LINE+3))p" "$FILE" | cat -n
    fi
    
    # Show error types in file
    echo -e "\n${BLUE}Error types in file:${NC}"
    npx tsc --noEmit "$FILE" 2>&1 | grep -o "TS[0-9]*" | sort | uniq -c | sort -rn
}

# ========== PHASE 4: LINE DEBUGGING ==========

debug_line() {
    local FILE=$1
    local LINE=$2
    
    if [ -z "$FILE" ] || [ -z "$LINE" ]; then
        echo -e "${RED}❌ Usage: debug_line <file> <line>${NC}"
        return 1
    fi
    
    echo -e "\n${BLUE}🔬 Phase 4: Debugging line $LINE in $FILE${NC}"
    echo "========================================"
    
    # Get the line
    LINE_CONTENT=$(sed -n "${LINE}p" "$FILE")
    echo -e "${YELLOW}Line content:${NC}"
    echo "$LINE_CONTENT"
    echo -e "${YELLOW}Length: ${#LINE_CONTENT} characters${NC}"
    
    # Character analysis
    echo -e "\n${BLUE}Character analysis:${NC}"
    echo -n "  "
    for (( i=0; i<${#LINE_CONTENT}; i++ )); do
        if (( i % 10 == 0 )) && (( i > 0 )); then
            echo -n "|"
        else
            echo -n " "
        fi
    done
    echo
    echo -n "  "
    for (( i=0; i<${#LINE_CONTENT}; i++ )); do
        echo -n "$((i % 10))"
    done
    echo
    
    # Check for common issues
    echo -e "\n${BLUE}🎯 Common issue checks:${NC}"
    
    # Check for unclosed <
    if [[ $LINE_CONTENT == *"<"* ]] && [[ $LINE_CONTENT != *">"* ]]; then
        echo -e "  ${RED}⚠️  Missing closing >${NC}"
    fi
    
    # Check for = where > should be
    if [[ $LINE_CONTENT == *"<"*"="* ]] && [[ $LINE_CONTENT != *">"* ]]; then
        echo -e "  ${RED}⚠️  Possible = instead of >${NC}"
        echo "     Try: sed -i '${LINE}s/\\(<[^>]*\\) = /\\1> = /' \"$FILE\""
    fi
    
    # Check for space in =>
    if [[ $LINE_CONTENT == *"= "*">"* ]]; then
        echo -e "  ${RED}⚠️  Space in =>${NC}"
        echo "     Try: sed -i '${LINE}s/= *>/=>/' \"$FILE\""
    fi
}

# ========== PHASE 5: AUTO FIX ==========

auto_fix_common() {
    local FILE=$1
    
    if [ -z "$FILE" ]; then
        echo -e "${RED}❌ Usage: auto_fix_common <file>${NC}"
        return 1
    fi
    
    echo -e "\n${BLUE}🔧 Phase 5: Auto-fixing common issues in $FILE${NC}"
    echo "========================================"
    
    # Create backup
    BACKUP="${FILE}.backup.$(date +%s)"
    cp "$FILE" "$BACKUP"
    echo -e "${GREEN}✅ Backup created: $BACKUP${NC}"
    
    # Fix common patterns
    echo -e "\n${BLUE}Applying fixes:${NC}"
    
    # Fix space in =>
    if grep -q "= *>" "$FILE"; then
        sed -i 's/= *>/=>/g' "$FILE"
        echo "  ✅ Fixed: = > to =>"
    fi
    
    # Fix missing > in generics
    if grep -q "<[^>]* = " "$FILE"; then
        sed -i 's/\(<[^>]*\) = /\1> = /g' "$FILE"
        echo "  ✅ Fixed: <Type = to <Type> ="
    fi
    
    # Fix extra comma before >
    if grep -q ", *>" "$FILE"; then
        sed -i 's/, *>/ >/g' "$FILE"
        echo "  ✅ Fixed: , > to >"
    fi
    
    # Test fixes
    echo -e "\n${BLUE}Testing fixes:${NC}"
    ERROR_COUNT_AFTER=$(npx tsc --noEmit "$FILE" 2>&1 | grep -c "error TS")
    echo "  Errors after fix: $ERROR_COUNT_AFTER"
    
    if [ -f "$BACKUP" ]; then
        ERROR_COUNT_BEFORE=$(npx tsc --noEmit "$BACKUP" 2>&1 | grep -c "error TS")
        echo "  Errors before: $ERROR_COUNT_BEFORE"
        echo "  Fixed: $((ERROR_COUNT_BEFORE - ERROR_COUNT_AFTER)) errors"
    fi
    
    echo -e "\n${GREEN}🔄 To restore backup:${NC}"
    echo "  cp \"$BACKUP\" \"$FILE\""
}

# ========== PHASE 6: MISSING IDENTIFIERS ==========

find_missing_identifiers() {
    echo -e "\n${BLUE}🔍 Phase 6: Finding missing identifiers${NC}"
    echo "========================================"
    
    # Extract missing identifiers
    echo -e "${BLUE}Most common missing identifiers:${NC}"
    grep "Cannot find name" "$ERROR_FILE" 2>/dev/null | grep -o "'[^']*'" | tr -d "'" | sort | uniq -c | sort -rn | head -20 | while read count identifier; do
        echo "  $count× $identifier"
        
        # Search for definition
        FOUND=$(grep -r "export.*$identifier" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -1)
        if [ -n "$FOUND" ]; then
            FILE=$(echo "$FOUND" | cut -d: -f1)
            echo "    → Found in: $(basename "$FILE")"
            echo "    → Import: import { $identifier } from '${FILE%.*}'"
        fi
    done
}

# ========== PHASE 7: VERIFICATION ==========

verify_fixes() {
    echo -e "\n${BLUE}✅ Phase 7: Verification${NC}"
    echo "========================================"
    
    CURRENT_ERRORS=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS")
    echo -e "${YELLOW}Current errors: $CURRENT_ERRORS${NC}"
    
    if [ -f "$ERROR_FILE" ]; then
        INITIAL_ERRORS=$(grep -c "error TS" "$ERROR_FILE")
        echo -e "${YELLOW}Initial errors: $INITIAL_ERRORS${NC}"
        echo -e "${YELLOW}Progress: $((INITIAL_ERRORS - CURRENT_ERRORS)) errors fixed${NC}"
        
        if [ $CURRENT_ERRORS -eq 0 ]; then
            echo -e "${GREEN}🎉 All errors resolved!${NC}"
        elif [ $CURRENT_ERRORS -lt $INITIAL_ERRORS ]; then
            echo -e "${GREEN}📈 Progress made!${NC}"
        else
            echo -e "${YELLOW}⚠️  Still working on it...${NC}"
        fi
    fi
    
    # Show remaining error types
    echo -e "\n${BLUE}Remaining error types:${NC}"
    npx tsc --noEmit --skipLibCheck 2>&1 | grep -o "TS[0-9]*" | sort | uniq -c | sort -rn
}

# ========== COMPLETE WORKFLOW ==========

complete_workflow() {
    echo -e "${BLUE}🚀 Starting Complete TypeScript Debug Workflow${NC}"
    echo "================================================"
    
    diagnose_errors
    group_errors
    
    # Find worst file
    WORST_FILE=$(npx tsc --noEmit 2>&1 | grep -o "src/[^:]*" | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')
    
    if [ -n "$WORST_FILE" ]; then
        analyze_file "$WORST_FILE"
        
        # Get first error line
        FIRST_LINE=$(npx tsc --noEmit "$WORST_FILE" 2>&1 | head -1 | grep -o "([0-9]*," | tr -d '(),')
        if [ -n "$FIRST_LINE" ]; then
            debug_line "$WORST_FILE" "$FIRST_LINE"
        fi
        
        read -p "Attempt auto-fix? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            auto_fix_common "$WORST_FILE"
        fi
    fi
    
    find_missing_identifiers
    verify_fixes
    
    echo -e "\n${GREEN}✅ Workflow complete!${NC}"
}

# ========== HELP ==========

show_help() {
    echo -e "${BLUE}TypeScript Debugging Scripts${NC}"
    echo "========================================"
    echo ""
    echo "Available commands:"
    echo ""
    echo "  ${YELLOW}./ts-debug.sh diagnose${NC}     - Initial error diagnosis"
    echo "  ${YELLOW}./ts-debug.sh group${NC}        - Group errors by type"
    echo "  ${YELLOW}./ts-debug.sh analyze <file>${NC} - Analyze specific file"
    echo "  ${YELLOW}./ts-debug.sh debug <file> <line>${NC} - Debug specific line"
    echo "  ${YELLOW}./ts-debug.sh fix <file>${NC}   - Auto-fix common issues"
    echo "  ${YELLOW}./ts-debug.sh missing${NC}      - Find missing identifiers"
    echo "  ${YELLOW}./ts-debug.sh verify${NC}       - Verify fixes"
    echo "  ${YELLOW}./ts-debug.sh workflow${NC}     - Complete debugging workflow"
    echo "  ${YELLOW}./ts-debug.sh help${NC}         - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./ts-debug.sh workflow"
    echo "  ./ts-debug.sh analyze src/app/snapshots/sampleSnapshotInstance.ts"
    echo "  ./ts-debug.sh debug src/app/snapshots/sampleSnapshotInstance.ts 332"
    echo ""
}

# ========== MAIN ==========

main() {
    case $1 in
        "diagnose")
            diagnose_errors
            ;;
        "group")
            group_errors
            ;;
        "analyze")
            analyze_file "$2"
            ;;
        "debug")
            debug_line "$2" "$3"
            ;;
        "fix")
            auto_fix_common "$2"
            ;;
        "missing")
            find_missing_identifiers
            ;;
        "verify")
            verify_fixes
            ;;
        "workflow")
            complete_workflow
            ;;
        "help"|"")
            show_help
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            show_help
            ;;
    esac
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
Make it executable:

bash
chmod +x ts-debug-scripts.sh
3. Create package-scripts-reference.json
json
{
  "scripts": {
    "ts:diagnose": "./ts-debug-scripts.sh diagnose",
    "ts:group": "./ts-debug-scripts.sh group",
    "ts:analyze": "./ts-debug-scripts.sh analyze",
    "ts:debug": "./ts-debug-scripts.sh debug",
    "ts:fix": "./ts-debug-scripts.sh fix",
    "ts:missing": "./ts-debug-scripts.sh missing",
    "ts:verify": "./ts-debug-scripts.sh verify",
    "ts:workflow": "./ts-debug-scripts.sh workflow",
    
    "debug:snapshots": "npx tsc --noEmit --skipLibCheck src/app/snapshots/*.ts src/app/snapshots/*.tsx 2>&1 | head -20",
    "debug:file": "npx tsc --noEmit --skipLibCheck",
    "debug:line": "sed -n",
    
    "fix:generics": "sed -i 's/\\(<[^>]*\\) = /\\1> = /g'",
    "fix:arrow": "sed -i 's/= *>/=>/g'",
    "fix:commas": "sed -i 's/, *>/ >/g'",
    
    "find:missing": "grep \"Cannot find name\" ts-errors.json | grep -o \"'[^']*'\" | sort | uniq -c | sort -rn",
    "find:types": "find src/ -name \"*.ts\" -o -name \"*.tsx\" | xargs grep -l",
    
    "backup:create": "cp",
    "backup:restore": "cp *.backup.*"
  },
  "description": "TypeScript debugging commands organized by phase",
  "phases": {
    "1": "Initial Diagnosis - Get error overview",
    "2": "Error Grouping - Find patterns",
    "3": "File Analysis - Focus on worst file",
    "4": "Line Debugging - Character-level analysis",
    "5": "Auto Fix - Apply common fixes",
    "6": "Manual Fix - Missing identifiers",
    "7": "Verification - Check progress"
  }
}
Usage:
Now you have three organized resources:

ts-error-debug-commands.md - Comprehensive reference document

ts-debug-scripts.sh - Executable scripts for each phase

package-scripts-reference.json - Organized command reference

To use:

bash
# Run complete workflow
./ts-debug-scripts.sh workflow

# Or run specific phases
./ts-debug-scripts.sh diagnose
./ts-debug-scripts.sh analyze src/app/snapshots/sampleSnapshotInstance.ts
./ts-debug-scripts.sh debug src/app/snapshots/sampleSnapshotInstance.ts 332