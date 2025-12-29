// systemConfigs.ts
import FrontendStructure from "@/core/config/appStructure/FrontendStructureComponent";
import { BackendConfig } from "@/core/config/BackendConfig";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { FrontendConfig } from "@/core/config/FrontendConfig";
import LazyLoadScriptConfig from "@/core/config/LazyLoadScriptConfig";
import { DataVersions } from "@/core/configs/DataVersionsConfig";
import { Attachment } from '@/core/documents/attachment/Attachment';
import BackendStructure from "@/core/server/database/BackendStructure";
import ShoppingCenterConfig from "@/core/shoppingCenter/ShoppingCenterConfig";
import { AppAttachment, AppEntity, AppExcludedFields, AppIncludedFields, AppK, AppMeta } from '@/core/typings/entities/AppEntity';
import { AquaConfig } from "@/utils/web3/webConfigs/aqua/AquaConfig";


export interface SystemConfigs <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>{
  apiUrl: string;
  maxConnections: number;
  retryConfig: {
    enabled?: boolean;
    maxRetries: number;
    retryDelay: number;
  };
  aquaConfig: AquaConfig;
  storeConfig: ShoppingCenterConfig;
  dataVersions: DataVersions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  frontendStructure: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  frontendDocumentConfig: FrontendConfig;
  backendStructure: BackendStructure;
  backendDocumentConfig: BackendConfig;
  lazyLoadScriptConfig: LazyLoadScriptConfig;
}

type ConfigFrontendStructure = FrontendStructure<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;


export const createSystemConfigs = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(configOverrides?: Partial<{
  apiUrl?: string;
  maxConnections?: number;
  retryConfig?: Partial<{
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
  }>;
  // Add other override options
}>) => ({
  apiUrl: "https://system.api.com",
  maxConnections: 10,
  retryConfig: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
    ...configOverrides?.retryConfig,
  },
  // Add more configurations as needed
  aquaConfig: {} as AquaConfig,
  storeConfig: {} as ShoppingCenterConfig,
  dataVersions: {} as DataVersions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  frontendStructure: {} as ConfigFrontendStructure,
  frontendDocumentConfig: {} as FrontendConfig,
  backendStructure: {} as BackendStructure,
  backendDocumentConfig: {} as BackendConfig,
  lazyLoadScriptConfig: {} as LazyLoadScriptConfig,
  ...configOverrides,
});

// Usage:
// const configs = createSystemConfigs<MyEntityType>({ maxConnections: 20 });