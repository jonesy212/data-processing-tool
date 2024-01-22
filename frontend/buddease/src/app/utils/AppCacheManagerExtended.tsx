import AppCacheManagerBase, { ExtendedData } from "./AppCacheManager";

// Example class extending the generic base class with ExtendedData
class AppCacheManagerExtended extends AppCacheManagerBase<ExtendedData> {
  // Implement the abstract method for ExtendedData
  async updateCache(key: string, data: ExtendedData): Promise<void> {
    // Implementation...
  }

  // Add more methods specific to ExtendedData...
}

export default AppCacheManagerExtended;
