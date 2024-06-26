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
  private structure?: Record<string, AppStructureItem> = {};

  constructor(projectPath: string) {
    this.traverseDirectory!(projectPath).then((items) => {
      items.forEach((item) => {
        if (this.structure) {
          this.structure[item.id] = item;
        }
      });
    });
  }

  async traverseDirectory?(dir: string): Promise<AppStructureItem[]> {
    const result: AppStructureItem[] = [];

    try {
      const files = await fs.readdir(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          const subDirectoryItems = await this.traverseDirectory!(filePath);
          result.push(...subDirectoryItems);
        } else if (stat.isFile() && file.endsWith(".py")) {
          const uniqueID = UniqueIDGenerator.generateID(
            file,
            filePath,
            NotificationTypeEnum.FileID,
          );
          const fileContent = await fs.readFile(filePath, "utf-8");
          const appStructureItem: AppStructureItem = {
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
            },
          };
          if (this.structure) {
            this.structure[uniqueID] = appStructureItem;
          }
          Logger.logWithOptions(
            "File Change",
            `File ${file} changed.`,
            uniqueID
          );
          result.push(appStructureItem);
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

  public getStructureAsArray(): AppStructureItem[] {
    return Object.values(this.structure || {});
  }

  public async traverseDirectoryPublic(
    dir: string,
    fs: typeof import("fs")
  ): Promise<AppStructureItem[]> {
    return this.traverseDirectory ? this.traverseDirectory(dir) : [];
  }

}

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const backendStructure: BackendStructure = new BackendStructure(projectPath);

export { backendStructure };

export const backend = {
  ...backendStructure,
  items: await backendStructure.getStructure(),
  getStructureAsArray: backendStructure.getStructureAsArray.bind(backendStructure),
  traverseDirectoryPublic: backendStructure.traverseDirectoryPublic?.bind(backendStructure),
  getStructure: () => backendStructure.getStructure(),
}

