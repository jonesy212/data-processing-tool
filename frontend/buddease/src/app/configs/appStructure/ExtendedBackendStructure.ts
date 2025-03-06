// ExtendedBackendStructure.ts
import { AppStructureItem } from './AppStructure';
import BackendStructure from './BackendStructure';

class ExtendedBackendStructure extends BackendStructure {
  // Override traverseDirectory for customization
  async traverseDirectory(dir: string): Promise<AppStructureItem[]> {
  // Call the parent class's traverseDirectory method (fallback to empty array if undefined)
  const originalFiles = (await super.traverseDirectory?.(dir)) || [];
    
    // Add custom logic or modifications to the result
    const modifiedFiles = originalFiles.map((file) => {
      // Custom modifications
      return file;
    });

    return modifiedFiles;
  }

  // Users can add additional protected methods as needed
  async customMethod(): Promise<void> {
    // Custom implementation
    // ...
  }
}




export default ExtendedBackendStructure;
