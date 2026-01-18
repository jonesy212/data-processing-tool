// fsOperations.ts
// Separate module for file system operations

import fs from 'fs';

export function getFileContent(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}
