import axiosInstance from "@/app/api/axiosInstance";
import * as path from "path";
import { AppStructureItem } from "../appStructure/AppStructure";
import { getStructureAsArray } from "../declarations/traverseBackend";
import getAppPath from "appPath";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";

export default class FrontendStructure implements AppStructureItem {
  async getStructureAsArray(): Promise<AppStructureItem[]> {
    return Object.values(this.structure || {});
  }

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
}

// Instantiate FrontendStructure

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);

const frontendStructure: FrontendStructure = new FrontendStructure(projectPath);

// const frontend = new FrontendStructure()
// Export frontendStructure
export { frontendStructure };

// Define frontend object using frontendStructure
export const frontend = {
  id: '0',
  name: "",
  type: "",
  path: "",
  content: "",
  draft: false,
  // structure: frontendStructure.getStructure(),
  permissions: {
    read: false,
    write: false,
    delete: false,
    share: false,
    execute: false,
  },
  // structure: frontendStructure.getStructure(),
  getStructureAsArray: getStructureAsArray,
  // traverseDirectory: frontendStructure.traverseFrontendDirectory(),
  getStructure: () => frontendStructure.getStructure(), // Accessing structure via frontendStructure instance
};
