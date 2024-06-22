import { getStructureAsArray } from '@/app/configs/declarations/traverseBackend';
// BackendStructure.ts
import Logger from "@/app/components/logging/Logger";
import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import * as fs from "fs/promises"; // Use promise-based fs module
import * as path from "path";
import getAppPath from "../../../../appPath";
import { AppStructureItem } from "./AppStructure";
export default class BackendStructure {
  getStructureAsArray(): Promise<AppStructureItem[]> | undefined {
    const appVersion = getCurrentAppInfo().toString();
    const appPath = getAppPath(versionNumber, appVersion);
    return undefined;
    }
  structure: Record<string, AppStructureItem> | undefined= {};

  constructor(projectPath: string) {
    this.traverseDirectory(projectPath);
  }

  async traverseDirectory(dir: string): Promise<AppStructureItem[]> {
    const result: AppStructureItem[] = [];

    try {
      const files = await fs.readdir(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          const subDirectoryItems = await this.traverseDirectory(filePath);
          result.push(...subDirectoryItems);
        } else if (stat.isFile()) {
          if (file.endsWith(".py")) {
            const uniqueID = UniqueIDGenerator.generateID(
              file,
              filePath,
              NotificationTypeEnum.FileID,
            );
            const fileContent = await fs.readFile(filePath, "utf-8");
            this.structure?[uniqueID] = {
              id: uniqueID,
              name: file,
              type: "file",
              items: {},
              path: filePath,
              draft: true,
              content: fileContent,
              permissions: {
                read: true,
                write: true,
                delete: true,
                execute: true,
                share: true,
              }
            };
            Logger.logWithOptions(
              "File Change",
              `File ${file} changed.`,
              uniqueID
            );
            result.push(this.structure[uniqueID]);
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Error during directory traversal:", error);
      throw error;
    }
  }

  public async getStructure(): Promise<Record<string, AppStructureItem>> {
    return { ...this.structure };
  }
}

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const backendStructure: BackendStructure = new BackendStructure(projectPath);

export { backendStructure }

export const backend = {
  id: "backend" + versionNumber,
  name: "Backend",
  type: "folder",
  path: projectPath,
  content: "",
  draft: false,
  permissions: {
    read: true,
    write: true,
    delete: true,
    share: true,
    execute: true,
  },
  
  // items: backendStructure.structure,
  getStructureAsArray: getStructureAsArray,
  getStructure: backendStructure.getStructure,
}