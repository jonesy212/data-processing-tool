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

# --- 2️⃣ Auto-detect all tsconfig*.json files recursively ---
CONFIGS=($(find . -type f -name "tsconfig*.json" | sort))

FAIL=false

for config in "${CONFIGS[@]}"; do
  echo ""
  echo "📄 Checking: $config"

  # --- Backup current tsconfig ---
  cp "$config" "$config.backup.$(date +%s)"

  # --- Ensure tsconfig extends tsconfig.base.json ---
  EXTENDS=$(jq -r '.extends // empty' "$config")
  if [[ -z "$EXTENDS" ]]; then
    echo "  ⚠ Missing 'extends'. Adding './tsconfig.base.json'"
    jq '. + {extends: "./tsconfig.base.json"}' "$config" > "$config.tmp" && mv "$config.tmp" "$config"
  elif [[ "$EXTENDS" != *"tsconfig.base.json"* ]]; then
    echo "  ⚠ tsconfig extends '$EXTENDS'. Overwriting to './tsconfig.base.json'"
    jq '. + {extends: "./tsconfig.base.json"}' "$config" > "$config.tmp" && mv "$config.tmp" "$config"
  else
    echo "  ✅ Extends tsconfig.base.json"
  fi

  # --- Ensure exclude section exists ---
  if ! jq -e '.exclude' "$config" >/dev/null; then
    echo "  ⚠ Missing 'exclude'. Adding empty array."
    jq ". + {exclude: []}" "$config" > "$config.tmp" && mv "$config.tmp" "$config"
  fi

  # --- Ensure all required excludes are present ---
  for exclude in "${REQUIRED_EXCLUDES[@]}"; do
    if ! jq -e --arg ex "$exclude" '.exclude[] | select(. == $ex)' "$config" >/dev/null; then
      echo "  ⚠ Adding missing exclude: $exclude"
      jq ".exclude += [\"$exclude\"]" "$config" > "$config.tmp" && mv "$config.tmp" "$config"
    else
      echo "  ✅ $exclude"
    fi
  done
done

# --- 3️⃣ Scan for unexcluded backup/temp directories ---
echo ""
echo "🔍 Scanning for unexcluded backup/temp/save directories..."

FOUND_UNEXCLUDED=()

# Recursively search for backup/temp/save dirs, including app/scripts & src/core/scripts
while IFS= read -r dir; do
  name=$(basename "$dir")
  MATCHED=false
  for pattern in "${REQUIRED_EXCLUDES[@]}"; do
    if [[ "$name" == $pattern ]]; then
      MATCHED=true
      break
    fi
  done
  if [[ "$MATCHED" == false ]]; then
    FOUND_UNEXCLUDED+=("$dir")
  fi
done < <(find . -type d -name ".*" | grep -Ei "backup|temp|save")

if (( ${#FOUND_UNEXCLUDED[@]} > 0 )); then
  echo ""
  for dir in "${FOUND_UNEXCLUDED[@]}"; do
    echo "❌ Unexcluded backup directory: $dir"
  done
  FAIL=true
fi

# --- 4️⃣ Final report ---
echo ""
if [[ "$FAIL" == true ]]; then
  echo "🚫 tsconfig validation failed. Fix the issues above."
  exit 1
else
  echo "✅ All tsconfig files are validated, extend tsconfig.base.json, and excludes enforced."
fi
