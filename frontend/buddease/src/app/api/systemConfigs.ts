import BackendStructure from "@/config/FrontendConfigkendStructure";
import LazyLoadScriptConfig from "@/app/components/configs/LazyLoadScriptConfig";
import { AquaConfig } from "@/app/utils/web3/webConfigs/AquaConfig";
import { BackendConfig } from "@/config/BackendConfig";
import { DataVersions } from "@/configs/DataVersionsConfig";
import { FrontendConfig } from "@/configs/FrontendConfig";

import ShoppingCenterConfig from "@/app/shoppingCenter/ShoppingCenterConfig";
import FrontendStructure from "@/configs/appStructure/FrontendStructureComponent";

// systemConfigs.ts
export const SystemConfigs = {
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
  frontendStructure: {} as FrontendStructure<T, K>,
  frontendDocumentConfig: {} as FrontendConfig,
  backendStructure: {} as BackendStructure,
  backendDocumentConfig: {} as BackendConfig,
  lazyLoadScriptConfig: {} as LazyLoadScriptConfig, // Example addition for LazyLoadScriptConfig
};
