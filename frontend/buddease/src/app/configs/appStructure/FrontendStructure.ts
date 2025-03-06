import { Permission } from '@/app/components/users/Permission';
import axiosInstance from "@/app/api/axiosInstance";
import { createLatestVersion } from "@/app/components/versions/createLatestVersion";
import { VersionData, VersionHistory } from "@/app/components/versions/VersionData";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import { hashString } from "@/app/generators/HashUtils";
import getAppPath from "appPath";
import * as path from "path";
import { AppStructureItem } from "../appStructure/AppStructure";
import { DataVersions } from "../DataVersionsConfig";

export default class FrontendStructure implements AppStructureItem {
  [key: string]: any;
  
  versions: DataVersions = {
    backend: undefined,
    frontend: undefined
  }
  
  versionData: string | VersionData | null; // Changed to VersionData[] to match AppStructureItem

  id: string;
  name: string;
  type: string; // Adjust based on your FileType definition
  path: string;
  content: string;
  draft: boolean;
  permissions: Permission
  items?: Record<string, AppStructureItem>;

  private structure?: Record<string, AppStructureItem> | undefined = {};
  private structureHash: string = '';

  // Add versioning properties
  public major: number;
  public minor: number;
  public patch: number;

  constructor(projectPath: string,  major: number = 1, minor: number = 0, patch: number = 0) {
    this.id = "";
    this.name = "";
    this.type = "";
    this.path = "";
    this.content = "";
    this.draft = false;
    this.permissions = {
      userId: 'default', // Provide a default userId
      permissions: {}, // Default empty UserPermissions
      permissionType: 'read', // Default permission type
      canView: true, // From BasePermissions
      canEdit: false, // From BasePermissions
      read: true, // New property
      write: false, // New property
      delete: false, // New property
      share: false, // New property
      execute: false, // New property
    };
    this.items = {};
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.versionData = "";
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
            userId: 'default', // Provide a default userId
            permissions: {}, // Default empty UserPermissions
            permissionType: 'read', // Default permission type
            canView: true, // From BasePermissions
            canEdit: false, // From BasePermissions
            read: true, // New property
            write: false, // New property
            delete: false, // New property
            share: false, // New property
            execute: false, // New property
          },
          content: fileContent,
          versions: undefined,
          versionData: null
        };
        items.push(fileItem);
      }
    }

    return items;
  }



  async loadVersions(): Promise<void> {
    const backend = await this.loadBackendVersions();
    const frontend = await this.loadFrontendVersions();
    this.versions = { backend, frontend };
  }

  async loadBackendVersions(): Promise<Record<string, AppStructureItem>> {
    // Simulated async logic to load backend versions
    return new Promise((resolve) => {
      resolve({
        version1: {
          id: "version1",
          name: "Backend Version 1",
          type: "backend",
          path: "/backend/version1",
          content: "Backend version 1 content",
          draft: false,
          permissions: {
            userId: 'default', // Provide a default userId
            permissions: {}, // Default empty UserPermissions
            permissionType: 'read', // Default permission type
            canView: true, // From BasePermissions
            canEdit: false, // From BasePermissions
            read: true, // New property
            write: false, // New property
            delete: false, // New property
            share: false, // New property
            execute: false, // New property
          },
          versions: {
            backend: undefined,
            frontend: undefined,
          },
          versionData: null,
          items: {}, // Optional, can be an empty object
        },
        version2: {
          id: "version2",
          name: "Backend Version 2",
          type: "backend",
          path: "/backend/version2",
          content: "Backend version 2 content",
          draft: false,
          permissions: {
            userId: 'default', // Provide a default userId
            permissions: {}, // Default empty UserPermissions
            permissionType: 'read', // Default permission type
            canView: true, // From BasePermissions
            canEdit: false, // From BasePermissions
            read: true, // New property
            write: false, // New property
            delete: false, // New property
            share: false, // New property
            execute: false, // New property
          },  
          versions: {
            backend: undefined,
            frontend: undefined,
          },
          versionData: null,
          items: {}, // Optional, can be an empty object
        },
      });
    });
  }

  async loadFrontendVersions(): Promise<Record<string, AppStructureItem>> {
    // Simulated async logic to load frontend versions
    return new Promise((resolve) => {
      resolve({
        versionA: {
          id: "versionA",
          name: "Frontend Version A",
          type: "frontend",
          path: "/frontend/versionA",
          content: "Frontend version A content",
          draft: false,
          permissions: {
            userId: 'default', // Provide a default userId
            permissions: {}, // Default empty UserPermissions
            permissionType: 'read', // Default permission type
            canView: true, // From BasePermissions
            canEdit: false, // From BasePermissions
            read: true, // New property
            write: false, // New property
            delete: false, // New property
            share: false, // New property
            execute: false, // New property
          },  
          versions: {
            backend: undefined,
            frontend: undefined,
          },
          versionData: null,
          items: {}, // Optional, can be an empty object
        },
        versionB: {
          id: "versionB",
          name: "Frontend Version B",
          type: "frontend",
          path: "/frontend/versionB",
          content: "Frontend version B content",
          draft: false,
          permissions: {
            userId: 'default', // Provide a default userId
            permissions: {}, // Default empty UserPermissions
            permissionType: 'read', // Default permission type
            canView: true, // From BasePermissions
            canEdit: false, // From BasePermissions
            read: true, // New property
            write: false, // New property
            delete: false, // New property
            share: false, // New property
            execute: false, // New property
          },  
          versions: {
            backend: undefined,
            frontend: undefined,
          },
          versionData: null,
          items: {}, // Optional, can be an empty object
        },
      });
    });
  }

  // Getter for structureHash
  public getStructureHash(): Promise<string> {
    return Promise.resolve(this.structureHash);
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
    
    // Ensure versionData is an array
    const versionDataArray = Array.isArray(versionData) ? versionData : [];
    
    // Ensure versionData is not empty before accessing the last item
    const latestVersionData: VersionData = versionDataArray.length > 0 
    ? versionDataArray[versionDataArray.length - 1] 
    : {
      version: '1.0.0',
      id: '123',
      parentId: '456',
      parentType: 'feature',
      parentVersion: '1.0.0',
      timestamp: '2023-10-01T12:00:00Z',
      user: 'admin',
      changes: ['Initial version'],
      lastUpdated: '2023-10-01T12:00:00Z',
    };
    
      // Define data and changes
      const data = latestVersionData.changes; // or any other logic to derive data
      const changes = latestVersionData.changes; // or any other logic to derive changes
  
    
    // Map versionDataArray to history
      const history = versionDataArray.map((version: VersionData) => ({
      id: version.id,
      version: version.version,
      lastUpdated: version.lastUpdated,
        timestamp: version.timestamp,
        data: version.changes,
        changes: version.changes,
      }));
      
    // Use currentVersion if needed
    const currentVersion = latestVersionData.version;

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
        data,
        changes,
        versionData: versionDataArray,
        latestVersion: createLatestVersion(latestVersionData),
        lastUpdated: latestVersionData.lastUpdated,
        timestamp: latestVersionData.timestamp,
        history,
        currentVersion,
      } as VersionHistory;
    });
    return frontendStructureItemsWithVersions;
  }


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
    getStructureHash: () => frontendStructure.getStructureHash()
  };
}

export const frontend = await initializeFrontend();
