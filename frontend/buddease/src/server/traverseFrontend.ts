import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import getAppPath from "@/app/configs/appStructure/appPath";
import { AppStructurePermissions } from "@/app/configs/appStructure/AppStructure";
import { backend } from "@/app/configs/appStructure/BackendStructure";
import { frontend } from "@/app/configs/appStructure/FrontendStructure";
import { DataVersions } from '@/app/components/versions'

import * as fs from "fs";
import * as path from "path";

// Simplified interface for file traversal
interface FileSystemItem {
  id: string;
  name: string;
  type: string;
  path: string;
  content?: string;
  draft: boolean;
  permissions?: AppStructurePermissions;
  versions?: DataVersions;
  versionData?: any;
  items?: { [key: string]: FileSystemItem };
}

async function traverseFrontendDirectory(dir: string): Promise<FileSystemItem[]> {
  const files = await fs.promises.readdir(dir);
  const result: FileSystemItem[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      const nested = await traverseFrontendDirectory(filePath);
      result.push(...nested);
    } else if (file.endsWith(".tsx")) {
      const fileContent = await fs.promises.readFile(filePath, "utf-8");

      const backendHash = await backend.getStructureHash();
      const frontendHash = await frontend.getStructureHash();

      const fileSystemItem: FileSystemItem = {
        path: filePath,
        content: fileContent,
        id: file,
        name: file,
        type: "file",
        items: {},
        draft: false,
        permissions: {
          userId: "default",
          permissions: {},
          permissionType: "read",
          canView: true,
          canEdit: false,
          read: true,
          write: false,
          delete: false,
          share: false,
          execute: false,
        },
        versions: {
          backend: backendHash
            ? { [filePath]: { id: file, name: file, type: "file", path: filePath, content: fileContent, draft: false, permissions: {} as AppStructurePermissions, versions: undefined, versionData: null } }
            : undefined,
          frontend: frontendHash
            ? { [filePath]: { id: file, name: file, type: "file", path: filePath, content: fileContent, draft: false, permissions: {} as AppStructurePermissions, versions: undefined, versionData: null } }
            : undefined,
        },
        versionData: null,
      };

      result.push(fileSystemItem);
    }
  }

  return result;
}

export async function getProjectStructure(): Promise<FileSystemItem[]> {
  const { versionNumber, appVersion } = getCurrentAppInfo();
  const projectPath = getAppPath(versionNumber, appVersion);
  const projectStructure = await traverseFrontendDirectory(projectPath);
  return projectStructure;
}

export { traverseFrontendDirectory };



// // Usage example
// const { versionNumber, appVersion } = getCurrentAppInfo();
// const projectPath = getAppPath(versionNumber, appVersion);
// const projectStructure = await traverseFrontendDirectory(projectPath);

// console.log(projectStructure);

