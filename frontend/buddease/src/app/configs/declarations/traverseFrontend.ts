import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';
import * as fs from 'fs';
import * as path from 'path';
import getAppPath from '../../../../appPath';
import { AppStructureItem } from '../appStructure/AppStructure';
import { backend, backendStructure } from '../appStructure/BackendStructure';
import { frontend } from '../appStructure/FrontendStructure';


// Usage example (if using API client)

// Define traverseFrontendDirectory with file system operations
const traverseFrontendDirectory = async (
  dir: string
): Promise<AppStructureItem[]> => {
  const files = await fs.promises.readdir(dir);
  const result: AppStructureItem[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      // Handle directory traversal if needed
    } else if (file.endsWith(".tsx")) {
      const fileContent = await fs.promises.readFile(filePath, "utf-8");
      const appStructureItem: AppStructureItem = {
        path: filePath,
        content: fileContent,
        id: file,
        name: file,
        type: "file",
        items: {},
        draft: false,
        permissions: {
          read: true,
          write: true,
          delete: true,
          share: true,
          execute: true,
        },
        versions: {
          backend: backend.getStructureHash(),
          frontend: frontend.getStructureHash()
        }, 
        versionData: []
      };
      // Handle how you want to store or process the appStructureItem
      result.push(appStructureItem);
    }
  }

  return result;
};





// Usage example
const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const projectStructure = await traverseFrontendDirectory(projectPath);

console.log(projectStructure);

export { traverseFrontendDirectory };
