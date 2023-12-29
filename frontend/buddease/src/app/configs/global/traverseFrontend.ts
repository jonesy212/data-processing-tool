import * as fs from 'fs';
import * as path from 'path';

interface FrontendStructure {
  // ... your existing structure
}

const frontendStructure: FrontendStructure = {};

const traverseDirectory = (dir: string) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      traverseDirectory(filePath);
    } else {
      // Logic to parse file and update frontendStructure accordingly
      // Example: if (file.endsWith('.tsx')) { /* update frontendStructure */ }
    }
  }
};

// #review  update your fie path so we can create your backend structure
traverseDirectory('/path/to/your/project');

console.log(frontendStructure);
