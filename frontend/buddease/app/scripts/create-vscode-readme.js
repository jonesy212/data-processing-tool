// create-vscode-readme.js

const fs = require('fs');
const path = require('path');

const readmeContent = `# VSCode Configuration for Buddease

This folder contains VSCode configuration files for consistent development experience.

## 📁 Files Overview

### \`.vscode/settings.json\`
- Editor settings specific to this project
- Format on save, file associations, etc.
- **Key feature**: Auto-formatting and ESLint fixes on save

### \`.vscode/extensions.json\`
- Recommended extensions for all team members
- VS Code will prompt to install these when opening the project

### \`.vscode/tasks.json\`
- Common development tasks
- Access via \`Cmd+Shift+P\` → "Tasks: Run Task"
- Includes our file header fixer

### \`.vscode/launch.json\`
- Debug configurations
- For debugging Next.js, tests, etc.

### \`.vscode/snippets/\`
- Code snippets for faster development
- Type the prefix and press Tab to expand

## 🚀 Getting Started

1. **Open workspace**: Open \`buddease.code-workspace\` in VS Code
2. **Install extensions**: Click "Install" when prompted
3. **Try snippets**: Open a \`.tsx\` file and type \`rfc\` + Tab

## 🧩 Code Snippets

| Prefix | Description | Creates |
|--------|-------------|---------|
| \`rfc\` | React functional component | Component with props interface |
| \`rc\` | Simple React component | Basic component |
| \`rhook\` | React hook | Custom hook template |
| \`tsfile\` | TypeScript file | File with filename header |

Example: Type \`rfc\` + Tab in a \`Button.tsx\` file:
\`\`\`typescript
import React from 'react';

interface ButtonProps {
  // Add props here
}

export const Button = ({}: ButtonProps) => {
  return (
    <div>
      Button
    </div>
  );
};
\`\`\`

## ⚙️ Tasks

Run tasks via \`Cmd+Shift+P\` → "Tasks: Run Task":

- **Fix File Headers**: Runs \`pnpm fix:headers\` to fix all filename comments
- **Fix File Headers (Dry Run)**: Preview changes without applying

## 🔧 File Header System

This project uses automated filename headers at the top of each file:

**Before:**
\`\`\`typescript
import React from 'react';
\`\`\`

**After running fixer:**
\`\`\`typescript
import React from 'react';
\`\`\`

To fix headers:
\`\`\`bash
# Fix all files
pnpm fix:headers

# Preview changes
pnpm fix:headers:dry-run

# Fix specific file
pnpm fix:headers:file Button.tsx
\`\`\`

## 🌀 Team Consistency

These settings ensure:
- Consistent code formatting across all developers
- Same extensions installed
- Same development environment
- Automatic file header maintenance

## 📝 Notes

- All settings are committed to git
- Team members should not modify these files locally
- Report issues with snippets/tasks to the team lead
`;

const vscodeDir = '.vscode';
const readmePath = path.join(vscodeDir, 'README.md');

// Create .vscode directory if it doesn't exist
if (!fs.existsSync(vscodeDir)) {
  fs.mkdirSync(vscodeDir, { recursive: true });
}

// Write README file
fs.writeFileSync(readmePath, readmeContent, 'utf8');
console.log(`✅ Created: ${readmePath}`);