// BackendStructure.ts
import Logger from "@/app/components/logging/Logger";
import { NotificationType } from "@/app/components/support/NotificationContext";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import * as fs from "fs/promises"; // Use promise-based fs module
import * as path from "path";
import getAppPath from "../../../../appPath";
import { AppStructureItem } from "./AppStructure";

export default class BackendStructure {
  [key: string]: any
  structure: Record<string, AppStructureItem> = {};

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
          // Logic to parse file and update structure accordingly
          if (file.endsWith(".py")) {
            const uniqueID = UniqueIDGenerator.generateID(
              file,
              filePath,
              "generateBackendStructureID" as NotificationType
            );
            const fileContent = await fs.readFile(filePath, "utf-8");
            this.structure[uniqueID] = {

              id: uniqueID,
              name: file,
              type: "file",
              items: {},
              path: filePath,
              content: fileContent,
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
      throw error; // Rethrow the error for higher-level error handling
    }
  }

  public async getStructure(): Promise<Record<string, AppStructureItem>> {
    return { ...this.structure };
  }
}

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
export const backendStructure: BackendStructure = new BackendStructure(
  projectPath
);
