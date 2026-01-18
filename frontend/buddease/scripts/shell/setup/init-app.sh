# init-app.sh
#!/bin/bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <app-name>"
  exit 1
fi

APP_NAME="$1"
APP_PATH="app/$APP_NAME"

if [[ -d "$APP_PATH" ]]; then
  echo "❌ App '$APP_NAME' already exists!"
  exit 1
fi

echo "📦 Initializing new app: $APP_NAME"

# Create directory structure
mkdir -p "$APP_PATH/scripts"
mkdir -p "$APP_PATH/generators"
mkdir -p "$APP_PATH/components"

# Create tsconfig extending base
cat > "$APP_PATH/tsconfig.json" <<EOF
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "outDir": "dist"
  },
  "include": [
    "src/**/*",
    "scripts/**/*",
    "generators/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
EOF

# Log creation
mkdir -p "reports/app-logs"
echo "$(date +%F_%T) - App '$APP_NAME' initialized" >> reports/app-logs/init.log

echo "✅ App '$APP_NAME' created successfully"
