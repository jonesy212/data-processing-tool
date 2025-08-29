import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import getAppPath from "@/app/configs/appStructure/appPath";
import { AppStructureItem, AppStructurePermissions } from "@/app/configs/appStructure/AppStructure";
import { backend } from "@/app/configs/appStructure/BackendStructure";
import { frontend } from "@/app/configs/appStructure/FrontendStructure";
import * as fs from "fs";
import * as path from "path";

/**
 * Recursively traverse a frontend directory and collect TSX file info.
 */
export async function traverseFrontendDirectory(dir: string): Promise<AppStructureItem[]> {
  const files = await fs.promises.readdir(dir);
  const result: AppStructureItem[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      // Optional: recursively traverse subdirectories
      const nested = await traverseFrontendDirectory(filePath);
      result.push(...nested);
    } else if (file.endsWith(".tsx")) {
      const fileContent = await fs.promises.readFile(filePath, "utf-8");

      const backendHash = await backend.getStructureHash();
      const frontendHash = await frontend.getStructureHash();

      const appStructureItem: AppStructureItem = {
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

      result.push(appStructureItem);
    }
  }

  return result;
}

/**
 * Helper to get the full project structure based on the current app version.
 */
export async function getProjectStructure(): Promise<AppStructureItem[]> {
  const { versionNumber, appVersion } = getCurrentAppInfo();
  const projectPath = getAppPath(versionNumber, appVersion);
  const projectStructure = await traverseFrontendDirectory(projectPath);
  return projectStructure;
}



// export { traverseFrontendDirectory };



// // Usage example
// const { versionNumber, appVersion } = getCurrentAppInfo();
// const projectPath = getAppPath(versionNumber, appVersion);
// const projectStructure = await traverseFrontendDirectory(projectPath);

// console.log(projectStructure);

