#!/bin/bash
# scripts/header-test.sh

echo "🔧 FILE HEADER SYSTEM - QUICK TEST"
echo "=================================="

echo ""
echo "1. TESTING fix:headers:dry-run..."
echo "----------------------------------"
pnpm fix:headers:dry-run 2>&1 | grep -E "(Running|Processing|files)" | head -5

echo ""
echo "2. TESTING fix:filename-cases:dry-run..."
echo "----------------------------------------"
pnpm fix:filename-cases:dry-run 2>&1 | grep -E "(Fixing|Targeting)" | head -5

echo ""
echo "3. TESTING on single file..."
echo "----------------------------"
# Create test file
cat > TestQuickFix.tsx << 'EOF'
// WrongFileName.tsx
import React from 'react';

TestQuickFix.tsx
const TestQuickFix = () => {
  return <div>Test</div>;
};
EOF

echo "Created TestQuickFix.tsx with wrong header"
echo "Running fixer..."

# Run fixer
pnpm fix:headers:file TestQuickFix.tsx 2>&1 | tail -3

echo "Checking result..."
FIRST_LINE=$(head -1 TestQuickFix.tsx)
SECOND_LINE=$(head -2 TestQuickFix.tsx | tail -1)

if [[ "$FIRST_LINE" == "// TestQuickFix.tsx" ]]; then
  echo "✅ Header fixed correctly"
else
  echo "❌ Header wrong: '$FIRST_LINE'"
fi

if [[ "$SECOND_LINE" == "TestQuickFix.tsx" ]]; then
  echo "❌ Still has bare filename line"
else
  echo "✅ Bare filename removed"
fi

# Cleanup
rm TestQuickFix.tsx
echo "Test file cleaned up"

echo ""
echo "4. CHECKING VS CODE SETUP..."
echo "---------------------------"
if [ -f ".vscode/settings.json" ]; then
  echo "✅ .vscode/settings.json exists"
else
  echo "❌ .vscode/settings.json missing"
fi

if [ -f ".vscode/snippets/typescriptreact.code-snippets" ]; then
  echo "✅ Snippets file exists"
  # Check for brc instead of brc
  if grep -q '"brc"' .vscode/snippets/typescriptreact.code-snippets; then
    echo "✅ 'brc' snippet configured"
  else
    echo "❌ 'brc' snippet NOT found (checking for 'brc' instead)"
    if grep -q '"brc"' .vscode/snippets/typescriptreact.code-snippets; then
      echo "✅ 'brc' snippet found (old prefix)"
    fi
  fi
else
  echo "❌ Snippets file missing"
fi

echo ""
echo "5. TESTING SNIPPET VALIDITY..."
echo "------------------------------"
if python3 -m json.tool .vscode/snippets/typescriptreact.code-snippets > /dev/null 2>&1; then
  echo "✅ Snippet JSON is valid"
  COUNT=$(grep -c '"prefix"' .vscode/snippets/typescriptreact.code-snippets)
  echo "   Found $COUNT snippets"
else
  echo "❌ Snippet JSON is INVALID - needs fixing"
fi

echo ""
echo "🎯 TEST COMPLETE!"
echo "To fix all files: pnpm fix:headers"
echo "To preview changes: pnpm fix:headers:dry-run"
echo "Type 'brc' + Tab in .tsx files to auto-create headers"
echo "(Or 'rc' for simple component, 'rcd' for default export)"