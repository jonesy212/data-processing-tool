#!/bin/bash
set -euo pipefail

echo "🛠️  Auto-fixing tsconfig.json exclude sections..."

TS_CONFIGS=(
  "tsconfig.json"
  "tsconfig.scripts.json"
  "tsconfig.snapshots.json"
)

REQUIRED_EXCLUDES=(
  ".ts-backups"
  ".comment-fix-backups"
  ".type-import-backups"
  ".import-fix-backups"
)

for CONFIG in "${TS_CONFIGS[@]}"; do
  if [ ! -f "$CONFIG" ]; then
    echo "⚠️  Skipping missing file: $CONFIG"
    continue
  fi

  echo ""
  echo "📄 Fixing: $CONFIG"

  BACKUP="${CONFIG}.backup.$(date +%s)"
  cp "$CONFIG" "$BACKUP"
  echo "   💾 Backup created: $BACKUP"

  python3 <<EOF
import json

config_path = "$CONFIG"
required = ${REQUIRED_EXCLUDES}

with open(config_path, "r") as f:
    data = json.load(f)

excludes = data.get("exclude", [])
changed = False

for item in required:
    if item not in excludes:
        excludes.append(item)
        changed = True

if changed or "exclude" not in data:
    data["exclude"] = excludes
    with open(config_path, "w") as f:
        json.dump(data, f, indent=2)
    print("   ✅ Exclude section updated")
else:
    print("   ℹ️  No changes needed")
EOF

done

echo ""
echo "🎯 tsconfig auto-fix complete"
