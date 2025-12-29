#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SNAPSHOT_DIR="src/app/snapshots"
SOURCE_DIR="src"

FOUND_AGGREGATE=false
STRICT=false

# Enable strict mode automatically in CI
if [[ "${CI:-}" == "true" ]]; then
  STRICT=true
fi

echo "🔍 Checking for aggregated snapshot imports…"
echo "Root: $ROOT_DIR"
echo "Strict mode: $STRICT"
echo

# 1. Ensure snapshot directory exists
if [ ! -d "$ROOT_DIR/$SNAPSHOT_DIR" ]; then
  echo "⚠️  Snapshot directory not found. Skipping check."
  exit 0
fi

# 2. Scan all source files
find "$ROOT_DIR/$SOURCE_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) | \
while IFS= read -r SOURCE_FILE; do

  grep -E "import .* from ['\"].*['\"]" "$SOURCE_FILE" || true | \
  while IFS= read -r IMPORT_LINE; do

    IMPORT_PATH=$(echo "$IMPORT_LINE" | sed -n "s/.*from ['\"]\(.*\)['\"].*/\1/p")

    # Allow direct snapshot imports
    if [[ "$IMPORT_PATH" == *"/snapshots/"* ]]; then
      continue
    fi

    # Detect aggregated imports
    if [[ "$IMPORT_PATH" =~ snapshots$ ]] || \
       [[ "$IMPORT_PATH" =~ snapshots/index$ ]] || \
       [[ "$IMPORT_PATH" =~ snapshotStore ]] || \
       [[ "$IMPORT_PATH" =~ snapshotsConfig ]]; then

      echo "❌ Aggregated snapshot import detected"
      echo "   File   : ${SOURCE_FILE#$ROOT_DIR/}"
      echo "   Import : $IMPORT_LINE"
      echo

      FOUND_AGGREGATE=true

      # Fail fast in CI
      if [ "$STRICT" = true ]; then
        exit 1
      fi
    fi

  done
done

# 3. Final enforcement (local dev)
if [ "$FOUND_AGGREGATE" = true ]; then
  echo "❌ Aggregated snapshot imports detected."
  echo "   Use direct imports from src/app/snapshots/* instead."
  exit 1
else
  echo "✅ No aggregated snapshot imports found."
fi
