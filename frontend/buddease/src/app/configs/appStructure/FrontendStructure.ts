import axiosInstance from "@/app/api/axiosInstance";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import getAppPath from "appPath";
import * as path from "path";
import { AppStructureItem } from "../appStructure/AppStructure";

export default class FrontendStructure implements AppStructureItem {

  id: string;
  name: string;
  type: string; // Adjust based on your FileType definition
  path: string;
  content: string;
  draft: boolean;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    share: boolean;
    execute: boolean;
  };
  items?: Record<string, AppStructureItem>;

  private structure?: Record<string, AppStructureItem> | undefined = {};
  
  constructor(projectPath: string) {
    this.id = "";
    this.name = "";
    this.type = "";
    this.path = "";
    this.content = "";
    this.draft = false;
    this.permissions = {
      read: true,
      write: true,
      delete: true,
      share: true,
      execute: true,
    };
    this.items = {};

    // Check if 'fs' is available (only in server-side)
    if (typeof window === "undefined") {
      import("fs").then((fsModule) => {
        const fs = fsModule.default;
        if (this.traverseDirectory) {
          this.traverseDirectory(projectPath, fs);
        }
      });
    } else {
      console.error("'fs' module can only be used in a Node.js environment.");
    }
  }

  private async traverseDirectory?(
    dir: string,
    fs: typeof import("fs") | undefined
  ): Promise<AppStructureItem[]> {
    if (!fs) {
      // Use axiosInstance to make HTTP requests to the backend API
      try {
        const response = await axiosInstance.get(
          `/api/traverse-directory?dir=${encodeURIComponent(dir)}`
        );
        return response.data as AppStructureItem[];
      } catch (error) {
        console.error("Error traversing directory using backend API:", error);
        throw error;
      }
    }

    const files = await fs!.promises.readdir(dir);
    const items: AppStructureItem[] = [];
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs!.promises.stat(filePath);

      if (stat.isDirectory()) {
        const subItems = await this.traverseDirectory!(filePath, fs);
        items.push(...subItems);
      } else if (stat.isFile() && file.endsWith(".tsx")) {
        const fileContent = await fs!.promises.readFile(filePath, "utf-8");
        const fileItem: AppStructureItem = {
          id: file,
          name: file,
          path: filePath,
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
          content: fileContent,
        };
        items.push(fileItem);
      }
    }

    return items;
  }

  getStructure(): Record<string, AppStructureItem> {
    return { ...this.structure };
  }

  public async getStructureAsArray(): Promise<AppStructureItem[]> {
    return Object.values(this.structure || {});
  }


  public async traverseDirectoryPublic?(
    dir: string,
    fs: typeof import("fs")
  ): Promise<AppStructureItem[]> {
    return this.traverseDirectory!(dir, fs);
  }
}

// Instantiate FrontendStructure

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);

const frontendStructure: FrontendStructure = new FrontendStructure(projectPath);

// const frontend = new FrontendStructure()
// Export frontendStructure
export { frontendStructure };

const dir = path.join(
  getAppPath(getCurrentAppInfo().versionNumber, getCurrentAppInfo().appVersion),
  "frontend"
)

// Define frontend object inside an async function
async function initializeFrontend() {
  return {
    ...frontendStructure,
    items: await frontendStructure.getStructure(),
    getStructureAsArray: frontendStructure.getStructureAsArray.bind(frontendStructure),
    traverseDirectoryPublic: frontendStructure.traverseDirectoryPublic?.bind(frontendStructure),
    getStructure: () => frontendStructure.getStructure(), // Accessing structure via frontendStructure instance
  };
}

export const frontend = await initializeFrontend();
