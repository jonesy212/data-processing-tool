#!/bin/bash
# Auto-generated repair script
echo "Repairing: unified-type-import-fixer.ts"
rm "app/scripts/unified-type-import-fixer.ts"
ln -s "../../scripts/typescript/type-imports/unified-fixer.ts" "app/scripts/unified-type-import-fixer.ts"