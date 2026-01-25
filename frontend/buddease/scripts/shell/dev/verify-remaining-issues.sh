#!/bin/bash
echo "🔍 Verifying remaining issues after rollback"

echo "1. Checking for remaining //import patterns (definitely wrong):"
find src -name "*.ts" -o -name "*.tsx" -exec grep -l "^//import" {} \; | while read file; do
  echo "   ❌ $file still has //import"
  grep -n "^//import" "$file" | head -2
done

echo -e "\n2. Checking for // with TypeScript keywords (likely wrong):"
KEYWORDS=("export " "const " "let " "var " "function " "class " "interface " "type ")
for keyword in "${KEYWORDS[@]}"; do
  pattern="^//[[:space:]]*${keyword}"
  find src -name "*.ts" -o -name "*.tsx" -exec grep -l "$pattern" {} \; | head -2 | while read file; do
    echo "   ⚠️  $file has // $keyword"
  done
done | sort -u

echo -e "\n3. Checking legitimate comments that should be preserved:"
echo "   File headers found:"
find src -name "*.ts" -o -name "*.tsx" -exec grep -l "^// [A-Z][a-z].*\.ts" {} \; | head -3 | while read file; do
  echo "   📄 $file:"
  grep "^// [A-Z]" "$file" | head -2
done

echo -e "\n4. Running TypeScript check for syntax errors:"
echo "   (First 5 errors only)"
npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "\.(ts|tsx)\([0-9]+," | head -5 | while read error; do
  echo "   ❌ $error"
done

echo -e "\n✅ Verification complete"
echo "💡 If you see //import or //export patterns, run the rollback again"
echo "💡 Legitimate comments starting with capital letters should be preserved"
