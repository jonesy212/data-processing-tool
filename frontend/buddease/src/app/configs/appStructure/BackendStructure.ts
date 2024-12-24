import { createLatestVersion } from '@/app/components/versions/createLatestVersion';
// BackendStructure.ts
import { sanitizeDatabaseSchema } from '@/app/components/database/sanitizeDatabase';
import Logger from "@/app/components/logging/Logger";
import { SecureField, SecureMetadata } from '@/app/components/security/SecureField';
import SecureFieldManager from '@/app/components/security/SecureFieldManager';
import SecurityAudit from '@/app/components/security/SecurityAudit';
import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { VersionHistory } from "@/app/components/versions/VersionData";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { hashString } from "@/app/generators/HashUtils";
import * as fs from "fs/promises"; // Use promise-based fs module
import * as path from "path";
import getAppPath from "../../../../appPath";
import { AppStructureItem } from "./AppStructure";
import { frontend } from "./FrontendStructure";


interface StructuredBackend {
  structureHash: string | undefined;
  getStructureHash(): Promise<string | undefined>;
  setStructureHash(hash: string): Promise<void>;
  // ... other properties
}

interface Schema {
  [key: string]: any;
}
interface DatabaseSchema extends Schema {
}

interface ServiceSchema extends Schema {
}

interface StructureSchema extends Schema {
}

export default class BackendStructure {
  private structure?: Record<string, AppStructureItem> = {};
  #structureHash: string | undefined;
  public globalState: any; // Add globalState property

  private databaseSchema?: DatabaseSchema = {};
  private services?: ServiceSchema = {};

  // Add versioning properties
  public major: number;
  public minor: number;
  public patch: number;
  
  constructor(projectPath: string, globalState?: any,  major: number = 1, minor: number = 0, patch: number = 0) {

    this.globalState = globalState;
    this.major = major;
    this.minor = minor;
    this.patch = patch;

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

 // Getter to access the private structureHash
  async getStructureHash(): Promise<string | number | undefined> {
    return this.#structureHash;
  }

  // Setter to safely update the private structureHash
  async setStructureHash(hash: string): Promise<void> {
    this.#structureHash = hash;
  }

  public async updateStructureHash(): Promise<void> {
    try {
      const structureArray = this.getStructureAsArray();
      const structureString = JSON.stringify(structureArray);
      const newStructureHash = hashString(structureString);
      
      // Update the private structureHash
      this.setStructureHash(await Promise.resolve(newStructureHash));
      
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
      const currentHash = await this.getStructureHash();
      await this.updateStructureHash(); // Update hash if needed
      const updatedHash = await this.getStructureHash();

      return (updatedHash ?? '').toString();
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
            draft: tue,
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


  /**
   * Convert the instance of BackendStructure into SecureMetadata.
   * This maps each property to a SecureField for security auditing.
   */
  toSecureMetadata(): SecureMetadata {
    return {
      structure: {
        value: this.structure,
        isSensitive: true,
        canView: false
      },
      structureHash: {
        value: this.#structureHash,
        isSensitive: true,
        canView: false
      },
      globalState: {
        value: this.globalState,
        isSensitive: false,
        canView: false
      },
      databaseSchema: {
        value: this.databaseSchema,
        isSensitive: true,
        canView: false
      },
      services: {
        value: this.services,
        isSensitive: false,
        canView: false
      },
      major: {
        value: this.major,
        isSensitive: false,
        canView: false
      },
      minor: {
        value: this.minor,
        isSensitive: false,
        canView: false
      },
      patch: {
        value: this.patch,
        isSensitive: false,
        canView: false
      },
    };
  }

  // Add a method to sanitize sensitive data
  /**
     * Sanitize the backend structure's metadata for a specific user role and access level.
     * @param userRole - The role of the user.
     * @param isAdmin - Whether the user is an admin.
     * @returns The sanitized backend structure.
     */
  sanitize(userRole: string, isAdmin: boolean): Partial<BackendStructure> {
    const secureMetadata = this.toSecureMetadata();
    const sanitizedMetadata = SecureFieldManager.sanitizeMetadata(secureMetadata, userRole, isAdmin);

    if (this.databaseSchema !== undefined) {
      // If the databaseSchema is defined, sanitize it
      sanitizedMetadata.databaseSchema = {
        value: sanitizeDatabaseSchema(this.databaseSchema, userRole, isAdmin),
        isSensitive: true,
        canView: false
      };
    } else {
      // If the databaseSchema is undefined, set it to an empty object
      sanitizedMetadata.databaseSchema = {
        value: {},
        isSensitive: true,
        canView: false
      };
      
    }
    // Rebuild sanitized BackendStructure
    return {
      globalState: sanitizedMetadata.globalState,
      major: sanitizedMetadata.major,
      minor: sanitizedMetadata.minor,
      patch: sanitizedMetadata.patch,
      databaseSchema: sanitizedMetadata.databaseSchema,
      services: sanitizedMetadata.services,
      structure: sanitizedMetadata.structure,
    } as Partial<BackendStructure>;
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
        versionData: [],
        latestVersion: createLatestVersion(), 
        lastUpdated: new Date(),
        timestamp: new Date(),
        history: [],
        major: 1, 
        minor: 0,
        patch: 0,
      };
    });
    return backendStructureItemsWithVersions;
  }
}

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const backendStructure: BackendStructure = new BackendStructure(projectPath);

export { backendStructure };




const state: Record<string, SecureField<any>> = {
  id: SecureFieldManager.createField("12345", false),
  apiKey: SecureFieldManager.createField("secret-api-key", true),
  createdBy: SecureFieldManager.createField("admin", true, true),
  config: SecureFieldManager.createField({ retries: 3 }, true),
  baseUrl: SecureFieldManager.createField("https://example.com", true),
};

// Security Audit Instance
const audit = new SecurityAudit();
const findings = audit.conductAudit(state);
audit.reviewFindings(findings);

// Sanitizing state for a user with limited permissions
const sanitizedState = SecureFieldManager.sanitizeMetadata(state, "user", false);
console.log("Sanitized State:", sanitizedState);

// Sanitizing state for an admin
const sanitizedAdminState = SecureFieldManager.sanitizeMetadata(state, "admin", true);
console.log("Sanitized Admin State:", sanitizedAdminState);

export const backend = {
  // ...backendStructure,
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
