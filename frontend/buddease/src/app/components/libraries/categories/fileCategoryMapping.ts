// fileCategoryMapping.ts
import { BaseData } from '@/app/components/models/data/Data';
import { FileCategory, fileMapping } from "../../documents/FileType";
import { determineFileCategoryLogger } from "../../logging/determineFileCategoryLogger";
import { T } from "../../models/data/dataStoreMethods";
import { Snapshot } from "../../snapshots";
import { getAllSnapshotEntries } from "../../snapshots/getSnapshotEntries";
// Define a mapping of file categories to their corresponding snapshot entries
const fileCategoryMapping: { [category in FileCategory]: string[] } = {
    [FileCategory.Component]: ["tsx", "jsx"],
    [FileCategory.Redux]: ["ts"],
    [FileCategory.MobX]: ["ts"],
    [FileCategory.API]: ["ts"],
    [FileCategory.Utility]: ["ts"],
    [FileCategory.Config]: ["ts", "json", "yaml", "yml"],
    [FileCategory.Test]: ["ts", "tsx", "test.ts", "test.tsx"],
    [FileCategory.Documentation]: ["md", "pdf"],
    [FileCategory.Design]: ["xd", "fig", "sketch"],
    [FileCategory.Multimedia]: [
      "png", "jpg", "jpeg", "gif", "svg", "mp4", "avi", "mov", "wav", "mp3"
    ],
    [FileCategory.Configuration]: ["json", "yaml", "yml"],
    [FileCategory.Analytics]: ["csv", "xls", "xlsx"],
    [FileCategory.Localization]: ["json", "po", "pot"],
    [FileCategory.SmartContract]: ["sol"],
    [FileCategory.Bytecode]: ["evm"],
    [FileCategory.EthereumPackage]: ["ethpkg"],
    [FileCategory.JWT]: ["jwt"],
    [FileCategory.BlockchainData]: ["blk"],
    [FileCategory.CryptoKey]: ["key"],
    [FileCategory.Wallet]: ["wallet"],
    [FileCategory.Hash]: ["hash"],
    [FileCategory.MerkleProof]: ["proof"],
    [FileCategory.ENS]: ["ens"],
  };
 



  // Function to filter snapshot entries by category
function getEntriesByCategory(snapshot: Map<string, T>, category: FileCategory): Map<string, T> {
    const entries = new Map<string, T>();
    const extensions = fileCategoryMapping[category];
    
    snapshot.forEach((value, key) => {
      const fileInfo = fileMapping[key];
      if (fileInfo && fileInfo.category === category && extensions.includes(fileInfo.type)) {
        entries.set(key, value);
      }
    });
    
    return entries;
}

  
// Integrated function to process all snapshots and filter by file category
function processSnapshotsByCategory<T extends  BaseData<any>>(
  snapshot: Snapshot<T, any>,
  category: FileCategory
): Snapshot<T, any> | undefined {
  // Check if snapshot data is a valid Map
  if (snapshot && snapshot.data instanceof Map) {
    const filteredEntries = getEntriesByCategory(snapshot.data, category);
    
    // Check if there are any filtered entries
    if (filteredEntries.size > 0) {
      console.log(`Processing ${filteredEntries.size} files in the category: ${category}`);

      // Iterate over the filtered entries
      filteredEntries.forEach((value, key) => {
        const extension = key.split('.').pop() || '';

        // Check if the file category is valid and matches the specified category
        if (isValidFileCategory(key, extension)) {
          const determinedCategory = determineFileCategoryLogger(key, extension);
          if (determinedCategory === category) {
            console.log(`Processing file: ${key}`);
            // Add your custom processing logic here (e.g., updating data, logging)
          } else {
            console.warn(`File: ${key} does not match the expected category: ${category}`);
          }
        } else {
          console.warn(`Invalid file category or extension for file: ${key}`);
        }
      });
    } else {
      console.warn(`No entries found for the category: ${category}`);
    }

    // Return the original snapshot or a modified version if needed
    return snapshot;
  } else {
    console.warn("Snapshot is not a valid Map-like structure");
    return undefined;
  }
}


function isValidFileCategory(fileName: string, extension: string): fileName is string {
  const category = determineFileCategoryLogger(fileName, extension);
  return category !== null;
}




export { fileCategoryMapping, getEntriesByCategory, processSnapshotsByCategory };









// EXAMPE CODE
  // Function to get file extensions for a specific category
function getFileExtensionsForCategory(category: FileCategory): string[] {
    return fileCategoryMapping[category] || [];
}
  
// Example usage
const componentExtensions = getFileExtensionsForCategory(FileCategory.Component);
console.log(`File extensions for Component category: ${componentExtensions.join(", ")}`);


  // Example usage of getAllSnapshotEntries
const allEntries = getAllSnapshotEntries(); // Get all entries
allEntries.forEach((snapshotMap) => {
  const processedSnapshot = processSnapshotsByCategory(snapshotMap, FileCategory.Component);
  if (processedSnapshot) {
    console.log("Processed snapshot successfully.");
  }
});