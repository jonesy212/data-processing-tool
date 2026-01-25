# Package.json Update Guide
## 1. unified-type-import-fixer.ts
```json
// BEFORE (using symlink):
"fix:types": "tsx app/scripts/unified-type-import-fixer.ts",

// AFTER (direct path):
"fix:types": "tsx scripts/typescript/type-imports/unified-fixer.ts",