fsOperations.ts// Separate module for file system operations
// fsOperations.js
import fs from 'fs';

export function getFileContent(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}
