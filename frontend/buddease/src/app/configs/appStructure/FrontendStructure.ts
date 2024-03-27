// FrontendStructure.ts
import * as fs from 'fs';
import * as path from 'path';
import { AppStructureItem } from './AppStructure';


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



export const frontendStructure: FrontendStructure = new FrontendStructure(projectPath);