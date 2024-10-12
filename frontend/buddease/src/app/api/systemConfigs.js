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
    aquaConfig: {},
    storeConfig: {},
    dataVersions: {},
    frontendStructure: {},
    frontendDocumentConfig: {},
    backendStructure: {},
    backendDocumentConfig: {},
    lazyLoadScriptConfig: {},
};
