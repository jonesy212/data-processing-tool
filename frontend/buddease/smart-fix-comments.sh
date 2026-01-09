#!/bin/bash
echo "🔍 TypeScript Comment Fixer - FIXED DEDUPLICATION WITH BACKUP SUPPORT"

# BACKUP SYSTEM
BACKUP_DIR=".comment-fix-backups"
SESSION_ID="comment-fix-$(date +%Y%m%d-%H%M%S)"
SESSION_BACKUP_DIR="$BACKUP_DIR/$SESSION_ID"
BACKUP_MADE=false

# Create backup system function
create_backup() {
  local file="$1"
  local backup_type="$2"
  
  if [[ ! -f "$file" ]]; then
    echo "❌ Cannot backup non-existent file: $file"
    return 1
  fi
  
  # Ensure backup directory exists
  mkdir -p "$SESSION_BACKUP_DIR"
  
  # Create relative path for backup
  local relative_path="${file#./}"
  local backup_path="$SESSION_BACKUP_DIR/$relative_path"
  
  # Ensure backup directory structure exists
  mkdir -p "$(dirname "$backup_path")"
  
  # Copy file to backup
  cp "$file" "$backup_path"
  
  echo "💾 Backed up: $relative_path (type: $backup_type)"
  BACKUP_MADE=true
}

# Create session info file
create_session_info() {
  local files_fixed=("$@")
  mkdir -p "$SESSION_BACKUP_DIR"
  
  cat > "$SESSION_BACKUP_DIR/session-info.json" << EOF
{
  "sessionId": "$SESSION_ID",
  "timestamp": "$(date -Iseconds)",
  "backupType": "comment-fix",
  "filesBackedUp": $(printf '%s\n' "${files_fixed[@]}" | jq -R . | jq -s .),
  "command": "$0 $*",
  "note": "Backup created before applying comment fixes"
}
EOF
}

# Rollback function
rollback_session() {
  local session_id="$1"
  local backup_path="$BACKUP_DIR/$session_id"
  
  if [[ ! -d "$backup_path" ]]; then
    echo "❌ Backup session not found: $session_id"
    return 1
  fi
  
  echo "🔄 Rolling back session: $session_id"
  
  # Find all backup files and restore them
  find "$backup_path" -type f -name "*.ts" -o -name "*.tsx" | while read -r backup_file; do
    local relative_path="${backup_file#$backup_path/}"
    local original_path="./$relative_path"
    
    if [[ -f "$backup_file" ]]; then
      echo "   Restoring: $relative_path"
      cp "$backup_file" "$original_path"
    fi
  done
  
  echo "✅ Rollback complete for session: $session_id"
}

# Parse arguments
AUTO_FIX=false
ROLLBACK=false
SESSION_TO_ROLLBACK=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --auto-fix)
      AUTO_FIX=true
      shift
      ;;
    --rollback)
      ROLLBACK=true
      if [[ -n "$2" && ! "$2" =~ ^- ]]; then
        SESSION_TO_ROLLBACK="$2"
        shift 2
      else
        # Use latest session
        SESSION_TO_ROLLBACK=$(ls -t "$BACKUP_DIR" 2>/dev/null | head -1)
        shift
      fi
      ;;
    --list-backups)
      echo "📦 Available backup sessions:"
      ls -lt "$BACKUP_DIR" 2>/dev/null || echo "   No backups found"
      exit 0
      ;;
    *)
      TARGET="$1"
      shift
      ;;
  esac
done

# Handle rollback
if [[ "$ROLLBACK" == true ]]; then
  if [[ -z "$SESSION_TO_ROLLBACK" ]]; then
    echo "❌ No session specified for rollback"
    echo "   Usage: $0 --rollback [session-id]"
    echo "   Or use --list-backups to see available sessions"
    exit 1
  fi
  
  rollback_session "$SESSION_TO_ROLLBACK"
  exit 0
fi

# sed wrapper
sed_in_place() {
  local script="$1"
  local file="$2"
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "$script" "$file"
  else
    sed -i "$script" "$file"
  fi
}

# TARGET FILE or DIR
if [[ -z "$TARGET" ]]; then
  echo "⚠️  No target specified, checking entire app..."
  TARGET_FILES=$(find src -name "*.ts" -o -name "*.tsx")
else
  # FIRST: Check if it exists as given
  if [[ -f "$TARGET" ]]; then
    echo "🎯 Targeting file: $TARGET"
    TARGET_FILES="$TARGET"
  elif [[ -d "$TARGET" ]]; then
    echo "🎯 Targeting directory: $TARGET"
    TARGET_FILES=$(find "$TARGET" -name "*.ts" -o -name "*.tsx")
  else
    # Search for the file in the entire project
    echo "🔍 Searching for file matching: $TARGET"
    
    # First try exact filename match
    FOUND_FILES=$(find . -name "$TARGET" -type f 2>/dev/null | grep -E "\.(ts|tsx)$" || true)
    
    # If no exact match, try partial match
    if [[ -z "$FOUND_FILES" ]]; then
      FOUND_FILES=$(find . -name "*$TARGET*" -type f 2>/dev/null | grep -E "\.(ts|tsx)$" || true)
    fi
    
    # Filter out node_modules and build directories
    FOUND_FILES=$(echo "$FOUND_FILES" | grep -v node_modules | grep -v build | grep -v dist)
    
    FILE_COUNT=$(echo "$FOUND_FILES" | wc -l | tr -d ' ')
    
    if [[ $FILE_COUNT -eq 1 ]] && [[ -n "$FOUND_FILES" ]]; then
      TARGET=$(echo "$FOUND_FILES" | head -1)
      echo "🎯 Found: $TARGET"
      TARGET_FILES="$TARGET"
    elif [[ $FILE_COUNT -gt 1 ]]; then
      echo "❌ Found $FILE_COUNT matching files. Please be more specific:"
      echo ""
      echo "$FOUND_FILES" | while read -r found_file; do
        echo "   • $found_file"
      done
      echo ""
      echo "Try: $0 $(echo "$FOUND_FILES" | head -1)"
      exit 1
    else
      echo "❌ File not found: $TARGET"
      echo ""
      echo "Tips:"
      echo "   • Use full path: $0 src/core/typings/milestoneTypes.ts"
      echo "   • Or navigate to file directory first"
      echo "   • Or check spelling"
      exit 1
    fi
  fi
fi

# Check for errors first - PRE-FLIGHT CHECK
echo "🔍 Running TypeScript pre-flight check..."
ALL_ERRORS=$(npx tsc --noEmit --skipLibCheck 2>&1 || true)
TOTAL_ERRORS=$(echo "$ALL_ERRORS" | grep -c "error" || true)
echo "📊 Found $TOTAL_ERRORS total errors"

# Identify files that actually need fixing
declare -a FILES_TO_FIX=()
declare -a FILES_BACKED_UP=()

echo "🔍 Identifying files with comment-related errors..."
for file in $TARGET_FILES; do
  FILE_FOR_MATCH=$(echo "$file" | sed 's|^\./||')
  FILE_ERRORS=$(echo "$ALL_ERRORS" | grep -E "(\./)?$FILE_FOR_MATCH" || true)
  
  if [[ -n "$FILE_ERRORS" ]]; then
    # Check if this file has comment-related errors
    if echo "$FILE_ERRORS" | grep -q "TS1434\|TS1109"; then
      FILES_TO_FIX+=("$file")
    fi
  fi
done

echo "📊 Found ${#FILES_TO_FIX[@]} files with comment-related errors"

# Create backups for files that need fixing
if [[ ${#FILES_TO_FIX[@]} -gt 0 ]]; then
  echo "💾 Creating backups for ${#FILES_TO_FIX[@]} files..."
  for file in "${FILES_TO_FIX[@]}"; do
    create_backup "$file" "pre-comment-fix"
    FILES_BACKED_UP+=("$file")
  done
  
  # Create session info
  create_session_info "${FILES_BACKED_UP[@]}"
  
  echo "✅ Backups created in: $SESSION_BACKUP_DIR"
  echo "   Rollback with: $0 --rollback $SESSION_ID"
fi

# Process each file that needs fixing
TOTAL_FILES=${#FILES_TO_FIX[@]}
echo "📊 Processing $TOTAL_FILES files with errors"

COUNT=0
for file in "${FILES_TO_FIX[@]}"; do
  COUNT=$((COUNT + 1))
  echo ""
  echo "--- File $COUNT of $TOTAL_FILES: $(basename "$file") ---"
  
  FILE_FOR_MATCH=$(echo "$file" | sed 's|^\./||')
  FILE_ERRORS=$(echo "$ALL_ERRORS" | grep -E "(\./)?$FILE_FOR_MATCH" || true)
  
  if [[ -z "$FILE_ERRORS" ]]; then
    echo "✅ No errors found for this file"
    continue
  fi
    
  # Collect fixes from UNIQUE errors only
  declare -a fixes=()
  
  while IFS= read -r error_line; do
    if [[ "$error_line" =~ (\./)?$FILE_FOR_MATCH\(([0-9]+), ]]; then
      line_num="${BASH_REMATCH[2]}"
      error_type=$(echo "$error_line" | grep -o "TS[0-9]\+")
      line_content=$(sed -n "${line_num}p" "$file" 2>/dev/null || echo "")
      
      # Skip if already has // or /* comment
      if [[ "$line_content" =~ ^[[:space:]]*// ]] || [[ "$line_content" =~ ^[[:space:]]*/\* ]]; then
        continue
      fi
      
      # Check error type
      if [[ "$error_type" == "TS1434" ]] && [[ "$line_content" =~ ^[[:space:]]*[A-Za-z] ]]; then
        fixes+=("$line_num:text")
      elif [[ "$error_type" == "TS1109" ]] && [[ "$line_content" =~ ^[[:space:]]*-{4,} ]]; then
        fixes+=("$line_num:dash")
      fi
    fi
  done <<< "$FILE_ERRORS"
  
  FIX_COUNT=${#fixes[@]}
  echo "🔧 Found $FIX_COUNT unique line errors (was $(echo "$FILE_ERRORS" | wc -l) total errors)"
  
  # Fix from BOTTOM to TOP
  if [[ $FIX_COUNT -gt 0 ]]; then
    echo "   🔧 Applying $FIX_COUNT fixes..."
    
    # Sort by line number descending and remove duplicates
    declare -A fixed_lines
    declare -a unique_fixes=()
    
    IFS=$'\n' sorted_fixes=($(printf "%s\n" "${fixes[@]}" | sort -t: -k1 -nr))
    unset IFS
    
    for fix in "${sorted_fixes[@]}"; do
      IFS=':' read -r line_num fix_type <<< "$fix"
      
      if [[ -n "${fixed_lines[$line_num]}" ]]; then
        continue
      fi
      
      fixed_lines[$line_num]=1
      unique_fixes+=("$fix")
    done
    
    UNIQUE_COUNT=${#unique_fixes[@]}
    echo "   🔧 After deduplication: $UNIQUE_COUNT unique lines to fix"
    
    for fix in "${unique_fixes[@]}"; do
      IFS=':' read -r line_num fix_type <<< "$fix"
      line_content=$(sed -n "${line_num}p" "$file" 2>/dev/null || echo "")
      
      if [[ -n "$line_content" ]]; then
        echo "      Line $line_num: ${line_content:0:60}..."
        
      if [[ "$AUTO_FIX" == true ]]; then
        sed_in_place "${line_num}s/^/\/\/ /" "$file"
        echo "      ✅ Fixed line $line_num"
      else
        while true; do
          read -p "      Add //? (y/n): " -n 1 -r
          echo  # move to new line
          
          # Check if input is empty (just Enter) or contains control characters
          if [[ -z "$REPLY" ]]; then
            echo "      ⏭️  Skipping line $line_num"
            break
          elif echo "$REPLY" | grep -q '[^[:alnum:]]' || [[ ${#REPLY} -gt 1 ]]; then
            # Handle arrow keys or special characters
            echo "      ⚠️  Invalid input. Please enter 'y' or 'n' only."
            continue
          elif [[ "$REPLY" =~ ^[Yy]$ ]]; then
            sed_in_place "${line_num}s/^/\/\/ /" "$file"
            echo "      ✅ Fixed line $line_num"
            break
          elif [[ "$REPLY" =~ ^[Nn]$ ]]; then
            echo "      ⏭️  Skipping line $line_num"
            break
          else
            echo "      ⚠️  Invalid input. Please enter 'y' or 'n' only."
          fi
        done
      fi
      fi
    done
  else
    echo "   ℹ️  No fixable lines found"
  fi
done

echo ""
echo "✅ Complete! Processed $COUNT files"

# Final message about backups
if [[ "$BACKUP_MADE" == true ]]; then
  echo ""
  echo "💾 Backups saved to: $SESSION_BACKUP_DIR"
  echo "🔄 Rollback command: $0 --rollback $SESSION_ID"
  echo "📋 List all backups: $0 --list-backups"
fi