
// Rollback script for import fixes
const fs = require('fs');
const path = require('path');

const changes = [
  {
    "file": "/Users/dixiejones/data_analysis/frontend/buddease/src/core/snapshots/RetrieveSnapshotData.tsx",
    "line": 1,
    "original": "import type { StructuredMetadata } from '@/core/config/StructuredMetadata' // // //RetrieveSnapshotData.tsx // import { StructuredMetadata } from \"@/core/config/StructuredMetadata\";",
    "fixed": "import type { StructuredMetadata } from '@/core/config/StructuredMetadata'"
  },
  {
    "file": "/Users/dixiejones/data_analysis/frontend/buddease/src/core/snapshots/addToSnapshotList.tsx",
    "line": 1,
    "original": "import type { Attachment } from '@/core/documents/attachment/Attachment' //import { Attachment } from '@/core/documents/attachment/Attachment';",
    "fixed": "import type { Attachment } from '@/core/documents/attachment/Attachment'"
  },
  {
    "file": "/Users/dixiejones/data_analysis/frontend/buddease/src/core/snapshots/SnapshohtDevConfigs.ts",
    "line": 1,
    "original": "import type { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder' // //SnapshohtDevConfigs.ts // import { CategoryProperties } from \"@/core/pages/personas/ScenarioBuilder\";",
    "fixed": "import type { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder'"
  },
  {
    "file": "/Users/dixiejones/data_analysis/frontend/buddease/src/core/snapshots/convertSnapshotsArray.ts",
    "line": 1,
    "original": "import type { SnapshotData } from '@/core/snapshots/SnapshotData' // import { SnapshotData } from '@/core/snapshots/SnapshotData';",
    "fixed": "import type { SnapshotData } from '@/core/snapshots/SnapshotData'"
  },
  {
    "file": "/Users/dixiejones/data_analysis/frontend/buddease/src/core/snapshots/createSnapshotExample.ts",
    "line": 1,
    "original": "import type { SnapshotData, SnapshotStoreConfig } from '@/core/snapshots/SnapshotData' // import { SnapshotData, SnapshotStoreConfig } from '@/core/snapshots/SnapshotData';",
    "fixed": "import type { SnapshotData, SnapshotStoreConfig } from '@/core/snapshots/SnapshotData'"
  }
];

console.log('🔙 Rolling back import fixes...');

for (const change of changes) {
  try {
    const content = fs.readFileSync(change.file, 'utf8');
    const lines = content.split('\n');
    const lineIndex = change.line - 1;
    
    if (lineIndex >= 0 && lineIndex < lines.length && lines[lineIndex].includes(change.fixed)) {
      // Find the import block
      let importStart = lineIndex;
      while (importStart > 0 && !lines[importStart].trim().startsWith('import')) {
        importStart--;
      }
      
      lines[importStart] = change.original;
      fs.writeFileSync(change.file, lines.join('\n'), 'utf8');
      console.log(`✅ Rolled back: ${path.basename(change.file)}:${change.line}`);
    }
  } catch (error) {
    console.log(`❌ Failed to rollback ${change.file}:`, error.message);
  }
}

console.log('🎉 Rollback complete!');
