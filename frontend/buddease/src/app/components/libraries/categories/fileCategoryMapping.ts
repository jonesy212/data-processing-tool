// fileCategoryMapping.ts
import { FileCategory, fileMapping } from "../../documents/FileType";
import { T } from "../../snapshots";
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
  // Function to process all snapshots and filter by file category
  function processSnapshotsByCategory(snapshot: Map<string, any>, category: FileCategory): void {
    snapshot.forEach((value, key) => {
      const extension = key.split('.').pop() || '';
      
      // Check if the file has a valid category and extension
      if (isValidFileCategory(key, extension)) {
        if (determineFileCategoryLogger(key, extension) === category) {
          // Process the file if it matches the category
          console.log(`Processing file: ${key}`);
          // Add your processing logic here
        } else {
          console.warn(`File: ${key} does not match the expected category: ${category}`);
        }
      } else {
        console.warn(`Invalid file category or extension for file: ${key}`);
      }
    });
  }



  function isValidFileCategory(fileName: string, extension: string): fileName is string {
    const category = determineFileCategoryLogger(fileName, extension);
    return category !== null;
  }








export {fileCategoryMapping, processSnapshotsByCategory}






// EXAMPE CODE
  // Function to get file extensions for a specific category
function getFileExtensionsForCategory(category: FileCategory): string[] {
    return fileCategoryMapping[category] || [];
  }
  
  // Example usage
  const componentExtensions = getFileExtensionsForCategory(FileCategory.Component);
  console.log(`File extensions for Component category: ${componentExtensions.join(", ")}`);