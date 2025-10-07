import BackendStructure from "@/server/database/BackendStructure";
import LazyLoadScriptConfig from "@/app/components/configs/LazyLoadScriptConfig";
import { AquaConfig } from "@/app/utils/web3/webConfigs/aqua/AquaConfig";
import { BackendConfig } from "@/config/BackendConfig";
import { DataVersions } from "@/configs/DataVersionsConfig";
import { FrontendConfig } from "@/configs/FrontendConfig";

import ShoppingCenterConfig from "@/app/shoppingCenter/ShoppingCenterConfig";
import FrontendStructure from "@/configs/appStructure/FrontendStructureComponent";


type ConfigFrontendStructure = FrontendStructure<any, any, any, any, any, any>;

// systemConfigs.ts
export const SystemConfigs < 
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  apiUrl: "https://system.api.com",
  maxConnections: 10,
  retryConfig: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  // Add more configurations as needed
  aquaConfig: {} as AquaConfig, // Example addition for AquaConfig
  storeConfig: {} as ShoppingCenterConfig, // Example addition for StoreConfig
  dataVersions: {} as DataVersions, // Example addition for DataVersions
  frontendStructure: {} as ConfigFrontendStructure,
  frontendDocumentConfig: {} as FrontendConfig,
  backendStructure: {} as BackendStructure,
  backendDocumentConfig: {} as BackendConfig,
  lazyLoadScriptConfig: {} as LazyLoadScriptConfig, // Example addition for LazyLoadScriptConfig
};
