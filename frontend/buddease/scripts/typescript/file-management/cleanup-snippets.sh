#!/bin/bash
# cleanup-snippets.sh

echo "🧹 Cleaning up snippet conflicts..."

# Remove template folder if it exists (optional)
if [ -d ".vscode/templates" ]; then
  echo "Removing template folder (conflicts with snippets)..."
  rm -rf ".vscode/templates"
fi

# Ensure snippets folder exists
mkdir -p ".vscode/snippets"

# Create unified snippets file
cat > ".vscode/snippets/typescriptreact.code-snippets" << 'EOF'
{
  "React Component": {
    "prefix": "rc",
    "body": [
      "// ${TM_FILENAME_BASE}",
      "import React from 'react';",
      "",
      "export const ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/} = () => {",
      "  return (",
      "    <div>",
      "      ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}",
      "    </div>",
      "  );",
      "};"
    ],
    "description": "Simple React component with auto-filename header"
  }
}
EOF

echo "✅ Snippets cleaned up! Use 'rc' + Tab in .tsx files."