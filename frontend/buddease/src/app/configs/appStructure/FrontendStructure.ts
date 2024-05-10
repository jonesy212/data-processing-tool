import * as path from 'path';
import { AppStructureItem } from './AppStructure';
import getAppPath from '../../../../appPath';
import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';

export default class FrontendStructure {
  [key: string]: any; 
  private structure: Record<string, AppStructureItem> = {};

  constructor(projectPath: string) {
    // Check if 'fs' is available (only in server-side)
    if (typeof window === 'undefined') {
      import('fs').then((fsModule) => {
        const fs = fsModule.default;
        this.traverseDirectory(projectPath, fs);
      });
    } else {
      console.error("'fs' module can only be used in a Node.js environment.");
    }
  }

  private traverseDirectory(dir: string, fs: any) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      if (isDirectory) {
        this.traverseDirectory(filePath, fs);
      } else {
        if (file.endsWith('.tsx')) {
          this.structure[file] = {
            id: file,
            name: file,
            path: filePath,
            type: 'file',
            items: {},
            content: fs.readFileSync(filePath, 'utf-8'),
          };
        }
      }
    }
  }

  getStructure(): Record<string, AppStructureItem> {
    return { ...this.structure };
  }
}

// Get current app information and project path
const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);

// Create frontend structure instance
let frontendStructure: FrontendStructure = new FrontendStructure(projectPath);

// Check if 'fs' is available (only in server-side)
if (typeof window === 'undefined') {
  import('fs').then((fsModule) => {
    const fs = fsModule.default;
    frontendStructure = new FrontendStructure(projectPath);
  });
} else {
  console.error("'fs' module can only be used in a Node.js environment.");
}

export { frontendStructure };
