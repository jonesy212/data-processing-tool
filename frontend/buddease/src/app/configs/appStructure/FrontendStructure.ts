// FrontendStructure.ts

let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}
import * as path from 'path';
import { AppStructureItem } from './AppStructure';
import getAppPath from '../../../../appPath';
import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';


export default class FrontendStructure {
  [key: string]: any; 
  private structure: Record<string, AppStructureItem> = {};

  constructor(projectPath: string) {
    this.traverseDirectory(projectPath);
  }

  private traverseDirectory(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      if (isDirectory) {
        this.traverseDirectory(filePath);
      } else {
        if (file.endsWith('.tsx')) {
          this.structure[file] = {
            path: filePath,
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



const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);

export const frontendStructure: FrontendStructure = new FrontendStructure(projectPath); 