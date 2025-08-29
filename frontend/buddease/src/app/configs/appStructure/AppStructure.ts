import * as apiFile from '@/api/ApiFiles';
import SecurityAPI from '@/app/api/SecurityAPI';
import { FileType } from "@/app/components/documents/Attachment/attachment";
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { SecuritySettings } from '@/app/components/settings/SecuritySettings';
import { Permission } from "@/app/components/users/Permission";
import { versionData } from '@/app/components/versions/Version';
import { VersionData } from '@/app/components/versions/VersionData';
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import { Content } from '@/app/components/models/content/AddContent';
import { BaseDataEntity, BaseDataRoot, DefaultMeta, DefaultExcludedFields } from '@/app/configs/BaseConfig';

import * as fs from "fs";
import * as path from "path";
import { DataVersions } from '../DataVersionsConfig';
import getAppPath from "./appPath";
import { useSecureUserId } from '../utils/useSecureUserId';

const userId = useSecureUserId()

// Define the interface for AppStructureItem
interface AppStructureItem<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  id: string;
  userId: string; // distinct user identity, not the same as the file id user, identifier that the permissions apply to
  name: string;
  type: string | Promise<FileType>;
  path: string;
  content?: string | Content<T, K> | undefined;
  draft: boolean;
  permissions?: AppStructurePermissions;
  versions: DataVersions | undefined,
  versionData: string | VersionData<T, K> | null,
  items?: {
    [key: string]: AppStructureItem<T, K, Meta, ExcludedFields> 
  }
  getStructure?(): Promise<Record<string, AppStructureItem<T, K, Meta, ExcludedFields>>>;
}

interface AppStructurePermissions extends Permission {
  // Add any additional properties specific to AppStructureItem
  customPermission?: boolean;
}

const { versionNumber, appVersion } = getCurrentAppInfo();


export default class AppStructure<
  T extends BaseDataEntity = BaseDataRoot, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  
  private structure: Record<string, AppStructureItem<T, K, Meta, ExcludedFields>> = {};

  constructor(type: "backend" | "frontend") {
    const projectPath =
      type === "backend"
        ? getAppPath(versionNumber, appVersion)
        : path.join(getAppPath(versionNumber, appVersion), "datanalysis/frontend");
    this.traverseDirectory(projectPath, type);
  }



  private getDefaultPermissions(): AppStructurePermissions {
    return {
      userId: 'default',
      permissions: {},
      permissionType: 'read',
      canView: true,
      canEdit: false,
      read: true,
      write: false,
      delete: false,
      share: false,
      execute: false,
      customPermission: false,
    };
  }


  private createAppStructureItem(
    baseProps: {
      id: string;
      name: string;
      type: string;
      path: string;
      draft: boolean;
      content: string;
      isDirectory: boolean;
    },
    versions: { backend: Record<string, AppStructureItem<T, K, Meta, ExcludedFields>>; frontend: Record<string, AppStructureItem<T, K, Meta, ExcludedFields>> }
  ): AppStructureItem<T, K, Meta, ExcludedFields> {
    return {
      id: baseProps.id,
      userId: baseProps.userId,
      name: baseProps.name,
      type: baseProps.type,
      path: baseProps.path,
      draft: baseProps.draft,
      content: baseProps.content,
      permissions: this.getDefaultPermissions(),
      versions: versions,
      versionData: null,
      // Add other required properties with defaults
      items: baseProps.isDirectory ? {} : undefined,
    };
  }
    /**
   * Get permissions for a specific file or directory from security settings
   */
  private getPermissionsForPath(path: string, securitySettings: SecuritySettings): Permission {
    // Default permissions if not explicitly set in security settings
    const defaultPermissions: Permission = {

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

    // Check if securitySettings has permissions for this path
    const pathPermissions = securitySettings?.permission?.[path] ?? undefined;

    if (pathPermissions) {
      return {
        read: pathPermissions.read ?? defaultPermissions.read,
        write: pathPermissions.write ?? defaultPermissions.write,
        delete: pathPermissions.delete ?? defaultPermissions.delete,
        share: pathPermissions.share ?? defaultPermissions.share,
        execute: pathPermissions.execute ?? defaultPermissions.execute,
        userId: pathPermissions.userId ?? defaultPermissions.userId,
        permissions: pathPermissions.permissions ?? defaultPermissions.permissions,
        permissionType: pathPermissions.permissionType ?? defaultPermissions.permissionType,
        canView: pathPermissions.canView ?? defaultPermissions.canView,
        canEdit: pathPermissions.canEdit ?? defaultPermissions.canEdit,
        
      };
    }

    return defaultPermissions;
  }

    private async traverseDirectory(dir: string, type: "backend" | "frontend"): Promise<Record<string, AppStructureItem<T, K, Meta, ExcludedFields>>> {
    const structure: Record<string, AppStructureItem<T, K, Meta, ExcludedFields>> = {};
    const files = fs.readdirSync(dir);
    const securitySettings = await SecurityAPI.getSecuritySettings();

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      let backendStructure = {};
      let frontendStructure = {};

      if (type === "backend") {
        const result = await this.fetchBackendStructure(filePath);
        backendStructure = result[filePath]?.versions?.backend || {};
      } else {
        const result = await this.fetchFrontendStructure(filePath);
        frontendStructure = result[filePath]?.versions?.frontend || {};
      }

      if (isDirectory) {
        const subDirectoryStructure = await this.traverseDirectory(filePath, type);
        structure[file] = this.createAppStructureItem(
          {
            id: path.basename(filePath),
            name: file,
            type: "directory",
            path: filePath,
            draft: false,
            content: "",
            isDirectory: true,
          },
          {
            backend: backendStructure,
            frontend: frontendStructure,
          }
        );
      } else {
        if (
          (type === "backend" && file.endsWith(".py")) ||
          (type === "frontend" && file.endsWith(".tsx"))
        ) {
          const fileType = await apiFile.getFileType(filePath);
          structure[file] = this.createAppStructureItem(
            {
              id: path.basename(filePath),
              name: file,
              type: fileType,
              path: filePath,
              draft: false,
              content: fs.readFileSync(filePath, "utf-8"),
              isDirectory: false,
            },
            {
              backend: backendStructure,
              frontend: frontendStructure,
            }
          );
        }
      }
    }
    return structure;
  }
  
/**
 * This function can be used to determine the backend structure.
 * You can customize it to return a more detailed structure for backend files.
 */
  private async fetchBackendStructure(filePath: string): Promise<Record<string, AppStructureItem<T, K, Meta, ExcludedFields>>> {
    const fileName = path.basename(filePath);
    const isDirectory = fs.statSync(filePath).isDirectory();

    // FIX: Avoid circular calls - only fetch sub-structures for directories
    let backendStructure: Record<string, AppStructureItem<T, K, Meta, ExcludedFields>> = {};
    let frontendStructure: Record<string, AppStructureItem<T, K, Meta, ExcludedFields>> = {};

    if (isDirectory) {
      // Only traverse subdirectories, don't call this method recursively on itself
      backendStructure = await this.traverseDirectory(filePath, "backend");
    }

    const item = this.createAppStructureItem(
      {
        id: fileName,
        name: fileName,
        type: isDirectory ? "directory" : "file",
        path: filePath,
        draft: false,
        content: isDirectory ? "" : fs.readFileSync(filePath, "utf-8"),
        isDirectory,
      },
      {
        backend: backendStructure,
        frontend: frontendStructure
      }
    );

    return { [filePath]: item };
  }

/**
 * This function can be used to determine the frontend structure.
 * You can customize it to return a more detailed structure for frontend files.
 */
 private async fetchFrontendStructure(filePath: string): Promise<Record<string, AppStructureItem<T, K, Meta, ExcludedFields>>> {
    const fileName = path.basename(filePath);
    const isDirectory = fs.statSync(filePath).isDirectory();

    let backendStructure: Record<string, AppStructureItem<T, K, Meta, ExcludedFields>> = {};
    let frontendStructure: Record<string, AppStructureItem<T, K, Meta, ExcludedFields>> = {};

    if (isDirectory) {
      frontendStructure = await this.traverseDirectory(filePath, "frontend");
    }

    const item = this.createAppStructureItem(
      {
        id: fileName,
        name: fileName,
        type: isDirectory ? "directory" : "file",
        path: filePath,
        draft: false,
        content: isDirectory ? "" : fs.readFileSync(filePath, "utf-8"),
        isDirectory,
      },
      {
        backend: backendStructure,
        frontend: frontendStructure
      }
    );

    return { [filePath]: item };
  }

  
  // Public method to access the backend structure
  public async getBackendStructure(filePath: string): Promise<Record<string, AppStructureItem<T, K, Meta, ExcludedFields>>> {
    return this.fetchBackendStructure(filePath);
  }

  // Public method to access the frontend structure
  public async getFrontendStructure(filePath: string): Promise<Record<string, AppStructureItem<T, K, Meta, ExcludedFields>>> {
    return this.fetchFrontendStructure(filePath);
  }

  getStructure(): Record<string, AppStructureItem<T, K, Meta, ExcludedFields>> {
    return { ...this.structure };
  }


  async getStructureAsArray(): Promise<AppStructureItem<T, K, Meta, ExcludedFields>[]> {
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
        userId: userId,
        draft: false,
        permissions: {
          read: true,
          write: true,
          delete: true,
          share: true,
          execute: true,
          canView: true, 
          canEdit: false,
          userId: "userId",
          permissionType: 'read', 
          permissions: {},
        },
        type: fs.statSync(filePath).isDirectory() ? "directory" : "file",
        versions: {


          backend: backendStructure,
          frontend: frontendStructure
        },
        versionData: null
      };
    } catch (error) {
      console.error(`Error handling file change: ${error}`);
    }
  }
}

// Remove the export of AppStructureItem since it's already exported as a type
export type { AppStructureItem, AppStructurePermissions };

export const createAppStructure = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(): AppStructureItem<T, K, Meta, ExcludedFields> => {
  return {} as AppStructureItem<T, K, Meta, ExcludedFields>;
};
const appStructure = createAppStructure<BaseDataEntity>();
