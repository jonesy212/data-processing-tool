import * as apiFile from '@/api/ApiFiles';
import SecurityAPI from '@/app/api/SecurityAPI';
import { Attachment, FileType } from "@/app/documents/attachment/attachment";
import { useSecureUserId } from '@/app/hooks/useSecureUserId';
import { Content } from '@/app/models/content/AddContent';
import { SecuritySettings } from '@/app/settings/SecuritySettings';
import { Permission } from "@/app/users/Permission";
import { VersionData } from '@/app/versions/VersionData';
import { getCurrentAppInfo } from "@/app/versions/VersionGenerator";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { DataVersions } from '@/configs/DataVersionsConfig';
import getAppPath from "./appPath";

const userId = useSecureUserId()

// Define the interface for AppStructureItem
interface AppStructureItem <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  userId: string;
  name: string;
  type: string | Promise<FileType>;
  path: string;
  content?: string | Content<T, K> | undefined;
  draft: boolean;
  permissions?: AppStructurePermissions;
  versions: DataVersions | undefined;
  versionData: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  items?: {
    [key: string]: AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
  };
  getStructure?(): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>;
}

interface AppStructurePermissions extends Permission {
  customPermission?: boolean;
}

const { versionNumber, appVersion } = getCurrentAppInfo();

// Interface for file system operations - abstracted away from fs
interface FileSystemService {
  readdir(dir: string): Promise<string[]>;
  stat(path: string): Promise<{ isDirectory: boolean }>;
  readFile(path: string, encoding: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}

export default class AppStructure<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  
  private structure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
  private fileSystem: FileSystemService;

  constructor(type: "backend" | "frontend", fileSystem?: FileSystemService) {
    this.fileSystem = fileSystem || this.createDefaultFileSystem();
    const projectPath = this.getProjectPath(type);
    this.initializeStructure(projectPath, type);
  }

  private createDefaultFileSystem(): FileSystemService {
    // This will be implemented by the consumer or a platform-specific module
    throw new Error("FileSystemService must be provided in environments without fs access");
  }

  private getProjectPath(type: "backend" | "frontend"): string {
    return type === "backend"
      ? getAppPath(versionNumber, appVersion)
      : `${getAppPath(versionNumber, appVersion)}/datanalysis/frontend`;
  }

  private async initializeStructure(projectPath: string, type: "backend" | "frontend") {
    try {
      this.structure = await this.traverseDirectory(projectPath, type);
    } catch (error) {
      console.error("Failed to initialize app structure:", error);
      this.structure = {};
    }
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
      userId: string;
      name: string;
      type: string;
      path: string;
      draft: boolean;
      content: string;
      isDirectory: boolean;
    },
    versions: {
      backend: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
      frontend: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    }
  ): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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
      items: baseProps.isDirectory ? {} : undefined,
    };
  }

  private async getPermissionsForPath(path: string, securitySettings: SecuritySettings): Promise<Permission> {
    const defaultPermissions: Permission = {
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
    };

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

  private async traverseDirectory(dir: string, type: "backend" | "frontend"): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    const structure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
    
    try {
      const files = await this.fileSystem.readdir(dir);
      const securitySettings = await SecurityAPI.getSecuritySettings();

      for (const file of files) {
        const filePath = `${dir}/${file}`;
        const stat = await this.fileSystem.stat(filePath);
        const isDirectory = stat.isDirectory;

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
              id: file,
              userId: userId ?? 'unknown-user',
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
            const content = await this.fileSystem.readFile(filePath, "utf-8");
            
            structure[file] = this.createAppStructureItem(
              {
                id: file,
                userId: userId ?? 'unknown-user',
                name: file,
                type: fileType,
                path: filePath,
                draft: false,
                content: content,
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
    } catch (error) {
      console.error(`Error traversing directory ${dir}:`, error);
    }
    
    return structure;
  }

  private async fetchBackendStructure(filePath: string): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    try {
      const stat = await this.fileSystem.stat(filePath);
      const isDirectory = stat.isDirectory;
      const fileName = filePath.split('/').pop() || filePath;

      let backendStructure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
      let frontendStructure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};

      if (isDirectory) {
        backendStructure = await this.traverseDirectory(filePath, "backend");
      }

      const content = isDirectory ? "" : await this.fileSystem.readFile(filePath, "utf-8");

      const item = this.createAppStructureItem(
        {
          id: fileName,
          userId: userId ?? 'unknown-user',
          name: fileName,
          type: isDirectory ? "directory" : "file",
          path: filePath,
          draft: false,
          content: content,
          isDirectory,
        },
        {
          backend: backendStructure,
          frontend: frontendStructure
        }
      );

      return { [filePath]: item };
    } catch (error) {
      console.error(`Error fetching backend structure for ${filePath}:`, error);
      return {};
    }
  }

  private async fetchFrontendStructure(filePath: string): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    try {
      const stat = await this.fileSystem.stat(filePath);
      const isDirectory = stat.isDirectory;
      const fileName = filePath.split('/').pop() || filePath;

      let backendStructure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
      let frontendStructure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};

      if (isDirectory) {
        frontendStructure = await this.traverseDirectory(filePath, "frontend");
      }

      const content = isDirectory ? "" : await this.fileSystem.readFile(filePath, "utf-8");

      const item = this.createAppStructureItem(
        {
          id: fileName,
          userId: userId ?? 'unknown-user',
          name: fileName,
          type: isDirectory ? "directory" : "file",
          path: filePath,
          draft: false,
          content: content,
          isDirectory,
        },
        {
          backend: backendStructure,
          frontend: frontendStructure
        }
      );

      return { [filePath]: item };
    } catch (error) {
      console.error(`Error fetching frontend structure for ${filePath}:`, error);
      return {};
    }
  }

  public async getBackendStructure(filePath: string): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    return this.fetchBackendStructure(filePath);
  }

  public async getFrontendStructure(filePath: string): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    return this.fetchFrontendStructure(filePath);
  }

  getStructure(): Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return { ...this.structure };
  }

  async getStructureAsArray(): Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return this.structure ? Object.values(this.structure) : [];
  }

  async handleFileChange(event: string, filePath: string) {
    try {
      console.log(`File changed: ${event} ${filePath}`);

      const backendPath = getAppPath(versionNumber, appVersion);
      const frontendPath = `${getAppPath(versionNumber, appVersion)}/datanalysis/frontend`;

      const updatedContent = await this.fileSystem.readFile(filePath, "utf-8");
      const [backendStructure, frontendStructure] = await Promise.all([
        this.traverseDirectory(backendPath, "backend"),
        this.traverseDirectory(frontendPath, "frontend"),
      ]);

      const fileName = filePath.split('/').pop() || filePath;
      const stat = await this.fileSystem.stat(filePath);

      this.structure[fileName] = {
        id: fileName,
        name: fileName,
        items: {},
        path: filePath,
        content: updatedContent,
        userId: userId,
        draft: false,
        permissions: this.getDefaultPermissions(),
        type: stat.isDirectory ? "directory" : "file",
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

  // Method to update the file system service if needed
  setFileSystemService(fileSystem: FileSystemService) {
    this.fileSystem = fileSystem;
  }
}

export type { AppStructureItem, AppStructurePermissions };

export const createAppStructure = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(fileSystem?: FileSystemService): AppStructure<T, K, Meta, ExcludedFields> => {
  return new AppStructure<T, K, Meta, ExcludedFields>("frontend", fileSystem);
};