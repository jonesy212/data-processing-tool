// systemConfigs.ts
export const SystemConfigs = {
    apiUrl: 'https://system.api.com',
    maxConnections: 10,
    retryConfig: {
        enabled: true,
        maxRetries: 3,
        retryDelay: 1000,
    },
    // Add more configurations as needed
    aquaConfig: {} as AquaConfig,  // Example addition for AquaConfig
    storeConfig: {} as StoreConfig,  // Example addition for StoreConfig
    backendDocumentConfig: backendDocumentConfig,  // Example addition for BackendDocumentConfig
    dataVersions: dataVersions,  // Example addition for DataVersionsConfig
    frontendDocumentConfig: frontendDocumentConfig,  // Example addition for FrontendDocumentConfig
    frontendStructure: frontendStructure,  // Example addition for FrontendStructure
    lazyLoadScriptConfig: {} as LazyLoadScriptConfig,  // Example addition for LazyLoadScriptConfig
};
