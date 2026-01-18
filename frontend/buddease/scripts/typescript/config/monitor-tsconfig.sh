#!/bin/bash
set -euo pipefail

echo "🔍 Validating tsconfig files and exclude rules..."

# --- 1️⃣ Load required excludes ---
if [[ -f "tsconfig.excludes.json" ]]; then
  REQUIRED_EXCLUDES=($(jq -r '.exclude[]' tsconfig.excludes.json))
else
  echo "❌ tsconfig.excludes.json not found. Exiting."
  exit 1
fi

# --- 2️⃣ Auto-detect only PROJECT tsconfig*.json files (not node_modules) ---
CONFIGS=($(find . -name "node_modules" -prune -o -type f -name "tsconfig*.json" -print | sort))

FAIL=false

for config in "${CONFIGS[@]}"; do
  # Skip if config is in node_modules or is a backup file
  if [[ "$config" == *"node_modules"* ]] || [[ "$config" == *".backup."* ]]; then
    continue
  fi
  
  # Skip the excludes file itself
  if [[ "$config" == "./tsconfig.excludes.json" ]]; then
    continue
  fi
  
  echo ""
  echo "📄 Checking: $config"

  # --- Backup current tsconfig ---
  BACKUP_FILE="$config.backup.$(date +%s)"
  cp "$config" "$BACKUP_FILE"
  echo "  💾 Backup created: $BACKUP_FILE"

  # --- Check if this is tsconfig.base.json (should not extend anything) ---
  if [[ "$config" == "./tsconfig.base.json" ]]; then
    EXTENDS=$(jq -r '.extends // empty' "$config")
    if [[ -n "$EXTENDS" ]]; then
      echo "  ⚠ Removing 'extends' from tsconfig.base.json (should not extend anything)"
      jq 'del(.extends)' "$config" > "$config.tmp" && mv "$config.tmp" "$config"
    fi
    continue
  fi

  # --- For other tsconfig files, ensure they extend base ---
  EXTENDS=$(jq -r '.extends // empty' "$config")
  HAS_BASE_EXTEND=false
  
  # Check if extends contains tsconfig.base.json
  if [[ -n "$EXTENDS" ]]; then
    if [[ "$EXTENDS" == *"tsconfig.base.json"* ]]; then
      HAS_BASE_EXTEND=true
    elif [[ "$EXTENDS" =~ ^\[.*\]$ ]]; then
      # It's an array, check if tsconfig.base.json is in the array
      if jq -r '.extends[]' "$config" 2>/dev/null | grep -q "tsconfig.base.json"; then
        HAS_BASE_EXTEND=true
      fi
    fi
  fi

  if [[ "$HAS_BASE_EXTEND" == false ]]; then
    echo "  ⚠ Missing extends to tsconfig.base.json"
    
    # If extends is empty or null, create new extends
    if [[ -z "$EXTENDS" ]] || [[ "$EXTENDS" == "null" ]]; then
      echo "  ↪ Adding './tsconfig.base.json'"
      jq '. + {extends: "./tsconfig.base.json"}' "$config" > "$config.tmp" && mv "$config.tmp" "$config"
    elif [[ "$EXTENDS" =~ ^\[.*\]$ ]]; then
      # It's already an array, prepend tsconfig.base.json
      echo "  ↪ Prepending './tsconfig.base.json' to extends array"
      jq '.extends = ["./tsconfig.base.json"] + (.extends // [])' "$config" > "$config.tmp" && mv "$config.tmp" "$config"
    else
      # Convert single string to array with both values
      echo "  ↪ Converting to array with './tsconfig.base.json' and current extends"
      jq '.extends = ["./tsconfig.base.json", .extends]' "$config" > "$config.tmp" && mv "$config.tmp" "$config"
    fi
  else
    echo "  ✅ Already extends tsconfig.base.json"
  fi

  # --- Ensure exclude section exists ---
  if ! jq -e '.exclude' "$config" >/dev/null 2>&1; then
    echo "  ⚠ Missing 'exclude'. Adding empty array."
    jq ". + {exclude: []}" "$config" > "$config.tmp" && mv "$config.tmp" "$config"
  fi

  # --- Ensure all required excludes are present ---
  CURRENT_EXCLUDES=($(jq -r '.exclude[]?' "$config" 2>/dev/null))
  
  for exclude in "${REQUIRED_EXCLUDES[@]}"; do
    FOUND=false
    
    # Check if this exclude is already in the config
    for current in "${CURRENT_EXCLUDES[@]}"; do
      if [[ "$current" == "$exclude" ]]; then
        FOUND=true
        break
      fi
    done
    
    if [[ "$FOUND" == false ]]; then
      echo "  ⚠ Adding missing exclude: $exclude"
      jq ".exclude += [\"$exclude\"]" "$config" > "$config.tmp" && mv "$config.tmp" "$config"
      # Update current excludes array
      CURRENT_EXCLUDES+=("$exclude")
    fi
  done
done

# --- 3️⃣ Scan for unexcluded backup/temp directories ---
echo ""
echo "🔍 Scanning for unexcluded backup/temp/save directories..."

FOUND_UNEXCLUDED=()

# Simple pattern matching for common backup/temp directories
while IFS= read -r dir; do
  dir_name=$(basename "$dir")
  dir_path=${dir#./}
  
  MATCHED=false
  
  # Check against each exclude pattern
  for pattern in "${REQUIRED_EXCLUDES[@]}"; do
    # Use simple pattern matching
    if [[ "$dir_path" == $pattern ]] || 
       [[ "$dir_name" == $pattern ]] || 
       [[ "$dir_path" == */$pattern ]] ||
       [[ "$dir_path" == $pattern/* ]] ||
       [[ "$dir_path" == */$pattern/* ]]; then
      MATCHED=true
      break
    fi
    
    # Check for wildcard patterns
    if [[ "$pattern" == *"*"* ]]; then
      # Convert pattern to regex for matching
      pattern_regex=$(echo "$pattern" | sed 's/\*/.*/g')
      if [[ "$dir_path" =~ $pattern_regex ]] || [[ "$dir_name" =~ $pattern_regex ]]; then
        MATCHED=true
        break
      fi
    fi
  done
  
  if [[ "$MATCHED" == false ]]; then
    FOUND_UNEXCLUDED+=("$dir")
  fi
done < <(find . -name "node_modules" -prune -o -type d -name ".*" -print | grep -Ei "backup|temp|save|archived" | sort)

if (( ${#FOUND_UNEXCLUDED[@]} > 0 )); then
  echo ""
  echo "⚠️  Found potentially unexcluded directories:"
  for dir in "${FOUND_UNEXCLUDED[@]}"; do
    echo "  • $dir"
    echo "    Consider adding to tsconfig.excludes.json if this is a backup/temp directory"
  done
  # Don't fail for this - just warn
  # FAIL=true
fi

# --- 4️⃣ Final report ---
echo ""
echo "📊 Summary of checked tsconfig files:"
for config in "${CONFIGS[@]}"; do
  if [[ "$config" != *"node_modules"* ]] && [[ "$config" != *".backup."* ]] && [[ "$config" != "./tsconfig.excludes.json" ]]; then
    echo "  ✅ $config"
  fi
done

echo ""
echo "📋 Required exclude patterns:"
for exclude in "${REQUIRED_EXCLUDES[@]}"; do
  echo "  • $exclude"
done

if [[ "$FAIL" == true ]]; then
  echo ""
  echo "🚫 tsconfig validation failed. Fix the issues above."
  exit 1
else
  echo ""
  echo "✅ All project tsconfig files are validated and exclude rules enforced."
fi