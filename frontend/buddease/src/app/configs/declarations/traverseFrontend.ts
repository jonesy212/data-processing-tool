let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}
import * as path from 'path';
import { AppStructureItem } from '../appStructure/AppStructure';

interface FrontendStructure {
  // ... your existing structure
}

const frontendStructure: FrontendStructure = {};

export const traverseDirectory = (dir: string): AppStructureItem[] => {
  const files = fs.readdirSync(dir);
  const result: AppStructureItem[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      traverseDirectory(filePath);
      result.push(...result);
    } else {
      // Logic to parse file and update frontendStructure accordingly
      // Example: if (file.endsWith('.tsx')) { /* update frontendStructure */ }
      const appStructureItem: AppStructureItem = {
        // Populate with relevant properties
        path: filePath,
        content: fs.readFileSync(filePath, 'utf-8')
        // ... other properties
      };
      result.push(appStructureItem);
    }
  }
  return result
};

// todo #review  update your fie path so we can create your backend structure
traverseDirectory('/path/to/your/project');

console.log(frontendStructure);
