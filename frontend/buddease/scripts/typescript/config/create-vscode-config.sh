#!/bin/bash
# create-vscode-config.sh

echo "📁 Creating VSCode configuration files..."

# Create .vscode directory
mkdir -p .vscode

# 1. Create settings.json (keep as is, it's good)
cat > .vscode/settings.json << 'EOF'
{
  "editor.snippetSuggestions": "top",
  "editor.quickSuggestions": {
    "strings": true
  },
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript",
    "*.jsx": "javascriptreact"
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.updateImportsOnFileMove.enabled": "always",
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true
  }
}
EOF

# 2. Create extensions.json (keep as is)
cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "usernamehw.errorlens",
    "wix.vscode-import-cost",
    "yoavbls.pretty-ts-errors",
    "mikestead.dotenv",
    "eamodio.gitlens"
  ]
}
EOF

# 3. Create tasks.json (keep as is)
cat > .vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Fix File Headers",
      "type": "shell",
      "command": "pnpm fix:headers",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Fix File Headers (Dry Run)",
      "type": "shell",
      "command": "pnpm fix:headers:dry-run",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "shared"
      }
    }
  ]
}
EOF

# 4. Create launch.json (keep as is)
cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
EOF

# 5. Create snippets directory and files (UPDATED!)
mkdir -p .vscode/snippets

# React/TypeScript snippets - UPDATED to match YOUR patterns
cat > .vscode/snippets/typescriptreact.code-snippets << 'EOF'
{
  "React Component (Your Pattern)": {
    "scope": "typescriptreact",
    "prefix": "comp-my",
    "body": [
      "// ${TM_FILENAME_BASE}",
      "import React from 'react';",
      "",
      "interface ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}Props {",
      "  $1",
      "}",
      "",
      "const ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}: React.FC<${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}Props> = ({",
      "  $2",
      "}) => {",
      "  $3",
      "};",
      ""
    ],
    "description": "Matches YOUR CustomTemplateBuilder pattern exactly"
  },
  
  "React Component with Default Export": {
    "scope": "typescriptreact",
    "prefix": "rcd",
    "body": [
      "// ${TM_FILENAME_BASE}",
      "import React from 'react';",
      "",
      "interface ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}Props {",
      "  $1",
      "}",
      "",
      "const ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}: React.FC<${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}Props> = ({",
      "  $2",
      "}) => {",
      "  return (",
      "    <div>",
      "      ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/};",
      ""
    ],
    "description": "Your pattern with default export"
  },
  
  "Original Pattern (if used)": {
    "scope": "typescriptreact",
    "prefix": "rco",
    "body": [
      "// ${TM_FILENAME_BASE}",
      "import React from 'react';",
      "",
      "interface ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}Props {",
      "  $1",
      "}",
      "",
      "export const ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/} = ({}: ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}Props) => {",
      "  return (",
      "    <div>",
      "      ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}",
      "    </div>",
      "  );",
      "};",
      ""
    ],
    "description": "Original pattern: export const Component"
  },
  
  "Simple Component": {
    "scope": "typescriptreact",
    "prefix": "rcs",
    "body": [
      "// ${TM_FILENAME_BASE}",
      "import React from 'react';",
      "",
      "const ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}: React.FC = () => {",
      "  return (",
      "    <div>",
      "      ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/}",
      "    </div>",
      "  );",
      "};",
      ""
    ],
    "description": "Simple component without props"
  }
}
EOF

# TypeScript snippets - UPDATED with better patterns
cat > .vscode/snippets/typescript.code-snippets << 'EOF'
{
  "TypeScript File with Header": {
    "scope": "typescript",
    "prefix": "tsfile",
    "body": [
      "// ${TM_FILENAME_BASE}",
      ""
    ],
    "description": "Create TypeScript file with filename header"
  },
  
  "TypeScript Interface": {
    "scope": "typescript",
    "prefix": "tsinterface",
    "body": [
      "// ${TM_FILENAME_BASE}",
      "",
      "export interface ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/} {",
      "  $1",
      "}",
      ""
    ],
    "description": "Create TypeScript interface with filename header"
  },
  
  "TypeScript Type": {
    "scope": "typescript",
    "prefix": "tstype",
    "body": [
      "// ${TM_FILENAME_BASE}",
      "",
      "export type ${TM_FILENAME_BASE/(.*)/${1:/pascalcase}/} = {",
      "  $1",
      "};",
      ""
    ],
    "description": "Create TypeScript type with filename header"
  },
  
  "TypeScript Function": {
    "scope": "typescript",
    "prefix": "tsfunc",
    "body": [
      "// ${TM_FILENAME_BASE}",
      "",
      "export const ${TM_FILENAME_BASE/(.*)/${1:/camelcase}/} = ($1) => {",
      "  $2",
      "};",
      ""
    ],
    "description": "Create TypeScript function with filename header"
  },
  
  "TypeScript Async Function": {
    "scope": "typescript",
    "prefix": "tsasync",
    "body": [
      "// ${TM_FILENAME_BASE}",
      "",
      "export const ${TM_FILENAME_BASE/(.*)/${1:/camelcase}/} = async ($1): Promise<$2> => {",
      "  $3",
      "};",
      ""
    ],
    "description": "Create async TypeScript function"
  }
}
EOF

# 6. Create templates directory (OPTIONAL - remove or update)
mkdir -p .vscode/templates

# Component template - UPDATED to match your pattern
cat > .vscode/templates/Component.tsx.template << 'EOF'
// {COMPONENT_NAME}.tsx
import React from 'react';

interface {COMPONENT_NAME}Props {
  // Add props here
}

const {COMPONENT_NAME}: React.FC<{COMPONENT_NAME}Props> = ({
  // Destructure props here
}) => {
  return (
    <div>
      {COMPONENT_NAME}
    </div>
  );
};

export default {COMPONENT_NAME};
EOF

# Hook template - UPDATED
cat > .vscode/templates/Hook.ts.template << 'EOF'
// {filename}.ts
import { useState, useEffect } from 'react';

interface Use{hookName}Return {
  // Return type definition
}

export const use{hookName} = (): Use{hookName}Return => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect logic here
  }, []);

  return {
    state
  };
};
EOF

# Utility template - UPDATED
cat > .vscode/templates/Utility.ts.template << 'EOF'
// {filename}.ts

export const {functionName} = () => {
  // Utility function implementation
};
EOF

# 7. Create workspace file (optional)
cat > buddease.code-workspace << 'EOF'
{
  "folders": [
    {
      "path": ".",
      "name": "Buddease"
    }
  ],
  "settings": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
      "source.organizeImports": "explicit"
    },
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 1000,
    "files.associations": {
      "*.tsx": "typescriptreact"
    }
  },
  "extensions": {
    "recommendations": [
      "esbenp.prettier-vscode",
      "dbaeumer.vscode-eslint"
    ]
  }
}
EOF

# 8. Create a README for the .vscode folder - UPDATED with correct snippets
echo "# VSCode Configuration for Buddease" > .vscode/README.md
echo "" >> .vscode/README.md
echo "This folder contains VSCode configuration files for the Buddease project." >> .vscode/README.md
echo "" >> .vscode/README.md
echo "## Files Overview" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "### \`.vscode/settings.json\`" >> .vscode/README.md
echo "- Editor settings specific to this project" >> .vscode/README.md
echo "- File associations, format on save, etc." >> .vscode/README.md
echo "" >> .vscode/README.md
echo "### \`.vscode/extensions.json\`" >> .vscode/README.md
echo "- Recommended extensions for this project" >> .vscode/README.md
echo "- Team members will be prompted to install these" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "### \`.vscode/tasks.json\`" >> .vscode/README.md
echo "- Common tasks (fix headers, run tests, etc.)" >> .vscode/README.md
echo "- Access via \`Cmd+Shift+P\` → \"Tasks: Run Task\"" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "### \`.vscode/snippets/\`" >> .vscode/README.md
echo "- Code snippets for TypeScript/React" >> .vscode/README.md
echo "- Type \`brc\` + Tab for React component matching YOUR patterns" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "## Using Snippets" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "1. Open a \`.tsx\` file" >> .vscode/README.md
echo "2. Type \`brc\` and press Tab" >> .vscode/README.md
echo "3. Automatically creates a component matching your CustomTemplateBuilder pattern:" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "\`\`\`typescript" >> .vscode/README.md
echo "// MyComponent.tsx" >> .vscode/README.md
echo "import React from 'react';" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "interface MyComponentProps {" >> .vscode/README.md
echo "  // Add props here" >> .vscode/README.md
echo "}" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "const MyComponent: React.FC<MyComponentProps> = ({" >> .vscode/README.md
echo "  // Destructure props here" >> .vscode/README.md
echo "}) => {" >> .vscode/README.md
echo "  return (" >> .vscode/README.md
echo "    <div>" >> .vscode/README.md
echo "      MyComponent" >> .vscode/README.md
echo "    </div>" >> .vscode/README.md
echo "  );" >> .vscode/README.md
echo "};" >> .vscode/README.md
echo "\`\`\`" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "## Available Snippets" >> .vscode/README.md
echo "" >> .vscode/README.md
echo "| Prefix | Description |" >> .vscode/README.md
echo "|--------|-------------|" >> .vscode/README.md
echo "| \`brc\` | **Your pattern** - matches CustomTemplateBuilder |" >> .vscode/README.md
echo "| \`rcd\` | Your pattern with default export |" >> .vscode/README.md
echo "| \`rco\` | Original pattern (if needed) |" >> .vscode/README.md
echo "| \`rcs\` | Simple component without props |" >> .vscode/README.md
echo "| \`tsfile\` | TypeScript file with header |" >> .vscode/README.md

echo ""
echo "✅ VSCode configuration created successfully!"
echo ""
echo "📋 Summary:"
echo "  📄 .vscode/settings.json          - Editor settings"
echo "  📄 .vscode/extensions.json        - Recommended extensions"
echo "  📄 .vscode/tasks.json             - Build tasks"
echo "  📄 .vscode/launch.json            - Debug configurations"
echo "  📄 .vscode/snippets/              - Code snippets (UPDATED to match your patterns)"
echo "  📄 .vscode/templates/             - File templates"
echo "  📄 .vscode/README.md              - Documentation (UPDATED)"
echo "  📄 buddease.code-workspace        - Workspace file"
echo ""
echo "🚀 Next steps:"
echo "  1. Open buddease.code-workspace in VSCode"
echo "  2. Install recommended extensions when prompted"
echo "  3. Try snippets by typing 'brc' + Tab in a .tsx file"
echo "  4. This matches your CustomTemplateBuilder.tsx pattern exactly!"