// traverseBackend.ts
let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}
import * as path from 'path';
import { AppStructureItem } from '../appStructure/AppStructure';

interface BackendStructure {
  // Define the structure for the backend
}

const backendStructure: BackendStructure = {};

export const traverseBackendDirectory = (dir: string): AppStructureItem[] => {
  const files = fs.readdirSync(dir);
  const result: AppStructureItem[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      traverseBackendDirectory(filePath); // Recursively traverse directories
    } else {
      // Logic to parse file and update backendStructure accordingly
      // Example: if (file.endsWith('.js')) { /* update backendStructure */ }
      const appStructureItem: AppStructureItem = {
        // Populate with relevant properties
        path: filePath,
        content: fs.readFileSync(filePath, 'utf-8')
        // ... other properties
      };
      result.push(appStructureItem);
    }
  }
  return result;
};

// todo #review update your file path so we can create your backend structure
traverseBackendDirectory('/path/to/your/project/backend');

console.log(backendStructure);
