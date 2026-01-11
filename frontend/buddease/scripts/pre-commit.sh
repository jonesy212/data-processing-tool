#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔒 Buddease Dynamic Pre-commit Checks Starting..."

# ------------------------
# 1️⃣ Dynamically detect all tsconfig files and typecheck
# ------------------------
TSCONFIG_FILES=$(find . -name "tsconfig*.json")
echo "🧾 Detected tsconfig files: $TSCONFIG_FILES"

for tsconfig in $TSCONFIG_FILES; do
  echo "🧠 Typechecking $tsconfig..."
  pnpm exec tsc --noEmit --project "$tsconfig" || {
    echo "❌ Typecheck failed for $tsconfig. Commit blocked."
    exit 1
  }
done

# ------------------------
# 2️⃣ Detect allowed backup files dynamically
# ------------------------
ALLOWED_PATTERNS=$(git ls-files '*.bak' '*.backup-*' '*.dedup-backup.*' 2>/dev/null)
echo "📂 Allowed backup files: $ALLOWED_PATTERNS"

# ------------------------
# 3️⃣ Check staged files for forbidden backup/temp files
# ------------------------
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
FORBIDDEN=false

for file in $STAGED_FILES; do
  SKIP=false
  for allowed in $ALLOWED_PATTERNS; do
    if [[ "$file" == *"$allowed"* ]]; then
      SKIP=true
      break
    fi
  done

  if [[ "$SKIP" == true ]]; then
    continue
  fi

  if [[ "$file" == *.bak ]] || [[ "$file" == *.backup-* ]] || [[ "$file" == *.dedup-backup.* ]] || [[ "$file" == backups/* ]]; then
    echo "❌ Forbidden file staged: $file"
    FORBIDDEN=true
  fi
done

if [[ "$FORBIDDEN" == true ]]; then
  echo "🚫 Remove forbidden backup/temp files before committing."
  exit 1
fi

# ------------------------
# 4️⃣ Run lint-staged for code style & formatting
# ------------------------
echo "🧹 Running lint-staged..."
pnpm exec lint-staged || {
  echo "❌ Linting failed. Commit blocked."
  exit 1
}

# ------------------------
# 5️⃣ Dynamically run all scripts in app/scripts/
# ------------------------
SCRIPT_FILES=$(find ./app/scripts -type f \( -name "*.ts" -o -name "*.sh" -o -name "*.mjs" \))
echo "📜 Running dynamic scripts: $SCRIPT_FILES"

for script in $SCRIPT_FILES; do
  echo "⚡ Executing $script..."
  if [[ "$script" == *.ts ]]; then
    pnpm exec ts-node "$script" || {
      echo "❌ Script failed: $script. Commit blocked."
      exit 1
    }
  elif [[ "$script" == *.sh ]]; then
    bash "$script" || {
      echo "❌ Script failed: $script. Commit blocked."
      exit 1
    }
  elif [[ "$script" == *.mjs ]]; then
    node "$script" || {
      echo "❌ Script failed: $script. Commit blocked."
      exit 1
    }
  fi
done

# ------------------------
# ✅ All checks passed
# ------------------------
echo "✅ All pre-commit checks passed!"
exit 0
