class AppCacheManager {
    private backendCacheManager: CacheManager;
    private frontendCacheManager: FrontendCacheManager;
  
    constructor() {
      this.backendCacheManager = new CacheManager();
      this.frontendCacheManager = new FrontendCacheManager();
    }
  
    // Additional methods for coordinating both cache managers, if needed
  }
  
  // Example usage
  const appCacheManager = new AppCacheManager();
  appCacheManager.updateBackendCache(backendData);
  appCacheManager.updateFrontendCache(frontendData);
  