import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import * as fs from "fs";
import * as path from "path";
import getAppPath from "../../../../appPath";
import * as apiFile from '@/api/ApiFiles'
import { FileType } from "@/app/components/documents/Attachment/attachment";
// Define the interface for AppStructureItem
interface AppStructureItem {
  id: string;
  name: string;
  type: string | Promise<FileType>;
  path: string;
  content: string;
  items: {
    [key: string]: AppStructureItem
  }
  getStructure?(): Record<string, AppStructureItem>;
  
}

const { versionNumber, appVersion } = getCurrentAppInfo();

// Modify AppStructure to accept type "backend" or "frontend"
export default class AppStructure {
  private structure: Record<string, AppStructureItem> = {};

  constructor(type: "backend" | "frontend") {
    const projectPath =
      type === "backend"
        ? getAppPath(versionNumber, appVersion)
        : path.join(getAppPath(versionNumber, appVersion), "datanalysis/frontend");
    this.traverseDirectory(projectPath, type);
  }
  
  private async traverseDirectory(dir: string, type: "backend" | "frontend") {
    const files = fs.readdirSync(dir);
  
    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();
  
      if (isDirectory) {
        await this.traverseDirectory(filePath, type); // Wait for the recursive call to complete
      } else {
        if (
          (type === "backend" && file.endsWith(".py")) ||
          (type === "frontend" && file.endsWith(".tsx"))
        ) {
          const fileType = await apiFile.fileApiService.getFileType(filePath); // Wait for getFileType to resolve
          this.structure[file] = {
            id: path.basename(filePath),
            name: file,
            items: {},
            path: filePath,
            content: fs.readFileSync(filePath, "utf-8"),
            type: fileType // Assign the resolved fileType
          };
        }
      }
    }
  }
  

  getStructure(): Record<string, AppStructureItem> {
    return { ...this.structure };
  }

  private async handleFileChange(event: string, filePath: string) {
    try {
      console.log(`File changed: ${event} ${filePath}`);

      const updatedContent = await fs.promises.readFile(filePath, "utf-8");

      this.structure[path.basename(filePath)] = {
        id: path.basename(filePath),
        name: path.basename(filePath),
        items: {},
        path: filePath,
        content: updatedContent,
        type: fs.statSync(filePath).isDirectory() ? "directory" : "file"
      };

    } catch (error) {
      console.error(`Error handling file change: ${error}`);
    }
  }
}

// Remove the export of AppStructureItem since it's already exported as a type
export type { AppStructureItem };
