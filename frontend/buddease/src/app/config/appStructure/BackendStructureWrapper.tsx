// BackendStructureWrapper.tsx
// BackendStructureWrapper.ts

import { AppStructureItem } from "@/app/config/appStructure/AppStructure";
import { IBackendStructure } from '@/app/config/appStructure/IBackendStructure';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import BackendStructure from "@/app/server/database/BackendStructure";
import { promises as fsPromises } from "fs";

class BackendStructureWrapper<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements IBackendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

  private backendStructure: BackendStructure;
  private exposeAll: boolean; // User-controlled toggle

  constructor(projectPath: string) {
    this.backendStructure = new BackendStructure(projectPath);
    this.exposeAll = false; // Default to not exposing all
  }

  async getExposedStructure(): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    const backendStructure = await this.backendStructure.getStructure();

    if (this.exposeAll) {
      // Expose all if the toggle is turned on
      return { ...backendStructure };
    }

    // Logic to filter or modify the structure based on your requirements
    const exposedStructure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};

    // Example: Expose only files, not directories
    Object.entries(backendStructure).forEach(async ([key, value]) => {
      try {
        const fileStat = await fsPromises.stat(value.path);
        if (!fileStat.isDirectory()) {
          exposedStructure[key] = value;
        }
      } catch (error) {
        console.error(`Error getting file stats for ${value.path}:`, error);

        console.error(
          NOTIFICATION_MESSAGES.BackendStructure.ERROR_GETTING_STRUCTURE
        );
      }
    });

    console.log(NOTIFICATION_MESSAGES.BackendStructure.DEFAULT);

    return exposedStructure;
  }

  setExposeAll(value: boolean) {
    this.exposeAll = value;
  }

  // Add other methods as needed

  async traverseExposedDirectory(dir: string): Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    // Implement logic to control what is exposed during traversal
    // Example: Exclude files in a certain directory
    const excludedDirectory = "excludeThisDirectory";
    const files = await this.backendStructure?.traverseDirectory?.(dir) || [];

    if (this.exposeAll) {
      // Return all files if the toggle is turned on
      return files;
    }

    console.log(NOTIFICATION_MESSAGES.BackendStructure.DEFAULT);
    const filteredFiles = files.filter((file: AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      try {
        const filePath = file.path;
        if (!filePath.includes(excludedDirectory)) {
          return file;
        }
      } catch (error) {
        console.error(`Error filtering file ${file.path}:`, error);

        console.error(
          NOTIFICATION_MESSAGES.BackendStructure.ERROR_FILTERING
        );
      }
    });

    // Notify about the completion of the filtering process
    console.log(NOTIFICATION_MESSAGES.BackendStructure.DEFAULT);

    return filteredFiles;
  }
}

export default BackendStructureWrapper;
