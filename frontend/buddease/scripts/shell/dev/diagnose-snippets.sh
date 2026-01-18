#!/bin/bash
# diagnose-snippets.sh

echo "🔍 DIAGNOSING VS CODE SNIPPETS"
echo "================================"

# 1. Check file exists
if [ ! -f ".vscode/snippets/typescriptreact.code-snippets" ]; then
  echo "❌ Snippet file missing!"
  exit 1
fi

# 2. Check JSON validity
if python3 -m json.tool .vscode/snippets/typescriptreact.code-snippets > /dev/null 2>&1; then
  echo "✅ JSON is valid"
else
  echo "❌ JSON has errors"
  python3 -m json.tool .vscode/snippets/typescriptreact.code-snippets 2>&1 | head -5
  exit 1
fi

# 3. Show all prefixes
echo ""
echo "📋 AVAILABLE PREFIXES:"
grep '"prefix"' .vscode/snippets/typescriptreact.code-snippets | sed 's/.*"prefix": "\([^"]*\)".*/- \1/'

# 4. Create test file
cat > DiagnoseSnippet.tsx << 'EOF'
// Diagnosis test file
// Type a prefix from above on next line
EOF

echo ""
echo "📄 Created: DiagnoseSnippet.tsx"
echo ""
echo "🔧 TEST INSTRUCTIONS:"
echo "1. Open DiagnoseSnippet.tsx in VS Code"
echo "2. On line 3, type ONE prefix from above"
echo "3. Press Tab"
echo "4. If nothing, press Ctrl+Space to see suggestions"
echo ""
echo "🔄 If still not working:"
echo "   - Restart VS Code"
echo "   - Check file is .tsx not .ts"
echo "   - Try in empty .tsx file"

# Cleanup
echo ""
echo "Cleanup: rm DiagnoseSnippet.tsx"