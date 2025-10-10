// configMethods.ts

import { InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { Snapshot } from "@/app/Snapshot";
import { SnapshotConfig } from "@/app/SnapshotConfig";
import SnapshotStore from "@/app/snapshotstore";
import { SnapshotStoreConfig } from "@/app/snapshotstoreConfig";
import { transformConfigOption, transformMappedData } from "./transformMethods";
import TransformMethods from "./transformMethods";


interface ConfigMethodsInterface<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  getConfigOptionAsync(): Promise<
    | string
    | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | null
  >;
  
  setConfigOption(
    option: string | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ): void;
  
  getConfig(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  setConfig(config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>): Promise<void>;

}


export class ConfigMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > 
  implements ConfigMethodsInterface<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

  protected config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> =
    Promise.resolve(null);

  constructor(initialConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    if (initialConfig) {
      this.config = Promise.resolve(initialConfig);
    }
  }
  public async setConfig(
    config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>
  ): Promise<void> {
    this.config = Promise.resolve(config);
    await this.initializeOptions(); // Match parent class behavior
  }

  public async getConfig(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    try {
      // ✅ DIRECT ACCESS - No need for getStore() method
      return await this.config;
    } catch (error) {
      console.error('Error retrieving config:', error);
      return null;
    }
  }

  // ✅ Add this method
  protected async initializeOptions(): Promise<void> {
    const cfg = await this.getConfig();
    if (cfg) {
      // perform any initialization logic with cfg.options
      // e.g., this.options = cfg.options or other setup
      console.log("Initializing options from config:", cfg.options);
    }
  }

  public async getConfigOptionAsync(): Promise<
    | string
    | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | null
  > {
    const config = await this.getConfig();
    return config?.configOption ?? null;
  }

  public async setConfigOption(
    option: string | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ): Promise<void> {
    const currentConfig = await this.getConfig();
    const updatedConfig = {
      ...currentConfig,
      configOption: option
    } as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
    this.setConfig(updatedConfig);
  }
}

// Apply store configuration
export function applyStoreConfig<U, T extends BaseDataEntity>(
  snapshot: Snapshot<any, any>,
  snapshotStoreConfig?: SnapshotStoreConfig<any, any>
) {
  if (!snapshotStoreConfig) return snapshot;

  // Apply initial state
  if (snapshotStoreConfig.initialState) {
    snapshot.initialState = snapshotStoreConfig.initialState as InitializedState<U, T>;
  }

  // Apply configOption
  if (snapshotStoreConfig.configOption) {
    snapshot.configOption = TransformMethods.transformConfigOption(snapshotStoreConfig.configOption);
  }

  // Apply mappedData
  if (snapshotStoreConfig.mappedData) {
    const entries = snapshotStoreConfig.mappedData.entries();
    const mappedDataArray: [string, Snapshot<any, any>][] = [];

    for (const [key, value] of entries) {
      const transformedValue =TransformMethods.transformMappedData(value);
      mappedDataArray.push([key, transformedValue]);
    }

    snapshot.mappedSnapshotData = new Map(mappedDataArray);
  }

  return snapshot;
}

export type { ConfigMethodsInterface };