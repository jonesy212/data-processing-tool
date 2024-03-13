import { AquaConfig } from "../components/web3/web_configs/AquaConfig";
import { BackendConfig } from "../configs/BackendConfig";
import { DataVersions } from "../configs/DataVersionsConfig";
import { FrontendConfig } from "../configs/FrontendConfig";
import LazyLoadScriptConfig from "../configs/LazyLoadScriptConfig";
import BackendStructure from "../configs/appStructure/BackendStructure";

import  FrontendStructure  from "../configs/appStructure/FrontendStructureComponent";
import ShoppingCenterConfig from "../shopping_center/ShoppingCenterConfig";

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
  frontendStructure: {} as FrontendStructure,
  frontendDocumentConfig: {} as FrontendConfig,
  backendStructure: {} as BackendStructure,
  backendDocumentConfig: {} as BackendConfig,
  lazyLoadScriptConfig: {} as LazyLoadScriptConfig, // Example addition for LazyLoadScriptConfig
};
