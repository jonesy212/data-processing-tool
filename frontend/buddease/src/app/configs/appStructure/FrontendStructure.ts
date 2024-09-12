import axiosInstance from "@/app/api/axiosInstance";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import getAppPath from "appPath";
import * as path from "path";
import { AppStructureItem } from "../appStructure/AppStructure";
import { VersionHistory } from "@/app/components/versions/VersionData";
import { hashString } from "@/app/generators/HashUtils";

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
          versions: undefined,
          versionData: []
        };
        items.push(fileItem);
      }
    }

    return items;
  }

  getStructure(): Promise<Record<string, AppStructureItem>> {
    return new Promise((resolve, reject) => {

      // Use axiosInstance to make HTTP requests to the backend API
      axiosInstance.get(`/api/traverse-directory?dir=${encodeURIComponent(this.path)}`)
    .then((response) => {
        const structure = response.data as Record<string, AppStructureItem>;
        this.structure = structure;
        resolve(structure);
    })
    .catch((error) => {
        console.error("Error fetching structure from backend:", error);
        reject(error);
      });
    });
  }


  async frontendVersions(): Promise<VersionHistory[]> {
    const { versionNumber, appVersion } = getCurrentAppInfo();
    const projectPath = getAppPath(versionNumber, appVersion);
    const frontendStructure: FrontendStructure = new FrontendStructure(projectPath);
    const frontendStructureItems = await frontendStructure.getStructureAsArray();
    const frontendStructureItemsWithVersions = frontendStructureItems.map((item) => {
      const { id, name, type, items, path, draft, content, permissions, versions, versionData } = item;
      return {
        id,
        name,
        type,
        items,
        path,
        draft,
        content,
        permissions,
        versions,
        versionData
      };
    });
    return frontendStructureItemsWithVersions;
  }
  // public async getStructure(): Promise<Record<string, AppStructureItem>> { 
  //   return this.structure || {};
  // }

  public async getStructureAsArray(): Promise<AppStructureItem[]> {
    return Object.values(this.structure || {});
  }



  // New method to calculate and return the checksum of the structure
  public async getStructureChecksum(): Promise<string> {
    try {
      // Step 1: Retrieve the structure and convert it to an array
      const structureArray = this.getStructureAsArray();
      
      // Step 2: Convert the structure array to a JSON string
      const structureString = JSON.stringify(structureArray);
      
      // Step 3: Generate a checksum/hash from the structure string
      const checksum = hashString(structureString);
      
      // Optional: Log or return the checksum
      console.log('Structure Checksum:', checksum);
      
      return checksum;
    } catch (error) {
      console.error("Error generating structure checksum:", error);
      throw error;
    }
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
