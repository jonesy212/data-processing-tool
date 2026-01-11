// ExtendedBackendStructure.ts
import responsiveDesignStore from "@/core/components/styling/ResponsiveDesign";
import { AppStructureItem } from '@/core/config/appStructure/AppStructure';
import { backendConfig } from "@/core/config/BackendConfig";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import BackendStructure from '@/core/server/database/BackendStructure';
import getAppPath from "./appPath";

class ExtendedBackendStructure<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BackendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Re-declare private field from parent class
  #structureHash: string | undefined;

  // Add any new properties
  public customProperty: string;
  public additionalConfig: Record<string, any>;

  constructor(
    projectPath: string,
    globalState?: any,
    major: number = 1,
    minor: number = 0,
    patch: number = 0,
    customOptions?: {
      customProperty?: string;
      additionalConfig?: Record<string, any>;
    }
  ) {
    super(projectPath, globalState, major, minor, patch);
    this.#structureHash = undefined; // Initialize private field
    this.customProperty = customOptions?.customProperty || '';
    this.additionalConfig = customOptions?.additionalConfig || {};
  }

  // Override traverseDirectory with custom implementation
  async traverseDirectory(dir: string): Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    // Check if parent method exists before calling
    if (super.traverseDirectory) {
      const result = await super.traverseDirectory(dir);
      // Your custom logic
      return result.map(item => ({
        ...item,
        customMetadata: this.additionalConfig
      }));
    }
    // Fallback behavior
    console.warn('Parent traverseDirectory not implemented');
    return [];
  }

  // Add new custom methods
  public async customMethod(): Promise<void> {
    await this.updateStructureHash();
    console.log('Custom method executed with hash:', this.#structureHash);
  }

  // Override other methods as needed
  public async getStructureHashAndUpdateIfNeeded(): Promise<string> {
    const hash = await super.getStructureHashAndUpdateIfNeeded();
    return `extended_${hash}`; // Custom hash prefix
  }

  // Ensure all abstract/required methods from parent are implemented
  public setDatabaseSchema(schema: Record<string, any>): void {
    super.setDatabaseSchema(schema);
    console.log('Schema set with extended validation');
  }

  // Add protected property accessors
  protected getStructureInternal(): any {
    return (this as any).structure;
  }

  protected setStructureInternal(structure: any): void {
    (this as any).structure = structure;
  }

  protected getDatabaseSchemaInternal(): any {
    return (this as any).databaseSchema;
  }

  protected setDatabaseSchemaInternal(schema: any): void {
    (this as any).databaseSchema = schema;
  }

  protected getServicesInternal(): any {
    return (this as any).services;
  }

  protected setServicesInternal(services: any): void {
    (this as any).services = services;
  }
}

// Create and initialize a proper ExtendedBackendStructure instance
async function initializeBackendStructure<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Promise<ExtendedBackendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {

  const projectPath = getAppPath(backendConfig.versionNumber, backendConfig.appVersion);

  // Create the ExtendedBackendStructure instance
  const instance = new ExtendedBackendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
    projectPath,
    responsiveDesignStore.backendStructure?.globalState,
    responsiveDesignStore.backendStructure?.major || 1,
    responsiveDesignStore.backendStructure?.minor || 0,
    responsiveDesignStore.backendStructure?.patch || 0,
    {
      customProperty: (responsiveDesignStore.backendStructure as any)?.customProperty || '',
      additionalConfig: (responsiveDesignStore.backendStructure as any)?.additionalConfig || {}
    }
  );

  // Initialize its internal state safely using protected methods
  try {
    if (responsiveDesignStore.backendStructure) {
      const structureHash = await responsiveDesignStore.backendStructure.getStructureHash();
      if (structureHash) {
        await instance.setStructureHash(structureHash);
      }
      
      // Use protected methods to access parent properties
      instance.setStructureInternal(
        await responsiveDesignStore.backendStructure.getStructure() || {}
      );
      instance.setDatabaseSchemaInternal(
        responsiveDesignStore.backendStructure.getDatabaseSchema() || {}
      );
      instance.setServicesInternal(
        responsiveDesignStore.backendStructure.getServices() || {}
      );
    } else {
      instance.setStructureInternal({});
      instance.setDatabaseSchemaInternal({});
      instance.setServicesInternal({});
    }
  } catch (error) {
    console.error("Initialization failed:", error);
    instance.setStructureInternal({});
    instance.setDatabaseSchemaInternal({});
    instance.setServicesInternal({});
  }

  return instance;
}

// Usage:
const backendStructure = await initializeBackendStructure();
// Usage example:
(async () => {
  const structure = await backendStructure.getStructure();
  console.log('Backend structure:', structure);
})();

export default ExtendedBackendStructure;