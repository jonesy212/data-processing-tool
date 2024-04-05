"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigs = void 0;
// systemConfigs.ts
exports.SystemConfigs = {
    apiUrl: "https://system.api.com",
    maxConnections: 10,
    retryConfig: {
        enabled: true,
        maxRetries: 3,
        retryDelay: 1000,
    },
    // Add more configurations as needed
    aquaConfig: {}, // Example addition for AquaConfig
    storeConfig: {}, // Example addition for StoreConfig
    dataVersions: {}, // Example addition for DataVersions
    frontendStructure: {},
    frontendDocumentConfig: {},
    backendStructure: {},
    backendDocumentConfig: {},
    lazyLoadScriptConfig: {}, // Example addition for LazyLoadScriptConfig
};
