import { SecuritySettings } from '@/app/components/settings/SecuritySettings';
import * as apiFile from '@/api/ApiFiles';
import SecurityAPI from '@/app/api/SecurityAPI';
import { FileType } from "@/app/components/documents/Attachment/attachment";
import { Permission } from "@/app/components/users/Permission";
import { versionData } from '@/app/components/versions/Version';
import { VersionData } from '@/app/components/versions/VersionData';
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import * as fs from "fs";
import * as path from "path";
import getAppPath from "../../../../appPath";
import { DataVersions } from '../DataVersionsConfig';

// Define the interface for AppStructureItem
interface AppStructureItem {
  id: string;
  name: string;
  type: string | Promise<FileType>;
  path: string;
  content: string;
  draft: boolean;
  permissions: {
    read: boolean,
    write: boolean,
    delete: boolean,
    share: boolean,
    execute: boolean,
  }
  versions: DataVersions | undefined,
  versionData: string | VersionData | null,
  items?: {
    [key: string]: AppStructureItem 
  }
  getStructure?(): Promise<Record<string, AppStructureItem>>;
  
}

const { versionNumber, appVersion } = getCurrentAppInfo();



// const frontendStructure: FrontendStructure = new FrontendStructure(projectPath);
// const backendStructure: BackendStructure = new BackendStructure(projectPath);

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

    /**
   * Get permissions for a specific file or directory from security settings
   */
  private getPermissionsForPath(path: string, securitySettings: SecuritySettings): Permission {
    // Default permissions if not explicitly set in security settings
    const defaultPermissions: Permission = {
      read: true,
      write: false,
      delete: false,
      share: false,
      execute: false,
    };

    // Check if securitySettings has permissions for this path
    const pathPermissions = securitySettings?.permission?.[path];

    if (pathPermissions) {
      return {
        read: pathPermissions.read ?? defaultPermissions.read,
        write: pathPermissions.write ?? defaultPermissions.write,
        delete: pathPermissions.delete ?? defaultPermissions.delete,
        share: pathPermissions.share ?? defaultPermissions.share,
        execute: pathPermissions.execute ?? defaultPermissions.execute,
      };
    }

    return defaultPermissions;
  }
  

  private async traverseDirectory(dir: string, type: "backend" | "frontend"): Promise<Record<string, AppStructureItem>> {
    const structure: Record<string, AppStructureItem> = {};  // Initialize the structure to collect items
  
    const files = fs.readdirSync(dir);

    // Fetch global or directory-specific security settings
    const securitySettings = await SecurityAPI.getSecuritySettings(); 

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();
  
      // Await the backend and frontend structure fetching
      const backendStructure = await this.fetchBackendStructure(filePath); 
      const frontendStructure = await this.fetchFrontendStructure(filePath); 
  
      if (isDirectory) {
        // Recursively traverse subdirectories, but don't overwrite the structure for directories
        const subDirectoryStructure = await this.traverseDirectory(filePath, type);
        structure[file] = {
          ...subDirectoryStructure,  // Preserve the sub-directory structure
          id: path.basename(filePath),
          name: file,
          type: "directory",  // Directory type
          path: filePath,
          content: "",  // No content for directories
          draft: false,
          permissions: this.getPermissionsForPath(filePath, securitySettings), // Get permissions from security

          versions: {
            backend: backendStructure, // Include the fetched backend structure
            frontend: frontendStructure, // Include the fetched frontend structure
          },
          versionData: [],  // Empty for now; populate it as needed
        };
      } else {
        // Handle file-specific logic for backend or frontend types
        if (
          (type === "backend" && file.endsWith(".py")) || // backend-specific file
          (type === "frontend" && file.endsWith(".tsx")) // frontend-specific file
        ) {
          const fileType = await apiFile.getFileType(filePath);  // Assuming `apiFile.getFileType` returns a valid type
  
          structure[file] = {
            id: path.basename(filePath),
            name: file,
            items: {},  // Assuming this is intended to hold child items if needed
            path: filePath,
            content: fs.readFileSync(filePath, "utf-8"),  // Read the content of the file
            draft: false,
            permissions: this.getPermissionsForPath(filePath, securitySettings), // Get permissions from security
            type: fileType,  // Dynamically set the file type
            versions: {
              backend: backendStructure, // Include the backend structure
              frontend: frontendStructure, // Include the frontend structure
            },
            versionData: [],  // Empty for now; populate it as needed
          };
        }
      }
    }
  
    return structure; // Return the structure at the end
  }
  
  
/**
 * This function can be used to determine the backend structure.
 * You can customize it to return a more detailed structure for backend files.
 */
private fetchBackendStructure(filePath: string): Record<string, AppStructureItem> {
  const fileName = path.basename(filePath); // Get the file name from the file path
  return {
    [filePath]: {
      id: fileName, // Unique identifier for the item (can use the file name or a UUID)
      name: fileName, // The name of the file
      type: "file", // The type of the item (can be a directory, file, etc.)
      draft: false, // Set the draft flag (you can set this based on your logic)
      path: filePath, // The full path to the file
      content: fs.readFileSync(filePath, "utf-8"), // Read the content of the file
      permissions: [],
      versions: [],
      versionData: versionData,
      read: true,
      write: true,
      delete: true,
      share: true,
      execute: true,
    }
  };
}

/**
 * This function can be used to determine the frontend structure.
 * You can customize it to return a more detailed structure for frontend files.
 */
  private fetchFrontendStructure(filePath: string): Record<string, AppStructureItem> {
    const fileName = path.basename(filePath); // Get the file name from the file path
    return {
      [filePath]: {
        id: fileName, // Unique identifier for the item (can use the file name or a UUID)
        name: fileName, // The name of the file
        type: "file", // The type of the item (can be a directory, file, etc.)
        draft: false, // Set the draft flag (you can set this based on your logic)
        path: filePath, // The full path to the file
        content: fs.readFileSync(filePath, "utf-8"), // Read the content of the file
        permissions: [],
        versions: [],
        versionData: versionData,
        read: true,
        write: true,
        delete: true,
        share: true,
        execute: true,
      }
    };
  }
  
  // Public method to access the backend structure
  public async getBackendStructure(filePath: string): Promise<Record<string, AppStructureItem>> {
    return this.fetchBackendStructure(filePath);
  }

  // Public method to access the frontend structure
  public async getFrontendStructure(filePath: string): Promise<Record<string, AppStructureItem>> {
    return this.fetchFrontendStructure(filePath);
  }

  getStructure(): Record<string, AppStructureItem> {
    return { ...this.structure };
  }


  async getStructureAsArray(): Promise<AppStructureItem[]> {
    return this.structure ? Object.values(this.structure) : [];
  }


  private async handleFileChange(event: string, filePath: string) {
    try {
      console.log(`File changed: ${event} $frontend/buddease/src/app/configs/appStructure/AppStructure.ts`);

      // Assuming `this.projectPath` is correctly set based on the type ("backend" or "frontend") in the constructor.
      const backendPath = getAppPath(versionNumber, appVersion); // For backend, use the appropriate path
      const frontendPath = path.join(getAppPath(versionNumber, appVersion), "datanalysis/frontend"); // For frontend, use the frontend path

      const updatedContent = await fs.promises.readFile(filePath, "utf-8");
      const [backendStructure, frontendStructure] = await Promise.all([
        this.traverseDirectory(backendPath, "backend"),
        this.traverseDirectory(frontendPath, "frontend"),
      ]);

      this.structure[path.basename(filePath)] = {
        id: path.basename(filePath),
        name: path.basename(filePath),
        items: {},
        path: filePath,
        content: updatedContent,
        draft: false,
        permissions: {
          read: true,
          write: true,
          delete: true,
          share: true,
          execute: true,
        },
        type: fs.statSync(filePath).isDirectory() ? "directory" : "file",
        versions: {


          backend: backendStructure,
          frontend: frontendStructure
        },
        versionData: []
      };

    } catch (error) {
      console.error(`Error handling file change: ${error}`);
    }

  }}

// Remove the export of AppStructureItem since it's already exported as a type
export type { AppStructureItem };
export const appStructure: AppStructureItem = {} as AppStructureItem;