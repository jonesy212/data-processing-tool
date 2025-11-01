import { getCurrentAppInfo } from "@/app/versions/VersionGenerator";
import getAppPath from "@/app/config/appStructure/appPath";

export async function getProjectStructure(): Promise<FileSystemItem[]> {
  const { versionNumber, appVersion } = getCurrentAppInfo();
  const projectPath = getAppPath(versionNumber, appVersion);
  const projectStructure = await traverseFrontendDirectory(projectPath);
  return projectStructure;
}



