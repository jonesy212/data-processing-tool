// systemConfigs.ts
import LazyLoadScriptConfig from "@/app/components/configs/LazyLoadScriptConfig";
import { AquaConfig } from "@/app/utils/web3/webConfigs/aqua/AquaConfig";
import { BackendConfig } from "@/config/BackendConfig";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { FrontendConfig } from "@/config/FrontendConfig";
import { DataVersions } from "@/configs/DataVersionsConfig";
import BackendStructure from "@/server/database/BackendStructure";

import { Attachment } from '@/app/documents/attachment/Attachment';

import ShoppingCenterConfig from "@/app/shoppingCenter/ShoppingCenterConfig";
import FrontendStructure from "@/config/appStructure/FrontendStructureComponent";



export interface SystemConfigs {
  apiUrl: string;
  maxConnections: number;
  retryConfig: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
  };
  aquaConfig: AquaConfig;
  storeConfig: ShoppingCenterConfig;
  dataVersions: DataVersions<any, any, any, any, any, any>;
  frontendStructure: FrontendStructure<any, any, any, any, any, any>;
  frontendDocumentConfig: FrontendConfig;
  backendStructure: BackendStructure;
  backendDocumentConfig: BackendConfig;
  lazyLoadScriptConfig: LazyLoadScriptConfig;
}


type ConfigFrontendStructure = FrontendStructure<any, any, any, any, any, any>;




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