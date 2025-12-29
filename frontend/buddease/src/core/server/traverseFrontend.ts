// traverseFrontend.ts
import getAppPath from "@/core/config/appStructure/appPath";
import { getCurrentAppInfo } from "@/core/versions/VersionGenerator";

export async function getProjectStructure(): Promise<FileSystemItem[]> {
  const { versionNumber, appVersion } = getCurrentAppInfo();
  const projectPath = getAppPath(versionNumber, appVersion);
  const projectStructure = await traverseFrontendDirectory(projectPath);
  return projectStructure;
}



