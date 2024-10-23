// BackendStructure.ts
import Logger from "@/app/components/logging/Logger";
import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import * as fs from "fs/promises"; // Use promise-based fs module
import * as path from "path";
import getAppPath from "../../../../appPath";
import { AppStructureItem } from "./AppStructure";
import { VersionHistory } from "@/app/components/versions/VersionData";
import { hashString } from "@/app/generators/HashUtils";
import { frontend } from "./FrontendStructure";

// structureHash, setStructureHash, updateStructureHash, getStructureHashAndUpdateIfNeeded, backendVersions


export default class BackendStructure {
  private structure?: Record<string, AppStructureItem> = {};
  private structureHash: Promise<string> = Promise.resolve('');
  public globalState: any; // Add globalState property

  private databaseSchema?: Record<string, any> = {};
  private services?: Record<string, any> = {};

  constructor(projectPath: string, globalState?: any) {

    this.globalState = globalState;
    this.traverseDirectory!(projectPath).then((items) => {
      items.forEach((item) => {
        if (this.structure) {
          this.structure[item.id] = item;
        }
      });
    });
  }


  // Methods to manage and interact with databaseSchema
  public setDatabaseSchema(schema: Record<string, any>): void {
    this.databaseSchema = schema;
  }

  public getDatabaseSchema(): Record<string, any> | undefined {
    return this.databaseSchema;
  }

  // Methods to manage and interact with services
  public setServices(services: Record<string, any>): void {
    this.services = services;
  }

  public getServices(): Record<string, any> | undefined {
    return this.services;
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


  // Getter for structureHash
  public getStructureHash(): Promise<string> {
    return Promise.resolve(this.structureHash);
  }

  // Setter for structureHash
  public setStructureHash(hash: Promise<string>): void {
    this.structureHash = hash;
  }

  public async updateStructureHash(): Promise<void> {
    try {
      const structureArray = this.getStructureAsArray();
      const structureString = JSON.stringify(structureArray);
      const newStructureHash = hashString(structureString);
      
      // Update the private structureHash
      this.setStructureHash(Promise.resolve(newStructureHash));
      
      // Generate or obtain a uniqueID
      const uniqueID = UniqueIDGenerator.generateID('structureHashUpdate', newStructureHash, NotificationTypeEnum.OperationUpdate);

      Logger.logWithOptions(
        "Structure Hash Update",
        `Structure hash updated to ${newStructureHash}.`,
        uniqueID
      );
    } catch (error) {
      console.error("Error updating structure hash:", error);
      throw error;
    }
  }

  public async getStructureHashAndUpdateIfNeeded(): Promise<string> {
    try {
      const currentHash = this.getStructureHash();
      await this.updateStructureHash(); // Update hash if needed
      return this.getStructureHash();
    } catch (error) {
      console.error("Error getting or updating structure hash:", error);
      throw error;
    }
  }


  async traverseDirectory?(dir: string): Promise<AppStructureItem[]> {
    const result: AppStructureItem[] = [];

    try {
      const files = await fs.readdir(dir);
      const result: AppStructureItem[] = [];

      for (const file of files) {
        // You can add logic here to process each file and convert it into AppStructureItem as needed.
        // For now, we are assuming `fetchFilesInDirectory` gives the necessary data for each file.
        // You can expand this part as per your specific requirements.
      }


      // Access backend and frontend structures
      const backendStructureArray = backend.getStructureAsArray();
      const frontendStructureArray = frontend.getStructureAsArray();

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
            versions: undefined,
            versionData: []
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


      // Add backend and frontend structures to the result
      result.push(...backendStructureArray);
      result.push(...await frontendStructureArray);


      return result;
    } catch (error) {
      console.error("Error during directory traversal:", error);
      throw error;
    }
  }
  
  backendVersions(): VersionHistory[] {
    const { versionNumber, appVersion } = getCurrentAppInfo();
    const projectPath = getAppPath(versionNumber, appVersion);
    const backendStructure: BackendStructure = new BackendStructure(projectPath);
    const backendStructureItems = backendStructure.getStructureAsArray();
    const backendStructureItemsWithVersions = backendStructureItems.map((item) => {
      const { id, name, type, items, path, draft, content, permissions } = item;
      return {
        id,
        name,
        type,
        items,
        path,
        draft,
        content,
        permissions,
        versions: [],
        versionData: []
      };
    });
    return backendStructureItemsWithVersions;
  }
}

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const backendStructure: BackendStructure = new BackendStructure(projectPath);

export { backendStructure };

export const backend = {
  ...backendStructure,
  items: backendStructure.getStructure(),
  getStructureAsArray: backendStructure.getStructureAsArray.bind(backendStructure),
  traverseDirectoryPublic: backendStructure.traverseDirectoryPublic?.bind(backendStructure),
  getStructure: () => backendStructure.getStructure(),
  getStructureHash: backendStructure.getStructureHash.bind(backendStructure), // Bind the getStructureHash method
  getDatabaseSchema: backendStructure.getDatabaseSchema.bind(backendStructure), // Expose databaseSchema methods
  setDatabaseSchema: backendStructure.setDatabaseSchema.bind(backendStructure),
  getServices: backendStructure.getServices.bind(backendStructure), // Expose services methods
  setServices: backendStructure.setServices.bind(backendStructure)
}
